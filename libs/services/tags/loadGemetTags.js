import { XMLParser } from 'fast-xml-parser'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { config } from '../../../utils.js'
import { flexTags } from '../routines/flexTags.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TAG_HARD_SIZE_LIMIT = config('TAG_HARD_SIZE_LIMIT')
const TAG_MAX_SIZE_LIMIT_TO_IGNORE = config('TAG_MAX_SIZE_LIMIT_TO_IGNORE')
/**
 * Load GEMET labels for "blogs"
 */
export function loadGemetTags(give) {
    give.GEMETLabelsFr = []
    give.GEMETLabelsEn = []
    give.GEMETLabelsAr = []

    const parser = new XMLParser()
    const getLabels = (path_) => {
        const buffer = fs.readFileSync(path.join(__dirname, path_))
        const fileContent = buffer.toString()
        let jObj = parser.parse(fileContent)
        return jObj['rdf:RDF']['rdf:Description'].map((label) => label['skos:prefLabel'])
    }
    give.GEMETLabelsFr = getLabels('../../../data/taxonomy/gemet-definitions-fr.rdf')
    give.GEMETLabelsAr = getLabels('../../../data/taxonomy/gemet-definitions-ar.rdf')
    give.GEMETLabelsEn = getLabels('../../../data/taxonomy/gemet-definitions-en.rdf')

    flexTags(give.GEMETLabelsFr, true, TAG_MAX_SIZE_LIMIT_TO_IGNORE, TAG_HARD_SIZE_LIMIT)
    flexTags(give.GEMETLabelsAr, true, TAG_MAX_SIZE_LIMIT_TO_IGNORE, TAG_HARD_SIZE_LIMIT)
    flexTags(give.GEMETLabelsEn, true, TAG_MAX_SIZE_LIMIT_TO_IGNORE, TAG_HARD_SIZE_LIMIT)
}

/**
 * Load both Wiki & GEMET tags for "blogs"
 */
export function loadWikiAndGemetTags(give) {
    // For tags we have GEMET+Hobbies (but we will see if we add all other tags all-together)
    // give.blogsTagsEn = give.googleTagsEnLite.concat(give.ESCOTagsEn).concat(give.cptallTagsEn).concat(give.wikiHobbiesEn)
    // give.blogsTagsFr = give.googleTagsFrLite.concat(give.ESCOTagsFr).concat(give.cptallTagsFr).concat(give.wikiHobbiesFr)
    // give.blogsTagsAr = give.googleTagsArLite.concat(give.ESCOTagsAr).concat(give.cptallTagsAr).concat(give.wikiHobbiesAr)

    give.blogsTagsEn = give.GEMETLabelsEn.concat(give.wikiHobbiesEn)
    give.blogsTagsFr = give.GEMETLabelsFr.concat(give.wikiHobbiesFr)
    give.blogsTagsAr = give.GEMETLabelsAr.concat(give.wikiHobbiesAr)

    flexTags(give.blogsTagsEn, true, TAG_MAX_SIZE_LIMIT_TO_IGNORE, TAG_HARD_SIZE_LIMIT)
    flexTags(give.blogsTagsFr, true, TAG_MAX_SIZE_LIMIT_TO_IGNORE, TAG_HARD_SIZE_LIMIT)
    flexTags(give.blogsTagsAr, true, TAG_MAX_SIZE_LIMIT_TO_IGNORE, TAG_HARD_SIZE_LIMIT)
}
