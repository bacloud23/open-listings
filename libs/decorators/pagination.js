import perPage from '../../config/options/perPage.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'

// let lock = new Date().getTime()
// let url = ''
/**
 * @param {Types.RequestExtended} req
 * @param {Types.ReplyExtended} reply
 * @param {Types.Done} done
 */
export default function paginationHandler(req, reply, done) {
    // if (req.url === url && url !== 'http://localhost:3003/' && new Date().getTime() - lock < 100) {
    //     console.log('@@@@@@@@@@@ this is an indication of a bad implementation, I could not spot everytime it happens @@@@@@@@@');
    //     console.log('Check: https://github.com/fastify/help/issues/636')
    //     req.log.info(`@@@@@@@@@@@${req.url}@@@@@@@@@@@@@`)
    // }

    // lock = new Date().getTime()
    // url = req.url

    const page = req.query.p || 1
    req.pagination = { page: Number(page), perPage: perPage() }

    return done()
}
