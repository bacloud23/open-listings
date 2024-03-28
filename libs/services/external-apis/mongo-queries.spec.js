import { describe, it } from '@jest/globals'
import Redis from 'ioredis-mock'
import { beforeEach } from 'node:test'
import { collection, logger } from '../../../utils.js'
import { objectIdFromDate } from '../../constraints/transformers.js'
import mongoQueries from './mongo-queries.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'
import { Collections } from '../../../types.d.js'

const redis = new Redis({
    // `options.data` does not exist in `ioredis`, only `ioredis-mock`
    data: {
        emails: {
            'bruce@wayne.enterprises': '2',
            'clark@daily.planet': '1',
        },
        'user:1': { email: 'clark@daily.planet', id: '1', username: 'superman' },
        'user:2': { email: 'bruce@wayne.enterprises', id: '2', username: 'batman' },
        user_next: '3',
    },
})
const Methods = {
    autocomplete: '',
    getListingById: '',
    getListingsByDivision: '',
    getListingsByGeolocation: '',
    getListingsByKeyword: '',
    getListingsByTag: '',
    getListingsByUser: '',
    getListingsForModeration: '',
    getListingsSince: '',
    getNotificationsByUser: '',
    getTmpUserByToken: '',
    getUserById: '',
    gwoogl: '',
    insertAnnouncement: '',
    insertComment: '',
    insertListing: '',
    insertTmpUser: '',
    insertUser: '',
    removeDocument: '',
    subscribe: '',
    toggleValue: '',
    topBy: '',
    topTags: '',
    updateListing: '',
    updateUser: '',
}

describe('Queries', () => {
    let id, QInstance
    Object.values(Collections).forEach((collName) => {
        collection(null, collName)
    })
    beforeEach(() => {
        id = objectIdFromDate(new Date())
    })
    it(Methods.getListingById, () => {
        QInstance = new mongoQueries(redis, new logger(null).log)
        QInstance.getListingById(id, true, '---')
    })
    it(Methods.insertListing, async () => {
        const QInstance = new mongoQueries(redis, new logger(null).log)
        /** @type Types.Listing */
        const listings = {
            a: true,
            cdesc: 'clean description',
            d: false,
            desc: 'description',
            granpa: 'tag1',
            lang: 'und', //check
            parent: 'tag1',
            section: 'blogs',
            tags: ['tag1'],
            title: 'title',
            usr: 'user@mail.com',
        }
        // eslint-disable-next-line no-unused-vars
        const id = await QInstance.insertListing(listings)
    })
    it(Methods.insertComment, async () => {
        const QInstance = new mongoQueries(redis, new logger(null).log)
        /** @type Types.Comment */
        const comment = {
            cmsg: 'message',
            from: 'user@email.com',
            lang: 'en',
            message: 'message',
            sent: new Date(),
            thread: 'thread',
            threadId: 'threadId',
            to: 'user@email.com',
        }
        // eslint-disable-next-line no-unused-vars
        const id = await QInstance.insertComment(comment)
    })
})
