import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import contexts from '../../../data/locales/contexts.js'
import { config, logger } from '../../../utils.js'
import { Actions } from '../../constraints/constants.js'
import mongoQueries from '../../services/external-apis/mongo-queries.js'
import { ops as helpers } from '../../services/helpers.js'
import { to } from '../../services/routines/code.js'
import { kickOut } from '../utils/kickOut.js'
import Mailer from './../../services/mailer.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'

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
    return async function (request, reply) {
        // basic validation based on Fastify schema
        if (request.validationError) {
            reply.blabla([{}, contexts.signup_, contexts.signup.VALIDATION_ERROR], request)

            return reply
        }

        /** @type Types.SignupSchema */
        const body = request.body
        const { firstName, password, secondName, username } = body
        // advanced validation based on other factors
        const passValidation = await helpers.isFinePassword(password, request.i18n.language)
        if (passValidation.score <= 2) {
            // TODO: complete with this. Eithe add to blabla decorator or just here.
            // @ts-ignore
            const friendlyMessages = {
                suggestions: passValidation.feedback.suggestions,
                warning: passValidation.feedback.warning,
            }
            reply.blabla([{ ...friendlyMessages }, contexts.signup_, contexts.signup.VALIDATION_ERROR], request)

            return reply
        }
        // Always 'regular' by default (except user@mail.com for tests)
        const role = username === config('ADMIN_EMAIL') || username === config('ADMIN_EMAIL2') ? 'admin' : 'regular'
        const isVerified = role === 'admin'
        try {
            const user = await QInstance.getUserById(username)
            if (user) {
                await kickOut(request, reply)
                reply.blabla([{}, contexts.signup_, contexts.signup.EMAIL_TAKEN], request)

                return reply
                // throw { statusCode: 400, message: 'EMAIL_TAKEN' }
            } else if (helpers.isBadEmail(username)) {
                await kickOut(request, reply)
                reply.blabla([{}, contexts.signup_, contexts.signup.BAD_EMAIL], request)

                return reply
            } else {
                let passHash = await bcrypt.hash(password, 10)
                // Temporary user to be able to verify property of identity (email)
                let tempUser = {
                    token: crypto.randomBytes(16).toString('hex'),
                    username: username,
                }
                // Actual user but unverified
                const [err, insertedId] = await to(
                    QInstance.insertUser({
                        firstName,
                        isVerified,
                        passHash,
                        password,
                        role,
                        secondName,
                        username,
                    }),
                )
                if (err) {
                    await kickOut(request, reply)
                    reply.blabla([{}, contexts.signup_, contexts.signup.VALIDATION_ERROR], request)

                    return reply
                }

                const mailer = await Mailer.getInstance()
                mailer.sendCustomMail({
                    data: { host: config('APIHost'), token: tempUser.token },
                    req: request,
                    to: username,
                    todo: 'signup',
                })
                await QInstance.insertTmpUser(tempUser)
                reply.blabla([{}, contexts.message_, contexts.message.verification], request)
                fastify.happened(Actions.subscribe, 'auth/signup', { reply, request })

                return reply
            }
        } catch (err) {
            await kickOut(request, reply)
            request.log.error(`signup: ${err.message}`)
            reply.blabla([{}, contexts.signup_, contexts.signup.SERVER_ERROR], request)

            return reply
        }
    }
}
