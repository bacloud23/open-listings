// TODO: add defaults to all optional keys !!!
// Constraints to ease code complexity. These constraints reflect
// which operations to run on any endpoint on any environment
import S from 'fluent-json-schema'
import { Sections } from '../../types.d.js'
import { config } from '../../utils.js'
const TAG_HARD_SIZE_LIMIT = config('TAG_HARD_SIZE_LIMIT')

// TODO: make a regex to match generateUuid() value for "unique_tab_id" inputs
// function generateUuid() {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//         let r = Math.random()*16|0, v = c === 'x' ? r : ((r&0x3)|0x8);
//         return v.toString(16);
//     });
// }

const minLength = 140
const maxLength = 200 * 6.5

// TODO: one single format, revise format on client side
const today = () => {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    const yyyy = today.getFullYear()
    return yyyy + '-' + mm + '-' + dd
}
// const d = new Date(yyyy, mm-1, dd, 0, 0, 0, 0)

export const loginSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('username', S.string().format(S.FORMATS.EMAIL))
    .prop('password', S.string().minLength(8).maxLength(40))
    .required(['username', 'password'])

export const signupSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('username', S.string().format(S.FORMATS.EMAIL))
    .prop('password', S.string().minLength(4).maxLength(40))
    .prop('firstName', S.string().minLength(2).maxLength(40))
    .prop('secondName', S.string().minLength(2).maxLength(40))
    .required(['username', 'password', 'firstName', 'secondName'])

export const resetSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('password', S.string().minLength(8).maxLength(40))
    .required(['username', 'password'])

export const gwooglSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('title_desc', S.string().minLength(3).maxLength(100))
    .required()
    .prop('exact', S.boolean().default(false))
    .prop('div_q', S.anyOf([S.string().minLength(3).maxLength(40), S.string().const('')]))
    .required()
    .prop('since', S.string().format(S.FORMATS.DATE))
    .prop(
        'section',
        S.string().enum([Sections.Markets, Sections.Skills, Sections.Hobbies, Sections.Events, Sections.Blogs]),
    )

export const geolocationSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('lat', S.number().maximum(90).minimum(-90))
    .prop('lng', S.number().maximum(180).minimum(-180))
    .prop('section', S.string().enum([Sections.Markets, Sections.Events]))
    .required(['lat', 'lng', 'section'])

export const marketsSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('title', S.string().minLength(10).maxLength(100).required())
    .prop('desc', S.string().minLength(minLength).maxLength(maxLength).required())
    .prop(
        'tags',
        S.array().minItems(1).maxItems(3).items(S.string().minLength(3).maxLength(TAG_HARD_SIZE_LIMIT)).required(),
    )
    .prop('offer', S.boolean().default(false))
    .prop('lat', S.number().maximum(90).minimum(-90))
    .prop('lng', S.number().maximum(180).minimum(-180))
    .prop('div', S.string().minLength(3).maxLength(40))
    .prop('section', S.string().enum([Sections.Markets]).required())

export const blogsSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('title', S.string().minLength(10).maxLength(100).required())
    .prop('desc', S.string().minLength(minLength).maxLength(maxLength).required())
    .prop(
        'tags',
        S.array().minItems(1).maxItems(3).items(S.string().minLength(3).maxLength(TAG_HARD_SIZE_LIMIT)).required(),
    )
    .prop('section', S.string().enum([Sections.Blogs]).required())

export const hobbiesSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('title', S.string().minLength(10).maxLength(100).required())
    .prop('desc', S.string().minLength(minLength).maxLength(maxLength).required())
    .prop(
        'tags',
        S.array().minItems(1).maxItems(3).items(S.string().minLength(3).maxLength(TAG_HARD_SIZE_LIMIT)).required(),
    )
    .prop('section', S.string().enum([Sections.Blogs]).required())

export const eventsSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('title', S.string().minLength(10).maxLength(100).required())
    .prop('desc', S.string().minLength(minLength).maxLength(maxLength).required())
    .prop(
        'tags',
        S.array().minItems(1).maxItems(3).items(S.string().minLength(3).maxLength(TAG_HARD_SIZE_LIMIT)).required(),
    )
    .prop('lat', S.number().maximum(90).minimum(-90))
    .prop('lng', S.number().maximum(180).minimum(-180))
    .prop('div', S.string().minLength(3).maxLength(40))
    .prop('section', S.string().enum([Sections.Events]).required())
    .prop(
        'fromDate',
        S.raw({
            format: 'date',
            formatMinimum: today(),
            type: 'string',
        }),
    )
    .prop(
        'toDate',
        S.raw({
            format: 'date',
            formatMinimum: today(),
            type: 'string',
        }),
    )

const mongoHex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
export const messageSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop(
        'message',
        S.string()
            .minLength(minLength / 2)
            .maxLength(maxLength / 2)
            .required(),
    )
    .prop('username', S.string().format(S.FORMATS.EMAIL))
    .prop('id', S.string().pattern(mongoHex))

export const updateListingSchema = S.object().prop(
    'description',
    S.string().minLength(minLength).maxLength(maxLength).required(),
)

const marketsSchema_ = () => {
    return { called: false, def: marketsSchema }
}

const blogsSchema_ = () => {
    return { called: false, def: blogsSchema }
}

const hobbiesSchema_ = () => {
    return { called: false, def: hobbiesSchema }
}

const eventsSchema_ = () => {
    return { called: false, def: eventsSchema }
}

/*
    These are rules to be maintained all over the app On server side but
    also sometimes passed to client to be maintained on the browser.
    Keys as defined might represent:
    * The actual name of some context (HTTP method, route, ETA page, named forms (in partials)...)
    * Arbitrary chosen and reused elsewhere in the app 
    TODO: I will try to make some intelligence and have a clear definition of keys (the earlier case).
    Example 1: on 'api' env, the login page is requested (/login => login.eta), inputs in HTML named form 'doLogin' must have required tag
    Example 2: on 'api' env, the listings page is requested (/listings/, /listings/{section}/...),
    .........it includes partials ex: HTML named form 'queryGeolocation', inputs in HTML named form 'queryGeolocation' must have required tag
    Example 3: on 'api' env, user POSTs data, the appropriate endpoint handles validation accordingly
**/
const constraints = {
    api: {
        // GET represents endpoints which are eta pages...
        // Each page might contain partials (which are forms here)
        GET: {
            listing: {
                addComment: {
                    requiredUXInputs: ['message'],
                },
            },
            listings: {
                addBlog: {
                    minInputs: { desc: 10, title: 10 },
                    requiredUXInputs: ['title', 'desc', 'tags'],
                },
                addEvent: {
                    minInputs: { desc: 10, title: 10 },
                    requiredUXInputs: ['title', 'desc', 'tags'],
                },
                addMarket: {
                    minInputs: { desc: 10, title: 10 },
                    requiredUXInputs: ['title', 'desc', 'tags'],
                },
                addSkill: {
                    minInputs: { desc: 10, title: 10 },
                    requiredUXInputs: ['title', 'desc', 'tags'],
                },
                queryGeolocation: {
                    requiredUXInputs: [],
                },
                queryGwoogl: {
                    minInputs: { title_desc: 3 },
                    requiredUXInputs: ['title_desc'],
                },
            },
            login: {
                doLogin: {
                    minInputs: { password: 5, username: 6 },
                    requiredUXInputs: ['username', 'password'],
                },
            },
            reset: {
                doReset: {
                    minInputs: { password: 8 },
                    requiredUXInputs: ['password'],
                },
            },
            signup: {
                doSignup: {
                    minInputs: { firsName: 2, password: 5, secondName: 2, username: 6 },
                    requiredUXInputs: ['username', 'password', 'firsName', 'secondName'],
                },
            },
        },
        // POST represents constraints to be maintained on server, when data is POSTed
        POST: {
            blogs: {
                geolocation: false,
                illustrations: false,
                schema: blogsSchema_,
                secured: true,
                upload: false,
            },
            events: {
                geolocation: true,
                illustrations: false,
                schema: eventsSchema_,
                secured: true,
                upload: false,
            },
            hobbies: {
                geolocation: false,
                illustrations: false,
                schema: hobbiesSchema_,
                secured: true,
                upload: false,
            },
            markets: {
                geolocation: true,
                illustrations: false,
                schema: marketsSchema_,
                secured: true,
                upload: true,
            },
        },
    },
    // to change
    production: {
        GET: {
            listing: {
                addComment: {
                    requiredUXInputs: ['message'],
                },
            },
            listings: {
                addEvent: {
                    minInputs: { desc: 10, title: 10 },
                    requiredUXInputs: ['title', 'desc', 'tags'],
                },
                addMarket: {
                    minInputs: { desc: 10, title: 10 },
                    requiredUXInputs: ['title', 'desc', 'tags'],
                },
                addSkill: {
                    minInputs: { desc: 10, title: 10 },
                    requiredUXInputs: ['title', 'desc', 'tags'],
                },
                queryGeolocation: {
                    requiredUXInputs: [],
                },
                queryGwoogl: {
                    minInputs: { title_desc: 3 },
                    requiredUXInputs: ['title_desc'],
                },
            },
            login: {
                doLogin: {
                    minInputs: { password: 5, username: 6 },
                    requiredUXInputs: ['username', 'password'],
                },
            },
            reset: {
                doReset: {
                    minInputs: { password: 8 },
                    requiredUXInputs: ['password'],
                },
            },
            signup: {
                doSignup: {
                    minInputs: { firsName: 2, password: 5, secondName: 2, username: 6 },
                    requiredUXInputs: ['username', 'password', 'firsName', 'secondName'],
                },
            },
        },
        POST: {
            blogs: {
                geolocation: false,
                illustrations: false,
                schema: blogsSchema_,
                secured: true,
                upload: false,
            },
            events: {
                geolocation: true,
                illustrations: false,
                schema: eventsSchema_,
                secured: true,
                upload: false,
            },
            hobbies: {
                geolocation: false,
                illustrations: false,
                schema: hobbiesSchema_,
                secured: true,
                upload: false,
            },
            markets: {
                geolocation: true,
                illustrations: false,
                schema: marketsSchema_,
                secured: true,
                upload: true,
            },
        },
    },
}

export default constraints
