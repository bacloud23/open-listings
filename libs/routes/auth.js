import bcrypt from 'bcryptjs'
import contexts from '../../data/locales/contexts.js'
import { logger } from '../../utils.js'
import { Actions } from '../constraints/constants.js'
import { loginSchema, resetSchema, signupSchema } from '../constraints/constraints.js'
import getLogin from '../decorators/POST/login.js'
import getSignup from '../decorators/POST/signup.js'
import authAdapter from '../decorators/auth.js'
import blabla from '../decorators/utils/blabla.js'
import { goGet } from '../decorators/utils/goGet.js'
import { kickOut } from '../decorators/utils/kickOut.js'
import queries from '../services/external-apis/mongo-queries.js'
import { to } from '../services/routines/code.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'

/**
 *
 * @param {Types.FastifyExtended} fastify
 */
async function routes(fastify) {
    const { redis } = fastify

    const QInstance = new queries(redis, new logger(fastify).log)
    let { auth } = authAdapter(fastify)

    // const mailer = Mailer.getInstance(null)
    fastify.decorateReply('blabla', blabla)
    fastify.decorate('goGet', goGet)

    /* GET login page. */
    fastify.goGet('login')

    /* GET subscribe page. */
    fastify.goGet('signup')

    /* GET reset page. */
    fastify.goGet('reset')

    /* GET logout. */
    fastify.get('/logout', async function (request, reply) {
        await kickOut(request, reply)
        reply.redirect('/')
    })

    const loginHandler = getLogin(fastify)
    fastify.post('/login', { attachValidation: true, schema: { body: loginSchema } }, loginHandler)

    const signupHandler = getSignup(fastify)
    fastify.post('/signup', { attachValidation: true, schema: { body: signupSchema } }, signupHandler)

    /* Confirmation of email identity. */
    fastify.goGet('confirmation')

    fastify.get('/confirmation/:token/', async function (request, reply) {
        const token = request.params.token
        const tmpUser = await QInstance.getTmpUserByToken(token)
        if (!tmpUser) {
            kickOut(request, reply)
            reply.code(401)
            reply.blabla([{}, contexts.signup_, contexts.signup.UNAUTHORIZED], request)

            return reply
            // return new Error('UNAUTHORIZED')
        }
        const user = await QInstance.getUserById(tmpUser.username)
        if (!user) {
            kickOut(request, reply)
            reply.code(401)
            reply.blabla([{}, contexts.signup_, contexts.signup.INCORRECT_TOKEN], request)

            return reply
            // return new Error('INCORRECT_TOKEN')
        }
        if (user.isVerified) {
            reply.code(401)
            reply.blabla([{}, contexts.signup_, contexts.signup.ALREADY_VERIFIED], request)

            return reply
            // return new Error('ALREADY_VERIFIED')
        }
        user.isVerified = true
        await QInstance.updateUser(user)
        fastify.happened(Actions.confirmation, 'auth/confirmation', { reply, request })

        return reply.redirect('/')

    })

    /* Reset of email password. */
    fastify.post(
        '/reset',
        { attachValidation: true, preHandler: auth, schema: { body: resetSchema } },
        async function (request, reply) {
            if (request.validationError) {
                reply.blabla([{}, contexts.reset_, contexts.reset.VALIDATION_ERROR], request)

                return reply
            }
            const currentUser = request.session.get('user').username
            /**
             * @typedef {object} resetSchema
             * @property {string} [unique_tab_id]
             * @property {string} password
             */
            /** @type resetSchema */
            const body = request.body
            const { password } = body
            const user = await QInstance.getUserById(currentUser)
            // This must never happen really
            if (!user) {
                reply.blabla([{}, contexts.reset_, contexts.reset.SERVER_ERROR], request)

                return reply
            }
            try {
                user.passHash = await bcrypt.hash(password, 10)
                const [err, acknowledged] = await to(QInstance.updateUser(user))
                if (err) {
                    reply.blabla([{}, contexts.reset_, contexts.reset.VALIDATION_ERROR], request)

                    return reply
                }
                request.flash('success', 'Successfully updated password')
                fastify.happened(Actions.reset, 'auth/reset', { reply, request })

                return reply.redirect('/')
            } catch (err) {
                request.log.error(`reset: ${err.message}`)
                reply.blabla([{}, contexts.reset_, contexts.reset.SERVER_ERROR], request)

                return reply
            }
        },
    )
}

export default routes
