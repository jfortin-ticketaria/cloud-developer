// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'a4km1etwwf'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-tsfnpm85.us.auth0.com',            // Auth0 domain
  clientId: 'edUOrm53vrudPklwZNGte5ew9J56VJ1Y',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
