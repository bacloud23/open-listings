import { logger, NODE_ENV } from '../../../utils.js'
import queries from '../../services/external-apis/mongo-queries.js'
import { safeText } from '../../services/external-apis/safe-text.js'
import { to } from '../../services/routines/code.js'
import { formatAjvToLocals } from '../utils/blabla.js'
import { setFlowSession } from '../utils/flowSessions.js'

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
        let data = { addressPoints: [], context: Types.Contexts.Gwoogl, crossLangListings: [], listings: [] }

        if (req.validationError && req.validationError.validation) {
            const warnings = formatAjvToLocals(req.validationError, req)
            req.log.error(`search#gwoogl: validation error`)
            reply.statusCode = 500
            reply.header('Content-Type', 'application/json; charset=utf-8')
            reply.send({ error: warnings })
            return reply
        }
        setFlowSession(req, '/search/gwoogl')

        /** @type Types.gwooglSchema */
        const body = req.body
        const { clean, language } = safeText({
            text: body.title_desc,
        })

        const lang = language
        let [err, listings] = await to(
            QInstance.gwoogl(clean, body.exact, body.div_q, body.section, lang, req.pagination),
        )
        if (err) {
            req.log.error(`search#gwoogl: ${err.message}`)
            reply.statusCode = 500
            reply.header('Content-Type', 'application/json; charset=utf-8')
            reply.send({ error: [req.t('generic.error.server')] })
            return reply
        }
        const { page, perPage } = req.pagination
        Object.assign(data, {
            crossLangListings: listings.crossLangDocs,
            current: page,
            listings: listings.documents,
            pages: Math.ceil(listings.count / perPage),
            section: body.section,
        })

        if (NODE_ENV === 'api') return data

        return reply.view('./pages/listings_parser_forker', data)
    }
}
