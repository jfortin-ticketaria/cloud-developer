import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import * as middy from "middy"

const logger = createLogger('auth')

// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-tsfnpm85.us.auth0.com/.well-known/jwks.json'

export const handler = middy(async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
});

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  const signingKey = await getSigningKey(jwt.header.kid);
  return verify(token, signingKey.publicKey, { algorithms: ['RS256'] }) as JwtPayload

}

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}

async function getSigningKey(kid : String) {
  const resp = await Axios.get(jwksUrl, {headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      'Access-Control-Allow-Credentials': true,
    }});

  const keys = resp.data.keys;

  const signingKeys = keys
      .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signature verification
          && key.kty === 'RSA' // We are only supporting RSA (RS256)
          && key.kid           // The `kid` must be present to be useful for later
          && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
      ).map(key => {
        return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
      });

  if (!signingKeys.length) {
    throw new Error('The JWKS endpoint did not contain any signature verification keys');
  }

  const signingKey = signingKeys.find(key => key.kid === kid);
  if(!signingKey){
    throw new Error('Invalid signing keys')
    logger.error("No signing keys found")
  }

  return signingKey
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
