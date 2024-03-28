/**
 * THIS DECORATOR simply a refactoring of
 * ```
 *  fastify.get('/login', function (req, reply) {
 *      reply.blabla([{}, 'login', 'login'], req)
 *  })
 *
 *  // into this =>
 *
 *  fastify.goGet('login')
 * ```
 * 'this' refers to Fastify instance
 */

// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'

/**
 * @param {import('fastify').RouteShorthandOptions} [preHandler]
 * @param {string} route
 */
export function goGet(route, preHandler) {
    /**
     * @param {Types.RequestExtended} req
     * @param {Types.ReplyExtended} reply
     */
    async function getter(req, reply) {
        return reply.blabla([{}, route, route], req)
    }
    if (preHandler) this.get(`/${route}`, preHandler, getter)
    else this.get(`/${route}`, getter)
}
