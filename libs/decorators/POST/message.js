import contexts from '../../../data/locales/contexts.js'
import { config, logger } from '../../../utils.js'
import { Actions } from '../../constraints/constants.js'
import queries from '../../services/external-apis/mongo-queries.js'
import { safeText } from '../../services/external-apis/safe-text.js'
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
     * // TODO: make schema validation for messages
     *
     * @param {Types.RequestExtended} req
     * @param {Types.ReplyExtended} reply
     */
    return async (req, reply) => {
        // basic validation based on Fastify schema
        if (req.validationError) {
            reply.blabla([{}, contexts.message_, contexts.message.VALIDATION_ERROR], req)

            return reply
        }

        /** @type Types.MessageSchema */
        const body = req.body

        const mongoHex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
        // TODO: fix messaging system
        let receiver = Crypto.decrypt(key, body.email)

        const isIdValid = config('IS_MONGO_DB') ? mongoHex.test(body.id || '') : true
        const [err, elem] = isIdValid
            ? await to(QInstance.getListingById(body.id, req.session.get('role') === 'admin', receiver))
            : ['NOT_FOUND', undefined]
        if (err) {
            // TODO: revise later template
            req.log.error(`post/sendMessage#getListingById: ${err.message}`)
            reply.blabla([{}, contexts.message_, contexts.message.SERVER_ERROR], req)

            return reply
            // throw new Error('Kaboom')
        }
        if (!elem) {
            // TODO: revise later template
            reply.blabla([{}, contexts.message_, contexts.message.SERVER_ERROR], req)

            return reply
            // throw new Error('Kaboom')
        }
        if (req.validationError?.validation) {
            // TODO: revise later template
            // reply.blabla([{ data: elem }, contexts.listing_, contexts.listing.contact], req)
            // return reply
            // throw new Error('Kaboom')
        }

        const { clean, language, text } = safeText({
            text: body.message,
        })

        const message = {
            cmsg: clean,
            from: req.session.get('user').username,
            lang: language,
            message: text,
            sent: new Date(),
            thread: elem.title,
            threadId: body.id,
            to: receiver,
        }
        const [error, id] = await to(QInstance.insertComment(message))
        if (error) {
            req.log.error(`post/sendMessage#getListingById: ${error.message}`)
            reply.blabla([{}, contexts.message_, contexts.message.SERVER_ERROR], req)

            return reply
        }
        let data = {}
        elem.email = Crypto.encrypt(key, elem.usr)
        elem.usr = elem.usr ? Strings.initials(elem.usr) : 'YY'
        data = { data: elem, section: elem.section }
        fastify.happened(Actions.send_message, 'listings#sendMessage', { reply, req })

        return reply.redirect('/listings/user/notifications')
        // reply.blabla([data, contexts.listing_, contexts.listing.contact], req)

    }
}
