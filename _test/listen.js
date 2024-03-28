/**
 * 
 * First your need to be sure of the following env variables not to use our real database.
 * 
 * IS_REDIS_CACHE=false
 * IS_MONGO_DB=false
 */

// import got from 'got'
// import tap from 'tap'
// import build from '../app.js'

/* tap.test('GET `/` route', async (t) => {
    t.plan(1)
    // TODO: replace 'build' by a similar minimal 'buildFastify' that works for tests. 
    // Note: this 'buildFastify' can never work though to build a full app, and this e2e test might never work neither.
    build(false).then(async (fastify) => {
        t.teardown(() => fastify.close())
        await fastify.listen(0)
        const { data, response } = await got('http://localhost:' + fastify.server.address().port).json()
        
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-type'], 'application/json; charset=utf-8')
        // t.same(JSON.parse(body), { hello: 'world' })
        t.has(JSON.parse(data), 'listings')
    })
}) */
