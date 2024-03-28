import decancer from 'decancer'
import linkifyHtml from 'linkify-html'
import { createRequire } from 'module'
import sanitizeHtml from 'sanitize-html'
import { html, nonLatin, reb, rew } from '../../constraints/regex.js'

const require = createRequire(import.meta.url)
// const purifier = require('html5-purifier')

const naughtyWords = require('naughty-words')

const badWords = naughtyWords.ar.concat(naughtyWords.fr).concat(naughtyWords.en)
const Filter = require('bad-words'),
    filter = new Filter()
filter.addWords(...badWords)

///////////////////////////////////THESE ARE HELPERS, FUNCTIONS THAT I CALL INSIDE THE PIPELINE////////////
function sanitize(str) {
    str = str.replace(/<h1/g, '<h3').replace(/<h2/g, '<h4')
    return sanitizeHtml(str, {
        allowedAttributes: {
            a: ['href', 'name', 'target'],
            span: ['style'],
        },
        allowedStyles: {
            '*': {
                // Match HEX and RGB
                color: html.allowedColors,
                'text-align': [/^left$/, /^right$/, /^center$/],
                // Match any number with px, em, or %
                // 'font-size': [/^\d+(?:px|em|%)$/],
            },
            span: {
                // 'font-size': [/^\d+rem$/],
                'background-color': [/^pink$/],
            },
        },
        allowedTags: html.allowedTags,
    })
}

function cleanSensitive(blob) {
    const whitelisted = []
    for (const regexW in rew) {
        if (Object.prototype.hasOwnProperty.call(rew, regexW)) {
            blob = blob.replace(
                rew[regexW],
                function (match, index) {
                    this.push({ i: index, m: match })
                    return ''
                }.bind(whitelisted),
            )
        }
    }
    const maskStr = (match) => new Array(match.length + 1).join('X')
    for (const regexB in reb) {
        if (Object.prototype.hasOwnProperty.call(reb, regexB)) {
            blob = blob.replace(reb[regexB], maskStr)
        }
    }
    whitelisted.forEach((w) => {
        blob = blob.slice(0, w.i) + w.m + blob.slice(w.i)
    })
    return blob
}
const hrefsRegex = /href\s*=\s*(['"])(https?:\/\/.+?)\1/gi
const safebrowsingRedir = '127.0.0.1:8080/r?url='
function updateLinksInHTML(html) {
    let link
    while ((link = hrefsRegex.exec(html)) !== null) {
        html = html.replace(link[2], safebrowsingRedir + encodeURIComponent(link[2]))
    }
    return html
}

// Chain wrapper for Strings
// I believe operations these are fragile to arbitrary NLP strings.
// Even if tested, w'll try-catch for errors and favour the original text if it fails.
function stringTransformer(s) {
    let internal = String(s)
    this.decancer = function () {
        try {
            internal = decancer(internal).toString()
        } catch (error) {
            return this
        }
        return this
    }
    this.badWords = function () {
        try {
            internal = filter.clean(internal)
        } catch (error) {
            return this
        }
        return this
    }
    this.sanitizeHTML = function () {
        try {
            internal = sanitize(internal)
        } catch (error) {
            return this
        }
        return this
    }
    this.cleanSensitive = function () {
        try {
            internal = cleanSensitive(internal)
        } catch (error) {
            return this
        }
        return this
    }
    this.linkify = function () {
        try {
            internal = linkifyHtml(internal)
            // TODO: setup safebrowsing service
            // internal = updateLinksInHTML(internal)
        } catch (error) {
            return this
        }
        return this
    }
    this.valueOf = function () {
        // remove extra spaces
        return internal.replace(/\s{2,}/g, ' ').trim()
    }
}

// Remove non latin
// Credit
// Author: rjanjic
// Source: https://stackoverflow.com/a/22075070
let wordsInText = (text) => text.match(nonLatin)

// Turn a bad title to a good one
// "hello this is a-- nice @ tit buttyyyy it is very longgggggggggg"
// 'hello this is a nice tit hello'
function toTitle(longBadTitle, limit = 60) {
    // Remove non latin
    longBadTitle = longBadTitle.charAt(0).toUpperCase() + longBadTitle.slice(1)
    longBadTitle = wordsInText(longBadTitle).join(' ')
    if (longBadTitle < 10) throw Error('very bad title')
    if (longBadTitle.length < limit) return longBadTitle
    let type = ''
    let title = longBadTitle.split(' ').reduce((acc, word) => {
        if (!acc) return word
        if (acc.length >= limit || acc.length > limit - 3) return acc
        if (acc.length + word.length >= limit) {
            if (word.length < 6) return acc + ' ' + word
            return (acc + ' ' + word).slice(0, limit)
        } else {
            return acc + ' ' + word
        }
    }, type)
    return title
}

/**
 * Generate initials from an email string
 * Like "sracer2024@yahoo.com" => "S2"
 * @param {String} email_
 * @return {String}
 */
function initials(email_) {
    let email =
        email_
            .split('@')[0]
            .replace(/[0-9]/g, '')
            .split(/[.\-_]/) || []
    if (email.length === 1) {
        return email[0].slice(0, 2).toUpperCase()
    }
    email = ((email.shift()[0] || '') + (email.pop()[0] || '')).toUpperCase()
    return email
}

export { initials, stringTransformer, toTitle }
