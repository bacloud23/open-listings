// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'

/**
 * Sessions are created on all routes, which is a lot for all visiting users
 * Yet we need sessions for all users (including unregistered)
 * Like in the listings search routes.
 *
 * So this handler expires sessions for non registered users after a quicker lifetime (say 20 minutes)
 *
 * @param {Types.RequestExtended} req
 * @param {Types.ReplyExtended} reply
 */
export default function sessionHandler(req, reply, done) {
    // Already logged in user or first time visit (no session at all: will be created by fastifySession)
    if (!req.session || req.session?.get('user')) {
        return done()
    }

    req.session.set('last-seen', new Date())
    return done()
}
