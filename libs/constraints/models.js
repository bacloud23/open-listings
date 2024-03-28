// TODO: Catch errors on use of these models (in mongo-queries and in routes)
import { ObjectId } from '@fastify/mongodb'
import { ArrayModel, BasicModel, ObjectModel } from 'objectmodel'
import { Sections } from '../../types.d.js'

const URL =
    '^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?'
const Coordinate = new BasicModel(Number)

// Example for JSdoc typing only
export const ListingModel = {
    a: true,
    cdesc: '',
    d: true,
    desc: '',
    granpa: '',
    // TODO: add front end constraints
    lang: '', //check
    parent: '',
    section: '',
    tags: [''],
    title: '',
    usr: '',
    // img: new RegExp(URL),

    // tagsLang: ['ar', 'fr', 'en'], //check
}
const Listing = new ObjectModel({
    a: Boolean,
    cdesc: String,
    d: Boolean,
    desc: String,
    granpa: String,
    // TODO: add front end constraints
    lang: ['ar', 'fr', 'en', 'und'], //check
    parent: String,
    section: Object.values(Sections),
    tags: ArrayModel(String),
    title: String,
    usr: String,
    // img: new RegExp(URL),

    // tagsLang: ['ar', 'fr', 'en'], //check
})

const Market = Listing.extend({
    div: String,
    geolocation: {
        coordinates: ArrayModel(Coordinate)
            .extend()
            .assert((a) => a.length === 2, 'should have two coordinates'),
        type: 'Point',
    },
    img: new RegExp(URL),
    lat: Number,
    lng: Number,
    offer: [Boolean],
    section: Sections.Markets,
    thum: [new RegExp(URL)],
}).assert(
    (o) => o.lat === o.geolocation.coordinates[1] && o.lng === o.geolocation.coordinates[0],
    'should have two coordinates | point mismatch',
)
// .assert(o => o.lang === o.tagsLang, "language mismatch")

const Event = Listing.extend({
    div: String,
    fromDate: String,
    geolocation: {
        coordinates: ArrayModel(Coordinate)
            .extend()
            .assert((a) => a.length === 2, 'should have two coordinates'),
        type: 'Point',
    },
    lat: Number,
    lng: Number,
    section: Sections.Events,
    toDate: String,
})
    // TODO: deal with precision after cast &
    // .assert(
    //     (o) => o.lat !== o.geolocation.coordinates[1] || o.lng !== o.geolocation.coordinates[0],
    //     'should have two coordinates | point mismatch',
    // )
    .assert((o) => new Date(o.toDate).getTime() > Date.now(), 'The end of event must be in future')
    .assert(
        (o) => new Date(o.toDate).getTime() >= new Date(o.fromDate).getTime(),
        "End of event must be greater than it's start",
    )

const Skill = Listing.extend({
    color: String,
    offer: [Boolean],
    section: Sections.Skills,
    undraw: String,
})

const Blog = Listing.extend({
    section: Sections.Blogs,
})
const Hobby = Listing.extend({
    section: Sections.Hobbies,
})

export const CommentModel = {
    from: '',
    message: '',
    sent: new Date(),
    thread: '',
    threadId: '',
    to: '',
}
const Comment = new ObjectModel({
    cmsg: String,
    from: String,
    lang: ['ar', 'fr', 'en', 'und'],
    message: String,
    sent: Date,
    thread: String,
    threadId: String,
    to: String,
})
    .assert((c) => c.from !== c.to, 'comment to someone else')
    .assert(
        (c) => ObjectId.isValid(c.threadId) || /^[a-zA-Z]{16}$/.test(c.threadId),
        'thread Id is not a valid Mongo Id',
    )

export const UserModel = {
    firstName: '',
    isVerified: true,
    passHash: '',
    password: '',
    role: '',
    secondName: '',
    username: '',
}
const User = new ObjectModel({
    firstName: String,
    isVerified: Boolean,
    passHash: String,
    password: [String],
    role: ['admin', 'regular'],
    secondName: String,
    username: String,
})
    .assert((u) => typeof u.password === 'undefined' || u.username !== u.password, 'username and password must differ')
    .assert((u) => typeof u.password === 'undefined' || u.password.length >= 8, 'password is too weak')

// TODO: assert only when password exists !

export { Blog, Comment, Event, Hobby, Market, Skill, User }
