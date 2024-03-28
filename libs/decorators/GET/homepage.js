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
        const [err2, topTags] = await to(QInstance.topBy('div'))
        if (err) {
            throw err
        }
        const { page, perPage } = req.pagination
        const data = {
            listings: listings.documents,
            ...(!(err2 || topTags.length === 0) ? { components: { tags: topTags } } : {}),
            addressPoints: [],
            context: Types.Contexts.Index,
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        data.addressPoints = listings.documents.map((a) => {
            return [a.lat, a.lng, a.title, a._id, a.section]
        })
        return reply.blabla([data, contexts.index_, contexts.index.listings], req)
    }
}
