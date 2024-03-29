import { createRequire } from 'module'
import { NODE_ENV } from '../../utils.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'

const require = createRequire(import.meta.url)
const localize = {
    ar: require('ajv-i18n/localize/ar'),
    en: require('ajv-i18n/localize/en'),
    'en-US': require('ajv-i18n/localize/en'),
    fr: require('ajv-i18n/localize/fr'),
}

/**
 *
 * @param {Types.Error} error
 * @param {Types.RequestExtended} request
 * @param {Types.ReplyExtended} reply
 */
export default function errorHandler(error, request, reply) {
    if (reply.statusCode === 429) {
        error.message = 'You hit the rate limit! Slow down please!'
        reply.send(error)

        return reply
    }
    if (error.validation) {
        localize[request.cookies.locale || 'en'](error.validation)
        reply.status(422).send(error.validation)

        return reply
    }
    error.message = error.message.slice(0, 3000)
    request.log.error(error)
    error.message = 'Server is having hard times :( Please try again later.'
    if (NODE_ENV === 'api') throw error
    reply.status(409).send(error)

    return reply
}
