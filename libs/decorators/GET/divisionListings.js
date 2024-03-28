import contexts from '../../../data/locales/contexts.js'
import { logger } from '../../../utils.js'
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
        const division = req.params.division
        const [err, listings] = await to(QInstance.getListingsByDivision(division, req.pagination))
        if (err) {
            req.log.error(`index/division#getListingsByDivision: ${err.message}`)
            return reply.blabla([{}, contexts.message_, contexts.message.SERVER_ERROR], req)
        }
        const { page, perPage } = req.pagination
        const data = {
            context: Types.Contexts.Index,
            current: page,
            listings: listings.documents,
            pages: Math.ceil(listings.count / perPage),
            subtitle: division,
        }

        return reply.blabla([data, contexts.index_, contexts.index.division], req)
    }
}
