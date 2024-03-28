import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { createRequire } from 'module'
import { getBorders } from '../../data/geo/geoJSONEncoder.js'
import { Sections } from '../../types.d.js'
import { config } from '../../utils.js'
import constraints from '../constraints/constraints.js'
import { toTitle } from './routines/strings.js'
import { allTags, getAscendants } from './routines/tags.js'

const require = createRequire(import.meta.url)

const coordinates = getBorders()
const localize = {
    ar: require('ajv-i18n/localize/ar'),
    en: require('ajv-i18n/localize/en'),
    'en-US': require('ajv-i18n/localize/en'),
    fr: require('ajv-i18n/localize/fr'),
}

///////////////////////////////////THIS IS THE ACTUAL PIPELINE/////////////////////////////////////////////
function PipeLine(data) {
    this.data = data
}
///////////////////////////////////SIMPLE BOOLEAN HELPER///////////////////////////////////////////////////
const and = (x, y) => x && y
const or = (x, y) => x || y
const assign = (fn, obj, solution) => (obj.value = fn(obj.value, solution))
function ChainBool(solution, op) {
    this.value = op === 'or' ? assign(or, this, solution) : assign(and, this, solution)
}

PipeLine.prototype = {
    cast: function () {
        this.data.lat = parseFloat(this.data.lat)
        this.data.lng = parseFloat(this.data.lng)
        return this
    },
    // only if for the first tag !!!
    deriveTagsParents: function (section) {
        if (section !== Sections.Markets && section !== Sections.Hobbies) {
            // TODO: no real hierarchy now
            this.data.parent = this.data.tags[0]
            this.data.granpa = this.data.tags[0]
            return this
        }

        const english = allTags[section]['en'].indexOf(this.data.tags[0]) > -1
        const french = !english && allTags[section]['fr'].indexOf(this.data.tags[0]) > -1
        const arabic = !french && allTags[section]['ar'].indexOf(this.data.tags[0]) > -1
        try {
            if (!english && !french) throw new Error('Tags should be chosen from list')
            let parent, granpa
            if (english) {
                ;[parent, granpa] = getAscendants(this.data.tags[0], 'en', section)
            }
            if (french) {
                ;[parent, granpa] = getAscendants(this.data.tags[0], 'fr', section)
            }
            if (arabic) {
                ;[parent, granpa] = getAscendants(this.data.tags[0], 'ar', section)
            }
            this.data.parent = parent
            this.data.granpa = granpa
        } catch (error) {
            this.error['deriveTagsParents'] = error.message
        }
        return this
    },
    error: {},
    evaluate: function () {
        return { data: this.data, error: this.error, isTrue: this.value }
    },

    // Expects this.data to be a point
    isPointInsidePolygon: function (vs, op) {
        const predicate = (vs) => {
            const x = this.data.lat
            const y = this.data.lng
            if (x > 90 || x < -90 || y > 180 || y < -180) return false
            let inside = false
            for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                const xi = vs[i][1]
                const yi = vs[i][0]
                const xj = vs[j][1]
                const yj = vs[j][0]
                const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
                if (intersect) inside = !inside
            }
            return inside
        }
        const solution = predicate(vs)
        ChainBool.call(this, solution, op)
        return this
    },
    // Expects this.data to be body.tags
    isTagsValid: function (op) {
        const predicate = () => {
            try {
                let tags = JSON.parse(this.data.tags)
                this.data.tags = tags.map((a) => a.value)
                return true
            } catch (error) {
                this.error['isTagsValid'] = error.message
                return false
            }
        }
        ChainBool.call(this, predicate(), op)
        return this
    },
    // Expects this.data to be body
    isValidBetween: function (schema, op) {
        const predicate = (schema) => {
            if (schema.called) {
                return true
            }
            const validate = ajv.compile(schema.def.valueOf())
            const valid = validate(this.data)
            if (!valid) this.error['validation'] = validate.errors
            return this.error === null
        }
        const solution = predicate(schema)
        ChainBool.call(this, solution, op)
        return this
    },
    // Expects this.data to be body
    mapInputValues: function (inputs) {
        const keyValues = Object.keys(this.data).map((key) => {
            if (inputs.indexOf(key) > -1) {
                const isTrue = this.data[key] === 'on'
                return [key, isTrue]
            } else {
                return [key, this.data[key]]
            }
        })
        const dictionary = Object.fromEntries(keyValues)
        inputs.forEach((key) => {
            dictionary[key] = dictionary[key] ? dictionary[key] : false
        })
        Object.keys(this.data).forEach((key) => {
            this.data[key] = dictionary[key]
        })
        return this
    },
    // Expects this.data to be body having body.tags
    // We don't care if point in on the edge of polygon. Too much to care about.
    randomizeCoordinations: function (meters) {
        const x = parseFloat(this.data.lat)
        const y = parseFloat(this.data.lng)
        const rand = Math.random() - 0.5
        meters = Math.round(rand * meters)
        const coefficient = meters * 0.0000089
        this.data.lat = x + coefficient
        this.data.lng = y + coefficient / Math.cos(x * 0.018)
        // Or just downcast (lat-lng)
        // this.data.lat = parseFloat(parseFloat(x).toPrecision(4))
        // this.data.lng = parseFloat(parseFloat(y).toPrecision(4))
        this.data.geolocation = { coordinates: [this.data.lng, this.data.lat], type: 'Point' }
        return this
    },
    toTitle: function (limit) {
        try {
            this.data.title = toTitle(this.data.title, limit)
        } catch (error) {
            this.error['bad title'] = error.message
        }
        return this
    },
    value: true,
}
// TODO: verify the correct coerceTypes for inputs: checkboxes, radio, etc etc
// https://ajv.js.org/coercion.html big deal.
// so much inputs to test.
const ajv = new Ajv({ allErrors: true, coerceTypes: true, parseDate: true })
addFormats(ajv)

function listingValidation(req) {
    const { body, method } = req
    const section = body.section
    const { geolocation, schema } = constraints[config('NODE_ENV')][method][section]

    ///////////////////////////////////THIS IS CONSTRUCTION OF THE PIPELINE (MAIN LIKE)////////////////////
    const geoPipeline = new PipeLine(body)
    const nlpPipeline = new PipeLine(body)
    const bodyPipeline2 = new PipeLine(body)
    const bodyPipeline3 = new PipeLine(body)
    nlpPipeline.toTitle(100)
    const geoValid = !geolocation
        ? true
        : geoPipeline.cast().randomizeCoordinations(100).isPointInsidePolygon(coordinates).evaluate().isTrue
    const tagsValid = !body.tags ? true : bodyPipeline2.isTagsValid().deriveTagsParents(section).evaluate().isTrue
    // Value mapping is to deal with HTML input types,
    // like the weird behavior of Checkboxes (https://stackoverflow.com/q/11424037/1951298)
    // Other value mappings (for the whole app are in ../decorators/valueMapping.js)
    if ([Sections.Skills, Sections.Blogs, Sections.Markets].indexOf(section) > -1)
        bodyPipeline3.mapInputValues(['offer'])
    ///////////////////////////////////THE REST IS REFORMATTING OF RESULTS//////////////////////////////////
    let errors = []

    if (geoPipeline.error) {
        let friendlyErrors = Object.entries(geoPipeline.error).map(([key, value]) => errors.push(`${key}: ${value}`))
        errors = errors.concat(friendlyErrors)
    }

    if (nlpPipeline.error) {
        let friendlyErrors = Object.entries(nlpPipeline.error).map(([key, value]) => errors.push(`${key}: ${value}`))
        errors = errors.concat(friendlyErrors)
    }

    const singletonSchema = schema()

    // Final validation according to schema / if not yet validated
    const validate = ajv.compile(singletonSchema.def.valueOf())
    const valid = singletonSchema.called ? true : validate(body)

    if (!valid) {
        localize[(req.i18n && req.i18n.language) || req.cookies.locale || 'en'](validate.errors)
        errors = validate.errors?.map((err) => {
            if (err.dataPath) return `"${err.dataPath.substring(1)}" - ${err.message}`
            if (err.instancePath) return `"${err.instancePath.substring(1)}" - ${err.message}`
            else return `${err.message}`
        })
        return { errors, geoValid: false, tagsValid: false }
    }
    return { errors, geoValid, tagsValid }
}

function tagsSubValidation(req) {
    const { body } = req
    const bodyPipeline = new PipeLine(body)
    const tagsValid = !body.tags ? false : bodyPipeline.isTagsValid().evaluate().isTrue
    let errors = []
    return { errors, tagsValid }
}

export { listingValidation, tagsSubValidation }
