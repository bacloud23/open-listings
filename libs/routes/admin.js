import { logger } from '../../utils.js'
import authAdapter from '../decorators/auth.js'
import queries from '../services/external-apis/mongo-queries.js'
import { removeKey } from '../services/routines/code.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'

let imgHolder = {
    blogs: 'https://via.placeholder.com/512x350/f5eabf/100d00.png?text=Blog',
    events: 'https://via.placeholder.com/512x350/934fe9/11113e.png?text=Event',
    hobbies: 'https://via.placeholder.com/512x350/b2bd12/0a090a.png?text=Hobby',
    markets: 'https://via.placeholder.com/512x350/bd5912/100d00.png?text=Market',
    skills: 'https://via.placeholder.com/512x350/ec496f/0f0f3f.png?text=Skill',
}

// The function would need to be declared async for return to work.
// Only routes accept next parameter.
/**
 *
 * @param {Types.FastifyExtended} fastify
 */
async function routes(fastify) {
    const { redis } = fastify

    const QInstance = new queries(redis, new logger(fastify).log)
    let { adminAuth } = authAdapter(fastify)
    // CLONE BASE DATA LIST
    let realtimeJSON = []

    fastify.get('/', { preHandler: adminAuth }, async function (req, reply) {
        const listings = await QInstance.getListingsForModeration(true)
        listings.documents.forEach((elem) => {
            if (!elem.img) elem.img = imgHolder[elem['section']]
            elem._id = elem._id.toHexString ? elem._id.toHexString() : elem._id
        })
        listings.documents.forEach((elem) => {
            realtimeJSON[elem._id] = elem
        })
        reply.send({
            data: {
                contents: listings.documents,
            },
            result: true,
        })
    })
    //  { preHandler: adminAuth },
    fastify.get('/dashboard', { preHandler: adminAuth }, async function (req, reply) {
        return reply.view('./pages/admin', {})
    })

    // CREATE
    fastify.post('/', { preHandler: adminAuth }, async function (req, reply) {
        reply.send('listing creation not implemented')
    })

    // UPDATE (Patch for single-cell edit)
    // Replace some or all of a listing's properties
    // Using `patch` instead of `put` to allow partial update
    // fastify.patch('/:id', async function (req, reply) {
    //     // Early Exit
    //     if (!Object.keys(req.body).length) {
    //         reply.send('The request object has no options or is not in the correct format (application/json).')
    //     }
    //     // Update the target object
    //     else {
    //         const match = req.params.id
    //         realtimeJSON[match] = Object.assign({}, realtimeJSON[match], req.body)
    //         if (realtimeJSON[match].img.includes('via.placeholder')) realtimeJSON[match].img = ''
    //         await QInstance.updateListing(realtimeJSON[match], Types.Collections.Listing)
    //         if (realtimeJSON[match].a) {
    //             console.log('document approved')
    //             delete realtimeJSON[match]
    //         }
    //         reply.send(realtimeJSON)
    //     }
    // })

    // PUT (For multi-cell edit)
    // Replaces record instead of merging (patch)
    fastify.put('/', { preHandler: adminAuth }, async function (req, reply) {
        let body = req.body.updatedRows[0]
        delete body['_attributes']
        const match = body['_id']

        realtimeJSON[match] = body
        removeKey('rowKey', body)

        await QInstance.updateListing(body, Types.Collections.Listing)
        if (realtimeJSON[match].a) delete realtimeJSON[match]
        reply.send(realtimeJSON)
    })

    // DELETE
    fastify.delete('/:id', { preHandler: adminAuth }, async function (req, reply) {
        const body = req.body.updatedRows[0]
        delete body['_attributes']
        const match = body['_id']
        await QInstance.removeDocument(match, Types.Collections.Listing)
        delete realtimeJSON[match]
        reply.send(realtimeJSON)
    })

    // Add an announcement
    // fastify.post('/announce',  { preHandler: adminAuth },async function (req, reply) {
    //     const { body } = req
    //     // const { title_en, title_fr, english, french } = body
    //     const id = await QInstance.insertAnnouncement(body)
    //     reply.send(`announcement added ${JSON.stringify(id)}`)
    // })
}

export default routes
