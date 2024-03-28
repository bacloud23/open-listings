import { createRequire } from 'module'
import { config } from '../../../utils.js'
import { flexTags } from '../routines/flexTags.js'

const require = createRequire(import.meta.url)

const TAG_HARD_SIZE_LIMIT = config('TAG_HARD_SIZE_LIMIT')
const TAG_MAX_SIZE_LIMIT_TO_IGNORE = config('TAG_MAX_SIZE_LIMIT_TO_IGNORE')

/**
 * Load wiki tags for "hobbies"
 */
export function loadHobbiesTags(give) {
    give.wikiHobbiesEn = require('../../../data/taxonomy/hobbies_en.json')
    give.wikiHobbiesFr = require('../../../data/taxonomy/hobbies_fr.json')
    give.wikiHobbiesAr = require('../../../data/taxonomy/hobbies_ar.json')
    // TODO: sacrifice Parents for now.
    give.wikiHobbiesEn = Object.values(give.wikiHobbiesEn).flat()
    give.wikiHobbiesFr = Object.values(give.wikiHobbiesFr).flat()
    give.wikiHobbiesAr = Object.values(give.wikiHobbiesAr).flat()

    flexTags(give.wikiHobbiesEn, true, TAG_MAX_SIZE_LIMIT_TO_IGNORE, TAG_HARD_SIZE_LIMIT)
    flexTags(give.wikiHobbiesFr, true, TAG_MAX_SIZE_LIMIT_TO_IGNORE, TAG_HARD_SIZE_LIMIT)
    flexTags(give.wikiHobbiesAr, true, TAG_MAX_SIZE_LIMIT_TO_IGNORE, TAG_HARD_SIZE_LIMIT)
}
