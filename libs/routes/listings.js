import multer from 'fastify-multer'
import contexts from '../../data/locales/contexts.js'
import { Contexts } from '../../types.d.js'
import { config, logger, NODE_ENV } from '../../utils.js'
import {
    blogsSchema,
    geolocationSchema,
    gwooglSchema,
    hobbiesSchema,
    marketsSchema,
    messageSchema,
    updateListingSchema,
} from '../constraints/constraints.js'
import authAdapter from '../decorators/auth.js'
import deleteListing from '../decorators/GET/deleteListing.js'
import getListing from '../decorators/GET/getListing.js'
import getListings from '../decorators/GET/getListings.js'
import getSectionListings from '../decorators/GET/sectionListings.js'
import postGeoSearch from '../decorators/POST/geoSearch.js'
import postGeoSearchPaginated from '../decorators/POST/geoSearchPaginated.js'
import postListing from '../decorators/POST/listing.js'
import postMessage from '../decorators/POST/message.js'
import postTags from '../decorators/POST/tags.js'
import postTextSearch from '../decorators/POST/textSearch.js'
import postTextSearchPaginated from '../decorators/POST/textSearchPaginated.js'
import inputsValueMapping from '../decorators/transformer.js'
import blabla from '../decorators/utils/blabla.js'
import queries from '../services/external-apis/mongo-queries.js'
import { ops as helpers } from '../services/helpers.js'
import { to } from '../services/routines/code.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'

// TODO: rethink validation errors: 'request.validationError'

// The function would need to be declared async for return to work.
// Only routes accept next parameter.
/**
 *
 * @param {Types.FastifyExtended} fastify
 */
async function routes(fastify) {
    const { redis } = fastify
    const QInstance = new queries(redis, new logger(fastify).log)
    let { auth } = authAdapter(fastify)

    fastify.decorateReply('blabla', blabla)

    const getListingsHandler = getListings(fastify)
    fastify.get('/', getListingsHandler)

    // ============== Get one section listings (~index) ==============
    const getSectionHandler = getSectionListings(fastify)
    fastify.get('/markets', getSectionHandler)
    fastify.get('/blogs', getSectionHandler)
    fastify.get('/hobbies', getSectionHandler)
    // ============== ***************** ==============

    // ============== Get one listing ==============
    /* GET one listing; must not be deactivated. */
    const getListingHandler = getListing(fastify)
    fastify.get('/id/:id/', getListingHandler)

    // ============== Delete one listing ==============
    /* Delete one listing; */
    const deleteListingHandler = deleteListing(fastify)
    fastify.get('/delete/id/:id/', { preHandler: auth }, deleteListingHandler)
    // ============== ***************** ==============

    // ============== Text based search ==============
    /* Query listings not including deactivated */
    // Powered by HTMX on the front.
    const textSearchHandler = postTextSearch(fastify)
    fastify.post(
        '/search/gwoogl',
        { attachValidation: true, preValidation: inputsValueMapping, schema: { body: gwooglSchema } },
        textSearchHandler,
    )
    // paginated query
    // TODO: schema validate p and tab queries
    const textSearchPaginatedHandler = postTextSearchPaginated(fastify)
    fastify.get('/search/gwoogl/:p/:section/:unique_tab_id', textSearchPaginatedHandler)
    // ============== ***************** ==============

    // ============== Geolocation based search ==============
    /* Query listings withing a geo-point and radius */
    // Powered by HTMX on the front.
    const geoSearchHandler = postGeoSearch(fastify)
    fastify.post(
        '/search/geolocation',
        { attachValidation: true, schema: { body: geolocationSchema } },
        geoSearchHandler,
    )
    const geoSearchPaginatedHandler = postGeoSearchPaginated(fastify)
    fastify.get('/search/geolocation/:p/:unique_tab_id', geoSearchPaginatedHandler)
    // ============== ***************** ==============

    // ============== Submit a new listing ==============
    const lHandler = postListing(fastify)
    fastify.register(multer.contentParser)
    const upload = NODE_ENV === 'production' ? helpers.cloudMulter : helpers.localMulter

    fastify.post('/markets', { preHandler: [auth, upload], schema: { body: marketsSchema } }, lHandler)
    fastify.post('/blogs', { preHandler: auth, schema: { body: blogsSchema } }, lHandler)
    fastify.post('/hobbies', { preHandler: [auth, upload], schema: { body: hobbiesSchema } }, lHandler)
    // ============== ***************** ==============

    // TODO: make validation schemas for tags (in addition to tagsSubValidation processing)
    // ============== Subscribe to a new tag ==============
    const tHandler = postTags(fastify)
    fastify.post('/markets/subscribe', { preHandler: auth }, tHandler)
    fastify.post('/blogs/subscribe', { preHandler: auth }, tHandler)
    fastify.post('/hobbies/subscribe', { preHandler: auth }, tHandler)
    // ============== ***************** ==============

    const mHandler = postMessage(fastify)
    fastify.post(
        '/sendMessage',
        { attachValidation: true, preHandler: auth, schema: { body: messageSchema } },
        mHandler,
    )

    fastify.get('/user', { preHandler: auth }, async function (req, reply) {
        const [err, listings] = await to(QInstance.getListingsByUser(req.session.get('user').username))
        if (err) {
            req.log.error(`user#getListingsByUser: ${err.message}`)
            reply.blabla([{}, contexts.message_, contexts.message.SERVER_ERROR], req)

            return reply
        }
        const user = req.session.get('user')
        const json = {
            context: Contexts.AllListings,
            interactive: true,
            intro: 'These are your own listings ! You can always verify and deactivate some',
            listings: listings,
            success: 'Yep, we got some :)',
            title: 'Your listings',
            user: user,
        }

        if (NODE_ENV === 'api') return json

        return reply.view('./pages/listings', json)
    })

    fastify.get('/user/notifications', { preHandler: auth }, async function (req, reply) {
        const [err, notifications] = await to(QInstance.getNotificationsByUser(req.session.get('user').username))
        if (err) {
            req.log.error(`user#getNotificationsByUser: ${err.message}`)

            return reply.blabla([{}, contexts.message_, contexts.message.SERVER_ERROR], req)
        }
        const user = req.session.get('user')
        // Thread which are like titles will be used as CSS selectors. So reformat to be a valid CSS selector.
        const threads = [
            ...new Set(
                notifications.map((notif) => {
                    return `${notif.thread.replace(/ /g, '-')}`
                }),
            ),
        ]
        const json = {
            context: Contexts.Messages,
            intro: 'These are your own notification ! Messages you receive, etc',
            notifications: notifications,
            success: 'Yep, we got some :)',
            threads: threads,
            title: 'Your notifications',
            user: user,
        }

        if (NODE_ENV === 'api') return json

        return reply.view('./pages/notifications', json)
    })

    fastify.get('/user/toggle/:id', { preHandler: auth }, async function (req, reply) {
        const [err, res] = await to(QInstance.toggleValue(req.params.id, 'd', 'listings'))
        if (err) {
            req.log.error(`user/toggle#toggleValue: ${err.message}`)

            throw new Error('kaboom')
        }
        const json = {
            interactive: true,
            listing: res,
        }

        if (NODE_ENV === 'api') return json

        return reply.view('./partials/sections/card_body', json)
    })

    fastify.post('/id/:id', { preHandler: auth, schema: { body: updateListingSchema } }, async function (req, reply) {
        const viewer = req.session.get('user') ? req.session.get('user').username : ''
        const mongoHex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
        const isIdValid = config('IS_MONGO_DB') ? mongoHex.test(req.params.id) : true
        const [err, elem] = isIdValid
            ? await to(QInstance.getListingById(req.params.id, req.session.get('role') === 'admin', viewer))
            : ['NOT_FOUND', undefined]

        if (err === 'NOT_FOUND' || !elem) {
            req.log.error(`patch/id#updateListing: ${err}`)

            return reply.blabla([{}, contexts.message_, contexts.message.NOT_FOUND], req)
        }

        if (elem.usr !== viewer) {
            req.log.error(`patch/id#updateListing: SECURITY CHECK`)

            return reply.blabla([{}, contexts.message_, contexts.message.NOT_FOUND], req)
        }

        const description = req.body['description']
        const [err2, res] = await to(
            QInstance.updateListing({ desc: description }, Types.Collections.Listing, req.params.id),
        )

        if (err2) {
            req.log.error(`patch/id#updateListing: ${err.message}`)

            return reply.blabla([{}, contexts.message_, contexts.message.SERVER_ERROR], req)
        }

        const json = {
            interactive: true,
            listing: res,
        }

        if (NODE_ENV === 'api') return json

        return reply.redirect(`/listings/id/${req.params.id}/`)
        // return reply.view('./partials/sections/card_body', json)
    })
}

export default routes
