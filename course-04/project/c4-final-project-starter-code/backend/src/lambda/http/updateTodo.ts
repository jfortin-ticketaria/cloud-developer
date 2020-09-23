import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('todos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Starting update todo`)
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    logger.info(`Creating todo for user id ${userId}`)
    logger.info(JSON.stringify({ ...updatedTodo, todoId }))

    await updateTodo(todoId, updatedTodo, userId)

    return {
      statusCode: 200,
      body: null
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
