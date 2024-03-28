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

        const [err, listings] = await to(
            QInstance.getListingsSince(20, '', req.session.get('role') === 'admin', req.pagination),
        )
        const [err2, topTags] = await to(QInstance.topTags())
        if (err) {
            req.log.error(`listings#: ${err.message}`)
            reply.blabla([{}, contexts.message_, contexts.message.SERVER_ERROR], req)

            return reply
        }
        const { page, perPage } = req.pagination
        const data = {
            context: Types.Contexts.AllListings,
            listings: listings.documents,
            section: '',
            ...(!(err2 || Object.keys(topTags).length === 0) ? { components: { tags: topTags } } : {}),
            addressPoints: [],
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        reply.blabla([data, contexts.listings_, contexts.listings.listings], req)

        return reply
    }
}