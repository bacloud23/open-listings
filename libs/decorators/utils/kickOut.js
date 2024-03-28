import { config } from '../../../utils.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'

const COOKIE_NAME = config('COOKIE_NAME')
/**
 * Removes user from cookie and session immediately
 * @param {Types.RequestExtended} request
 * @param {Types.ReplyExtended} reply
 */
export const kickOut = async (request, reply) => {
    reply.setCookie(COOKIE_NAME, '', {
        expires: new Date(),
    })

    request.flash('success', 'Successfully logged out')
    await request.session?.destroy()
    delete request.params.user
}
