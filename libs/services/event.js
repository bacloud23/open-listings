import { Collections } from '../../types.d.js'
import { dataStores, NODE_ENV } from '../../utils.js'

// eslint-disable-next-line no-unused-vars
const cleanObj = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v))
/**
 *
 */
function Events() {
    /**
     * 'Happened' registers in a capped DB Collection a lot of users events happening on the APP
     * For tracking user actions and achievements RESPECT DATA PRIVACY.\n
     * EVEN IF INTERNAL, SAVE MINIMUM OF USERS ACTIONS
     * THIS IS A CORE BELIEF IN OUR APP.
     * Technically, it is called whenever the signed-in user makes a significant action
     * @param {{type: ('new_listing'|'send_message'|'login'|'subscribe'|'search'), weight: number}} action
     * @param {string} context is where the new event triggered (class#method)
     * @param {Object} data additional useful data (request if possible is treated specially)
     * @returns
     */
    this.happened = function happened(action, context, data) {
        if (NODE_ENV === 'api') console.log('User is doing something.')
        let url, id, statusCode, username
        const { reply, request } = data
        if (request) {
            url = request.raw.url
            id = request.id
            if (request.session && request.session.get('user')) {
                username = request.session.get('username')
            }
        }
        if (reply) {
            statusCode = reply.raw.statusCode
        }

        const { type, weight } = action
        const eventDoc = cleanObj({ context, id, statusCode, type, url, username, weight })

        dataStores._isMongo
            ? (dataStores[Collections.Events].insertOne(eventDoc))
            : (dataStores[Collections.Events].insertAsync(eventDoc))

    }.bind(this)
}

export default Events
