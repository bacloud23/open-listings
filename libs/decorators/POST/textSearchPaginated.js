import perPage from '../../../config/options/perPage.js'
import { logger, NODE_ENV } from '../../../utils.js'
import queries from '../../services/external-apis/mongo-queries.js'
import { safeText } from '../../services/external-apis/safe-text.js'
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
        let err, listings
        const page = parseInt(req.params.p) || 1
        const pagination = { page, perPage: perPage(Types.Contexts.Gwoogl) }
        const section = req.url.split('/')[5]
        let data = { addressPoints: [], context: Types.Contexts.Gwoogl, crossLangListings: [], listings: [] }
        let cachedPostBody = getFlowSession(req, '/search/gwoogl')
        if (!cachedPostBody) {
            // Initial landing on the listings page without query (not really a POST request)
            ;[err, listings] = await to(
                QInstance.getListingsSince(100, section, req.session.get('role') === 'admin', pagination),
            )
            if (err) {
                req.log.error(`search#gwoogl: ${err.message}`)
                reply.statusCode = 500
                reply.header('Content-Type', 'application/json; charset=utf-8')
                reply.send({ error: [req.t('generic.error.server')] })
                return reply
            }
            // req.log.error(`search#text: no previous cached request`)
            // reply.statusCode = 500
            // reply.header('Content-Type', 'application/json; charset=utf-8')
            // reply.send({ error: [req.t('generic.error.server')] })
            // return reply
        } else {
            const { clean, language } = safeText({
                text: cachedPostBody.title_desc,
            })

                ;[err, listings] = await to(
                    QInstance.gwoogl(
                        clean,
                        cachedPostBody.exact,
                        cachedPostBody.div_q,
                        cachedPostBody.section,
                        language,
                        pagination,
                    ),
                )

            if (err) {
                req.log.error(`search#gwoogl: ${err.message}`)
                reply.statusCode = 500
                reply.header('Content-Type', 'application/json; charset=utf-8')
                reply.send({ error: [req.t('generic.error.server')] })
                return reply
            }
        }

        Object.assign(data, {
            crossLangListings: listings.crossLangDocs,
            current: pagination.page,
            listings: listings.documents,
            pages: Math.ceil(listings.count / pagination.perPage),
            section: section || cachedPostBody.section,
        })

        if (NODE_ENV === 'api') return data

        return reply.view('./pages/listings_parser_forker', data)
    }
}
