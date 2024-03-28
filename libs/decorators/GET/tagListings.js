import contexts from '../../../data/locales/contexts.js'
import { logger } from '../../../utils.js'
import queries from '../../services/external-apis/mongo-queries.js'
import { to } from '../../services/routines/code.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'

export default (fastify, type) => {
    const { redis } = fastify
    const QInstance = new queries(redis, new logger(fastify).log)
    /**
     *
     * @param {Types.RequestExtended} req
     * @param {Types.ReplyExtended} reply
     */
    return async (req, reply) => {
        const tag = req.params.tag
        const [err, listings] = await to(QInstance.getListingsByTag(tag, type, req.pagination))
        if (err) {
            req.log.error(`index/tag#getListingsByTag: ${err.message}`)
            return reply.blabla([{}, contexts.message_, contexts.message.SERVER_ERROR], req)
        }
        const { page, perPage } = req.pagination
        const data = {
            context: Types.Contexts.Index,
            current: page,
            listings: listings.documents,
            pages: Math.ceil(listings.count / perPage),
            subtitle: tag,
        }
        return reply.blabla([data, contexts.index_, contexts.index.tags], req)
    }
}
