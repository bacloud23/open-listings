import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import contexts from '../../../data/locales/contexts.js'
import { config, logger } from '../../../utils.js'
import mongoQueries from '../../services/external-apis/mongo-queries.js'
import { kickOut } from '../utils/kickOut.js'
import { loadUser } from '../utils/loadUser.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'

const COOKIE_NAME = config('COOKIE_NAME')

/**
 * @param {Types.FastifyExtended} fastify
 */
export default (fastify) => {
    const { redis } = fastify
    const QInstance = new mongoQueries(redis, new logger(fastify).log)
    /**
     *
     * @param {Types.RequestExtended} request
     * @param {Types.ReplyExtended} reply
     */
    return async (request, reply) => {
        if (request.validationError) {
            await kickOut(request, reply)
            reply.blabla([{}, contexts.login_, contexts.login.VALIDATION_ERROR], request)

            return reply
        }

        /** @type Types.LoginSchema */
        const body = request.body

        const { password, username } = body
        const role = username === config('ADMIN_EMAIL') || username === config('ADMIN_EMAIL2') ? 'admin' : 'regular'
        const user = await QInstance.getUserById(username)
        if (!user) {
            await kickOut(request, reply)
            reply.blabla([{}, contexts.login_, contexts.login.INCORRECT_CREDENTIALS], request)

            return reply
        }
        try {
            const isMatch = await bcrypt.compare(password, user.passHash)

            if (!isMatch) {
                await kickOut(request, reply)
                reply.blabla([{}, contexts.login_, contexts.login.INCORRECT_CREDENTIALS], request)

                return reply
            } else if (!user.isVerified) {
                reply.blabla([{}, contexts.login_, contexts.login.USER_UNVERIFIED], request)

                return reply
            } else {
                const token = jwt.sign({ role: user.role, username: username }, fastify.conf('JWT_SECRET'))
                reply.setCookie(COOKIE_NAME, token)
                request.flash('success', 'Successfully logged in')
                loadUser(request, { role: user.role, username: username })

                if (request.headers.referer) {
                    if (request.headers.referer.includes('/login'))
                        return reply.redirect('/')

                    return reply.redirect(request.headers.referer)
                } else {
                    if (role === 'admin')
                        return reply.redirect('/admin/dashboard')
                    else
                        return reply.redirect('/')

                }
            }
        } catch (err) {
            await kickOut(request, reply)
            reply.blabla([{}, contexts.login_, contexts.login.SERVER_ERROR], request)

            return reply
        }
    }
}
