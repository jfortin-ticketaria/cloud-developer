import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { deleteTodo } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const logger = createLogger('todos')
    logger.info(`Deleting todo ${todoId} for user id ${userId}`)

    await deleteTodo(todoId, userId)
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
