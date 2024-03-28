import { Eta } from '../../../../node_modules/eta/dist/browser.module.mjs'
import { LIS } from '../../../helpers/lis.js'

const eta = new Eta({ views: '../templates' })
const template = `<ul>
                    <% for (var i = 0, l = tags.length; i < l; i ++) { %>
                        <li><%- tags[i] %></li>
                    <% } %>
                </ul>`
export function renderTopSearches() {
    const topSearches = LIS.id('sync-top-searches')
    if (!topSearches) {
        return
    }
    fetch('/top/searches', { credentials: 'include' })
        .then((response) => response.json())
        .then((data) => {
            // empty array from server (because no data or because of an error)
            if (!data) {
                return
            }
            topSearches.innerHTML = eta.renderString(template, { tags: data })
        })
}

// renderTopTags
// on sections pages
// { _id: { tags: 'qui', section: 'blogs' }, count: 11 }
// { _id: { tags: 'voluptatem', section: 'skills' }, count: 8 }
// { _id: { tags: 'rerum', section: 'skills' }, count: 8 }
export function renderTopTags(section) {
    const topTags = LIS.id('sync-top-tags')
    if (!topTags) {
        return
    }
    fetch('/top/tags', { credentials: 'include' })
        .then((response) => response.json())
        .then((data) => {
            // empty array from server (because no data or because of an error)
            if (!data || !data[section]) {
                return
            }
            topTags.innerHTML = eta.renderString(template, { tags: data[section] })
        })
}

// renderTopByDiv
// on Index page
// { _id: 'Tindouf', count: 8 }
// { _id: 'Tebessa', count: 7 }
// { _id: 'Ouargla', count: 6 }
export function renderTopByDiv() {
    const topTags = LIS.id('sync-top-by-div')
    if (!topTags) {
        return
    }
    fetch('/top/div', { credentials: 'include' })
        .then((response) => response.json())
        .then((data) => {
            // empty array from server (because no data or because of an error)
            if (!data) {
                return
            }
            topTags.innerHTML = eta.renderString(template, { tags: data })
        })
}
