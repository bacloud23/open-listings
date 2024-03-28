'use strict'

import { loadGemetTags, loadWikiAndGemetTags } from './loadGemetTags.js'
import { loadGoogleTags } from './loadGoogleTags.js'
import { loadHobbiesTags } from './loadHobbiesTags.js'

const give = {}

function loadTags() {
    loadGoogleTags(give)
    loadHobbiesTags(give)
    loadGemetTags(give)
    loadWikiAndGemetTags(give)
}

loadTags()

// const handler = {
//     get(target, property) {
//     // fastify.log.info(`Raw data ${property} loaded`)
//         return target[property];
//     }
// }
// Wrapping give object breaks some IDR links but,,,
// module.exports.give = new Proxy(give, handler);
export { give }
