import perPage from '../../config/options/perPage.js'
import { logger } from '../../utils.js'
import queries from '../services/external-apis/mongo-queries.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'

/**
 *
 * @param {Types.FastifyExtended} fastify
 */
async function routes(fastify) {
    const { redis } = fastify
    const QInstance = new queries(redis, new logger(fastify).log)
    const queriesMethods = Object.getOwnPropertyNames(QInstance)
    queriesMethods.forEach((url) => {
        fastify.post(`/${url}`, async (request, reply) => {
            const { body } = request
            const params = body ? Object.values(body) : []
            const pagination = { page: 1, perPage: perPage() }
            let res
            try {
                console.log(`calling /${url} with parameters ${JSON.stringify(params)}`)
                res = await QInstance[url](...params, pagination)
                reply.send({ data: res, url: url })
            } catch (error) {
                reply.send({ error: error, url: url })
            }
        })
    })
}

export default routes
