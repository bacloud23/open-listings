import perPage from '../../../config/options/perPage.js'
import { logger, NODE_ENV } from '../../../utils.js'
import queries from '../../services/external-apis/mongo-queries.js'
import { to } from '../../services/routines/code.js'
import { getFlowSession } from '../utils/flowSessions.js'

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
        const page = parseInt(req.params.p) || 1
        const pagination = { page, perPage: perPage(Types.Contexts.Geolocation) }
        let data = { addressPoints: [], context: Types.Contexts.Geolocation, listings: [] }
        let cachedPostBody = getFlowSession(req, '/search/geolocation')
        if (!cachedPostBody) {
            req.log.error(`search#text: no previous cached request`)
            reply.statusCode = 500
            reply.header('Content-Type', 'application/json; charset=utf-8')
            reply.send({ error: [req.t('generic.error.server')] })
            return reply
        }
        let [err, listings] = await to(
            QInstance.getListingsByGeolocation(
                cachedPostBody.lat,
                cachedPostBody.lng,
                cachedPostBody.section,
                pagination,
            ),
        )
        if (err) {
            req.log.error(`search#geolocation: ${err.message}`)
            reply.statusCode = 500
            reply.header('Content-Type', 'application/json; charset=utf-8')
            reply.send({ error: [req.t('generic.error.server')] })
            return reply
        }
        Object.assign(data, {
            current: pagination.page,
            listings: listings.documents,
            pages: Math.ceil(listings.count / pagination.perPage),
            section: cachedPostBody.section,
        })

        if (NODE_ENV === 'api') return data
        return reply.view('./pages/listings_parser_forker', data)
    }
}
