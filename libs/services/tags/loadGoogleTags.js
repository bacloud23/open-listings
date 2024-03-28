import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { config } from '../../../utils.js'
import { flexTags } from '../routines/flexTags.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TAG_HARD_SIZE_LIMIT = config('TAG_HARD_SIZE_LIMIT')
const TAG_MAX_SIZE_LIMIT_TO_IGNORE = config('TAG_MAX_SIZE_LIMIT_TO_IGNORE')

const taxonomyPathEn = '../../../data/taxonomy/taxonomy-with-ids.en-US.txt'
const fileSyncEn = fs.readFileSync(path.join(__dirname, taxonomyPathEn)).toString()
const fileContentEn = fileSyncEn.replace(',', '_').split('\n').filter(Boolean)

const taxonomyPathAr = '../../../data/taxonomy/taxonomy-with-ids.ar-SA.txt'
const fileSyncAr = fs.readFileSync(path.join(__dirname, taxonomyPathAr)).toString()
const fileContentAr = fileSyncAr.replace(',', '_').split('\n').filter(Boolean)

const taxonomyPathFr = '../../../data/taxonomy/taxonomy-with-ids.fr-FR.txt'
const fileSyncFr = fs.readFileSync(path.join(__dirname, taxonomyPathFr)).toString()
const fileContentFr = fileSyncFr.replace(',', '_').split('\n').filter(Boolean)

const splitBy = (sep) => (str) => str.split(sep).map((x) => x.trim())
const splitLine = splitBy('-')
const splitCategories = splitBy('>')

const load = (lines) =>
    // put all lines into a "container"
    // we want to process all lines all the time as opposed to each line individually
    [lines]
        // separate id and categories
        // e.g ['3237', 'Animals & Pet Supplies > Live Animals']
        .map((lines) => lines.map(splitLine))
        // get categories without id
        // e.g. ['Animals & Pet Supplies', 'Live Animals']
        .map((lines) => lines.map((line) => splitCategories(line[1])))
        .pop() //TODO: get  'Animals & Pet Supplies' or 'Live Animals' ??

/**
 * Google tags for "markets"
 */
export function loadGoogleTags(give) {
    give.googleTagsEn = [...new Set(load(fileContentEn).filter((arr) => arr.length === 3))]
    give.googleTagsEnLite = give.googleTagsEn.map((/** @type string */ elem) => elem[2])

    give.googleTagsAr = [...new Set(load(fileContentAr).filter((arr) => arr.length === 3))]
    give.googleTagsArLite = give.googleTagsAr.map((/** @type string */ elem) => elem[2])

    give.googleTagsFr = [...new Set(load(fileContentFr).filter((arr) => arr.length === 3))]
    give.googleTagsFrLite = give.googleTagsFr.map((/** @type string */ elem) => elem[2])

    flexTags(give.googleTagsEnLite, true, TAG_MAX_SIZE_LIMIT_TO_IGNORE, TAG_HARD_SIZE_LIMIT)
    flexTags(give.googleTagsArLite, true, TAG_MAX_SIZE_LIMIT_TO_IGNORE, TAG_HARD_SIZE_LIMIT)
    flexTags(give.googleTagsFrLite, true, TAG_MAX_SIZE_LIMIT_TO_IGNORE, TAG_HARD_SIZE_LIMIT)
}
