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
        if (req.session['lastQueries']) req.session['lastQueries'] = {}
        const section = req.url.split('/')[2].split('?')[0]
        const [err, listings] = await to(
            QInstance.getListingsSince(100, section, req.session.get('role') === 'admin', req.pagination),
        )
        const [err2, topTags] = await to(QInstance.topTags())

        if (err) {
            return reply.blabla([{}, contexts.message_, contexts.message.SERVER_ERROR], req)
        }
        const { page, perPage } = req.pagination
        const data = {
            context: Types.Contexts.Listings,
            listings: listings.documents,
            section: section,
            ...(!(err2 || Object.keys(topTags).length === 0) ? { components: { tags: topTags[section] } } : {}),
            addressPoints: [],
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        data.addressPoints = listings.documents.map((a) => {
            return [a.lat, a.lng, a.title, a._id, a.section]
        })

        return reply.blabla([data, 'listings', section], req)
    }
}
