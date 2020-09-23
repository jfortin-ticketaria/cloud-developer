import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { generateUploadUrl, updateTodoUrl } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const logger = createLogger('todos')

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    logger.info(`Generating url for todo ${todoId} for user id ${userId}`)

    const uploadUrl = generateUploadUrl(todoId)

    const attachmentUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${todoId}`

    await updateTodoUrl(attachmentUrl, todoId, userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
