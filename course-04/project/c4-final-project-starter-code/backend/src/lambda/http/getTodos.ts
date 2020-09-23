import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getAllTodos } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('todos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    logger.info(`Getting all todos for user id : ${userId}`)
    const todos = await getAllTodos(userId)
    return Promise.resolve({
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    })
  }
)

handler.use(
  cors({
    credentials: true
  })
)
