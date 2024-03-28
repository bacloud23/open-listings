import contexts from '../../../data/locales/contexts.js'
import { config, logger } from '../../../utils.js'
import queries from '../../services/external-apis/mongo-queries.js'
import { to } from '../../services/routines/code.js'
import * as Crypto from '../../services/routines/crypto.js'
import * as Strings from '../../services/routines/strings.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'

/**
 * @param {Types.FastifyExtended} fastify
 */
export default (fastify) => {
    const { redis } = fastify
    const QInstance = new queries(redis, new logger(fastify).log)
    const key = Crypto.passwordDerivedKey(fastify.conf('PASSWORD'))
    /**
     *
     * @param {Types.RequestExtended} req
     * @param {Types.ReplyExtended} reply
     */
    return async (req, reply) => {
        const viewer = req.session.get('user') ? req.session.get('user').username : ''
        const mongoHex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
        const isIdValid = config('IS_MONGO_DB') ? mongoHex.test(req.params.id) : true
        const [err, elem] = isIdValid
            ? await to(QInstance.getListingById(req.params.id, req.session.get('role') === 'admin', viewer))
            : ['NOT_FOUND', undefined]

        if (err === 'NOT_FOUND' || !elem) return reply.blabla([{}, contexts.message_, contexts.message.NOT_FOUND], req)

        if (err) {
            req.log.error(`get/id#getListingById: ${err.message}`)

            return reply.blabla([{}, contexts.message_, contexts.message.SERVER_ERROR], req)
        }

        const author = elem.usr === viewer
        elem.email = Crypto.encrypt(key, elem.usr)
        elem.usr = elem.usr ? Strings.initials(elem.usr) : 'YY'
        let data = { author, data: elem, section: elem.section }

        return reply.blabla([data, contexts.listing_, contexts.listing.id], req)
    }
}
