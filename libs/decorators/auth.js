// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'

/**
 * @param {Types.FastifyExtended} fastify
 */
export default function authAdapter(fastify) {
    let auth, adminAuth
    auth = fastify.auth([fastify.verifyJWT('regular')])
    adminAuth = fastify.auth([fastify.verifyJWT('admin')])
    return { adminAuth, auth }
}
