import cors from '@fastify/cors'
import Datastore from '@seald-io/nedb'
import { bold, green } from 'colorette'
import { config as dotenv } from 'dotenv'
import * as Eta from 'eta'
import fastify_ from 'fastify'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import assert from 'node:assert'
import crypto from 'node:crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import { plugins } from './_app_.js'
import bootstrap from './bootstrap/bootstrap.js'
import { options } from './config/options/_options_.js'
import errorHandler from './libs/decorators/error.js'
import { verifyJWT } from './libs/decorators/jwt.js'
import paginationHandler from './libs/decorators/pagination.js'
import sessionHandler from './libs/decorators/session.js'
import isSpam from './libs/decorators/spam.js'
import transformer from './libs/decorators/transformer.js'
import { routes } from './libs/routes/_routes_.js'
import Events from './libs/services/event.js'
import RedisAPI from './libs/services/external-apis/redis.js'
import Mailer from './libs/services/mailer.js'
import { NODE_ENV, config, dataStores, initCollection } from './utils.js'
// import { createRequire } from 'module'
import { Collections } from './types.d.js'
// const require = createRequire(import.meta.url)
import RedisStore from 'connect-redis'

// eslint-disable-next-line no-unused-vars
import * as Types from './types.d.js'

const { corsOptions, helmet, logger, swagger, swaggerUi } = options
const { adminRouter, authRouter, dataRouter, debugRouter, indexRouter, listingsRouter } = routes
const { GracefulServer, fastifyAuth, fastifyCookies, fastifyFlash, fastifyJWT } = plugins
const { fastifySchedule, fastifySession, fastifySwagger, fastifySwaggerUi, i18nextMiddleware, viewsPlugin } = plugins
const { fastifyFormbody, fastifyHelmet, fastifyMetrics, fastifyMongodb, fastifyRateLimit, fastifyRedis, fastifyServe } =
    plugins

process.on('unhandledRejection', (reason) => {
    console.log(reason)
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv()

const dbName = config('DB_NAME')
const dbUserName = config('DB_USERNAME')
const dbUserPWD = config('DB_USERPWD')
/**
 * Initialize the fastify app. It could be called many times
 * for NodeJS cluster case
 */
/**
 * build a Fastify instance and run a server or not
 * @param { Boolean } doRun if true run the app on a server
 * @returns { Promise <import('fastify').FastifyInstance> }
 */
async function build(doRun) {
    /** @type  {Types.FastifyExtended} */
    const fastify = fastify_({
        // disableRequestLogging: process.env.NODE_ENV === 'production',
        keepAliveTimeout: 10000,
        logger: logger(),
        requestTimeout: 5000,
        // TODO: check if client ip is the right one in spam.js
        trustProxy: true,
    })

    fastify.decorateRequest('fastify', null)
    fastify.addHook('onRequest', function (request, _, done) {
        request['fastify'] = fastify
        done()
    })

    const gracefulServer = GracefulServer(fastify.server)
    const log = (s) => {
        fastify.log.info(s)
        console.log(bold(green(s)))
    }
    // TODO: manage open resources (not working !)
    gracefulServer.on(GracefulServer.READY, () => log(GracefulServer.READY))
    gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => log('Server is shutting down'))
    gracefulServer.on(GracefulServer.SHUTDOWN, (error) => {
        log('Server is down because of ' + error.message)
        console.log(error)
    })

    // TODO: SERVE STATIC CONTENT! LATER PREFERABLY ON A SEPARATE SERVER WITH PROPER PROTECTION
    fastify.register(fastifyServe, { root: path.join(__dirname, 'public') })
    fastify.register(fastifyServe, {
        decorateReply: false,
        prefix: '/static/',
        root: path.join(__dirname, `static/${config('APP_NAME')}`),
    })

    fastify.decorate('conf', (tag) => config(tag))

    fastify.register(fastifySchedule)
    fastify.register(fastifyFormbody)
    // fastify.register(fastifyWebsocket)
    fastify.register(fastifyHelmet, helmet())
    // TODO: replace with corsOptions()
    fastify.register(cors, { origin: '*' })
    // fastify.register(fastifyCompress) // Compress all possible types > 1024o

    if (config('IS_MONGO_DB')) {
        fastify.register(fastifyMongodb, {
            forceClose: true,
            url: config('MONGODB_URI', { dbName, dbUserName, dbUserPWD }),
            ...(NODE_ENV === 'production' && !config('NO_MONGO_CLUSTER') && { replicaSet: 'secluded' }),
        })
    } else {
        log('Running app with NeDB database instead of MongoDB')
        const db = new Datastore({ autoload: true, filename: path.join(__dirname, 'nedb', 'db.db') })
        fastify.decorate('nedb', db)
    }

    // if (NODE_ENV === 'production' && !config('NO_MONGO_CLUSTER')) {
    //     let typeSense = new Typesense.Client(config('TYPESENSE', { TYPESENSE_API_KEY: config('TYPESENSE_API_KEY') }))
    //     typesenseQueries(typeSense, fastify.mongo.db)
    // }

    /** @type require('@redis/client').RedisClientType */
    let redisClient
    await fastify.register(fastifyRedis, {
        host: config('REDIS_HOST'),
        password: config('PASSWORD'),
        port: 6379,
    })
    redisClient = fastify.redis

    await fastify.register(fastifyJWT, { secret: fastify.conf('JWT_SECRET') })
    await fastify.register(fastifyAuth)
    // TODO: fastify.after(routes)
    fastify.register(fastifyCookies)

    // Initialize store.
    let redisStore = new RedisStore({
        client: redisClient,
        prefix: 'session:',
    })
    fastify.register(fastifySession, {
        cookie: {
            maxAge: 2592000000,
            sameSite: 'lax',
            secure: false,
        },
        cookieName: 'session',
        saveUninitialized: false,
        secret: crypto.randomBytes(16).toString('hex'),
        store: redisStore,
    })

    fastify.register(fastifyFlash)

    fastify.decorate('verifyJWT', verifyJWT)
    // fastify.decorate('wsauth', wsauth)

    // TODO: events happening in the app
    const happened = new Events().happened
    fastify.decorate('happened', (type, context, data) => happened(type, context, data))

    const mongoURL = config('MONGODB_URI', { dbName, dbUserName, dbUserPWD })

    /*********************************************************************************************** */

    // !!TRANSLATIONS !!
    await i18next
        .use(Backend)
        .use(i18nextMiddleware.LanguageDetector)
        .init({
            backend: {
                loadPath: __dirname + '/data/locales/{{lng}}/common.json',
            },
            detection: {
                caches: false,
                lookupCookie: 'locale',
                order: ['cookie'],
            },
            fallbackLng: process.env.DEFAULT_LANG,
            preload: ['en-US', 'ar', 'fr', 'de'],
            // cache: {
            //     enabled: true,
            // },
            // load: 'languageOnly',
            // debug: NODE_ENV === 'api',
        })

    fastify.register(i18nextMiddleware.plugin, {
        i18next,
        ignoreRoutes: ['/data/', '/admin/'],
    })

    /*********************************************************************************************** */
    // TODO: find a way to strip very long ejs logging errors
    fastify.register(viewsPlugin, {
        engine: {
            eta: new Eta.Eta({ useWith: true }),
        },
        templates: 'templates',
    })

    // Needed to avoid future deopts
    fastify.decorateReply('locals', null)
    fastify.addHook('preHandler', function (req, reply, next) {
        reply.locals = {}
        // User features like feature flag
        reply.locals.features = {
            geo: config('features').geo,
        }
        next()
    })

    /*********************************************************************************************** */
    // !!PRE-HANDLERS AND HOOKS !!
    fastify.addHook('onRequest', (req, reply, done) => paginationHandler(req, reply, done))
    fastify.addHook('onRequest', (req, reply, done) => sessionHandler(req, reply, done))
    fastify.addHook('preValidation', (req, reply, done) => transformer(req, reply, done))
    // Mine topK events
    // fastify.addHook('preHandler', miner)

    /*********************************************************************************************** */
    // !!SPAM ASSASSIN !!
    if (NODE_ENV === 'production') await fastify.register(fastifyRateLimit, config('PING_LIMITER'))

    // against 404 endpoint ddos
    fastify.decorate('notFound', (request, reply) => {
        reply.code(404).type('text/html').send('Not Found')
    })

    fastify.setNotFoundHandler(fastify.notFound)

    // TODO: Rate limiter && honeyPot except in process.env === "api"
    fastify.addHook('onRequest', (req, reply, done) => isSpam(req, reply, done))

    // All unhandled errors which are handled by fastify: just send http response
    // @ts-ignore
    fastify.setErrorHandler((error, request, reply) => errorHandler(error, request, reply))

    //  !!Run only on one node!!
    if (NODE_ENV === 'api' /*&& process.env.worker_id === '1'*/) {
        await fastify.register(fastifySwagger, swagger)
        await fastify.register(fastifySwaggerUi, swaggerUi)
    }

    /*********************************************************************************************** */
    // !!REGISTER ROUTES !!
    await (async () => {
        await fastify.register(authRouter)
        await fastify.register(indexRouter)
        await fastify.register(adminRouter, { prefix: 'admin' })
        await fastify.register(listingsRouter, { prefix: 'listings' })
        await fastify.register(dataRouter, { prefix: 'data' })
        if (NODE_ENV === 'api') await fastify.register(debugRouter, { prefix: 'debug' })
    })()

    /*********************************************************************************************** */
    // !!APP AND USER METRICS!!
    // Don't track for api env (API testing)
    const secretPath = process.env.SECRET_PATH
    const promURL = `/${secretPath}/metrics`

    if (process.env.worker_id === '1') {
        log(`Metrics accessible from: ${promURL}`)
        fastify.register(fastifyMetrics, { endpoint: promURL /* routeMetrics: { routeBlacklist: promURL } */ })
    }

    //  !!Run only on one node!!
    if (NODE_ENV === 'api' /*&& process.env.worker_id === '1'*/) {
        log(`(Please check localhost:${process.env.PORT || fastify.conf('NODE_PORT')}/documentation it's a nice start`)
        await fastify.ready()
        fastify.swagger()
    }

    // fastify.decorate('collection', (name) => collection(fastify.mongo.db, name))

    const start = async () => {
        try {
            // whatever the env (like heroku)  wants
            const port = process.env.PORT || fastify.conf('NODE_PORT')
            log('The app is accessible on port: ' + port)
            await fastify.listen({ host: '0.0.0.0', port })

            const mailer = await Mailer.getInstance()
            if (NODE_ENV === 'production')
                mailer.sendMail({
                    html: 'App instance bootstrapped correctly',
                    subject: 'App instance bootstrap',
                    text: 'App instance bootstrapped correctly',
                    to: fastify.conf('ADMIN_EMAIL'),
                })

            gracefulServer.setReady()
        } catch (err) {
            log(err.message)
            process.exit(1)
        }
    }
    if (doRun) await start()

    /*********************************************************************************************** */
    // !!BOOTSTRAP ENVIRONMENT AND DATA!!
    // ============= update collections references (mongo or nedb) =============
    Object.values(Collections).forEach((collName) => {
        initCollection(fastify.mongo?.db, collName)
    })
    dataStores.mongo = fastify.mongo?.db
    // =================================================================
    const seconds = fastify.conf('PIPELINE_KEYWORDS_SECONDS') // a day
    // Use connect method to connect to the Server
    const prepareData = async () => {
        const mongo = fastify.mongo?.db
        const redisAPI = new RedisAPI(redisClient, mongo)
        redisAPI.purgeKeys()

        const colListings = dataStores[Collections.Listing]
        const colComments = dataStores[Collections.Comment]
        const colUsers = dataStores[Collections.Users]
        // Create indexes
        if (NODE_ENV === 'production') {
            log('Deleting development data')
            if (dataStores._isMongo) {
                await colListings.deleteMany({})
                await colUsers.deleteMany({})
                await colComments.deleteMany({})
            } else {
                await colListings.remove({}, { multi: true })
                await colListings.loadDatabase()
                await colUsers.remove({}, { multi: true })
                await colUsers.loadDatabase()
                await colComments.remove({}, { multi: true })
                await colComments.loadDatabase()
            }
            log('Development data seeding')
            await bootstrap.seedDevelopmentData(colListings)
        }

        await bootstrap.createIndexes()
        // await bootstrap.fastifyInjects(fastify)

        // await redisAPI.cacheIds()
    }

    // Run only on one node
    if (process.env.worker_id === '1') {
        fastify.log.info('Checking environment data once')
        assert(fastify.mongo?.db || fastify.nedb, 'MongoDB connection error')
        assert(!config('IS_REDIS_CACHE') || fastify.redis, 'Redis DB connection error')
        bootstrap
            .checkEnvironmentData(mongoURL)
            .then(() => {
                prepareData()
            })
            .catch((err) => {
                log('Refusing to start because of ' + err)
                process.exit()
            })
    }

    return fastify
}

export default build
