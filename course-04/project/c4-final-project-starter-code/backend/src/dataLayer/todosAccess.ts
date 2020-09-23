import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTableName = process.env.TODO_TABLE,
    private readonly todosTableIdIndex = process.env.TODO_TABLE_INDEX,
    private readonly todosTableIndexByUser = process.env.TODO_TABLE_BY_USER
  ) {}

  async getTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todosTableName,
        IndexName: this.todosTableIndexByUser,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTableName,
        Item: todo
      })
      .promise()

    return todo
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.todosTableName,
        Key: {
          [this.todosTableIdIndex]: todoId
        },
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ConditionExpression: 'userId = :userId',
        ReturnValues: 'NONE'
      })
      .promise()
  }

  generateUploadUrl(todoId: string) {
    const bucketName = process.env.S3_BUCKET
    const urlExpiration = process.env.SIGNED_URL_EXPIRATION

    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: urlExpiration
    })
  }

  async updateTodo(
    todoId: string,
    userId: string,
    todoRequest: UpdateTodoRequest
  ): Promise<void> {
    await this.docClient
      .update({
        TableName: this.todosTableName,
        Key: {
          [this.todosTableIdIndex]: todoId
        },
        UpdateExpression: 'SET dueDate= :dd, #nm = :n, done = :done',
        ExpressionAttributeNames: {
          '#nm': 'name'
        },
        ExpressionAttributeValues: {
          ':n': todoRequest.name,
          ':dd': todoRequest.dueDate,
          ':done': todoRequest.done,
          ':userId': userId
        },
        ConditionExpression: 'userId = :userId',
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()
  }

  async updateTodoUrl(
    url: string,
    todoId: string,
    userId: string
  ): Promise<void> {
    await this.docClient
      .update({
        TableName: this.todosTableName,
        Key: {
          [this.todosTableIdIndex]: todoId
        },
        UpdateExpression: 'SET attachmentUrl = :url',
        ExpressionAttributeValues: {
          ':url': url,
          ':userId': userId
        },
        ConditionExpression: 'userId = :userId',
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
