/**
 * @typedef {'markets' | 'skills' | 'blogs' | 'events' | 'hobbies'} Sections
 */

// /**
//  * @typedef {'alllistings' | 'all-tags' | 'geolocation' | 'gwoogl' | 'index' | 'listings' | 'messages'} Contexts
//  */


/**
 * @typedef {import('fastify').FastifyRequest} Request
 * @typedef {import('fastify').FastifyReply} Reply
 * @typedef {import('fastify').FastifyError} Error
 * @typedef {import('fastify').HookHandlerDoneFunction} Done
 * @typedef {import('fastify').FastifyInstance} Fastify
 *
 * @typedef {import('fastify').FastifyInstance & { auth?, conf?, goGet?, happened?, nedb?, mongo?, redis?, scheduler?, verifyJWT?, wsauth?}} FastifyExtended
 * @typedef {{p: number}} Query
 * @typedef {{unique_tab_id: string}} Tab
 * @typedef {{unique_tab_id: string}} Body
 * @typedef {{division: string}} Division
 * @typedef {{keyword: string}} Keyword
 * @typedef {{tag: string}} Tag
 * @typedef {{username: string, role: string}} User
 * @typedef {{perPage: number, page: number}} Pagination
 * @typedef {{username: string, proof: number}} Session
 * @typedef {Request & {params: {tab: Tab?, division: Division?, keyword: Keyword?, tag: Tag?, user: User?, id: string?, p: string?, section: Sections?, locale: string}} & {body: Body} & {query: Query} & {pagination: Pagination} & {session: Session} & {fastify: FastifyExtended} & {flash}} RequestExtended
 * @typedef {Reply & {blabla: Function}} ReplyExtended
 */

/**
 * @typedef {object} Listing
 * @property {string} [unique_tab_id]
 * @property {string} title
 * @property {string} desc
 * @property {array} tags
 * @property {Sections} section
 * @property {boolean} [offer=false]
 * @property {number} [lat]
 * @property {number} [lng]
 * @property {string} [div]
 * @property {string[]} [undraw]
 * @property {string} [color]
 * calculated after (optional)
 * @property {string} [lang]
 * @property {string} [cdesc]
 * @property {string} [usr]
 */

/**
 * @typedef {object} MessageSchema
 * @property {string} [unique_tab_id]
 * @property {string} message
 * @property {string} [cmsg]
 * @property {string} [lang]
 * @property {string} email
 * @property {string} id
 */

/**
 * @typedef {object} Comment
 * @property {string} from
 * @property {string} to
 * @property {Date} sent
 * @property {string} thread
 * @property {string} threadId
 * @property {string} message
 * @property {string} lang
 * @property {string} cmsg
 */

/**
 * @typedef {object} LoginSchema
 * @property {string} [unique_tab_id]
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {object} SignupSchema
 * @property {string} [unique_tab_id]
 * @property {string} username
 * @property {string} password
 * @property {string} firstName
 * @property {string} secondName
 */

/**
 * @typedef {object} geolocationSchema
 * @property {string} [unique_tab_id]
 * @property {number} lat
 * @property {number} lng
 * @property {"markets"|"events"} section
 */

/**
 * @typedef {object} gwooglSchema
 * @property {string} [unique_tab_id]
 * @property {string} title_desc
 * @property {boolean} [exact=false]
 * @property {string} [div_q]
 * @property {string} [since]
 * @property {Sections} section
 */

export const Types = {}

export const Contexts = {
    AllListings: 'alllistings',
    AllTags: 'all-tags',
    Geolocation: 'geolocation',
    Gwoogl: 'gwoogl',
    Index: 'index',
    Listings: 'listings',
    Messages: 'messages',
}

export const Sections = {
    Blogs: 'blogs',
    Events: 'events',
    Hobbies: 'hobbies',
    Markets: 'markets',
    Skills: 'skills',
}

export const Collections = {
    Announcements: 'announcements',
    Comment: 'comment',
    Events: 'events',
    Listing: 'listings',
    Users: 'users',
    Userstemp: 'userstemp',
    Words: 'words',
}
