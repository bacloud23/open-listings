import { config, logger } from '../../../utils.js'
import queries from '../../services/external-apis/mongo-queries.js'
import { to } from '../../services/routines/code.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'

/**
 * @param {Types.FastifyExtended} fastify
 */
export default (fastify) => {
    const { redis } = fastify
    const QInstance = new queries(redis, new logger(fastify).log)
    /**
     *
     * @param {Types.RequestExtended} req
     * @param {Types.ReplyExtended} reply
     */
    return async (req, reply) => {
        const viewer = req.session.get('user').username
        const mongoHex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
        const isIdValid = config('IS_MONGO_DB') ? mongoHex.test(req.params.id) : true

        const [err, elem] = isIdValid
            ? await to(QInstance.deleteListingById(req.params.id, req.session.get('role') === 'admin', viewer))
            : ['NOT_FOUND', undefined]

        if (err === 'NOT_FOUND' || !elem) {
            req.log.error(`get/id#deleteListingById: ${err}`)
            throw new Error('kaboom')
        }
        if (err) {
            req.log.error(`get/id#deleteListingById: ${err.message}`)
            throw new Error('kaboom')
        }

        return reply.redirect('/listings/user')
    }
}
