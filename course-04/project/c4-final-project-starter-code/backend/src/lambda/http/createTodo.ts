import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const userId = getUserId(event)
    const logger = createLogger('todos')
    logger.info(`Creating todo for user id ${userId}`)
    logger.info(newTodo)

    if (!newTodo.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Name must not be empty' })
      }
    }

    const body = await createTodo(newTodo, userId)
    return {
      statusCode: 200,
      body: JSON.stringify({ item: body })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
