// @ts-ignore
import { Tooltip } from 'bootstrap'
import InApp from 'detect-inapp'
import htmx from 'htmx.org'
import { setupTour } from './accessibility/setupTour.js'
// import { setupDelimitationsKeywords } from './auto-complete/setup-delimitations-keywords.js'
import { setupUndrawKeywords } from './auto-complete/setup-undraw-keywords.js'
import { setupInteractiveListings } from './cards/setup-interactive-listings.js'
import { setupInteractiveNotifications } from './cards/setup-interactive-notifications.js'
import { setupSadFace } from './collaboration/setup-sad-face.js'
import { setupTabUuid } from './fingerprint/tabUuid.js'
import { setupScrollBlink } from './focus/scroll&blink.js'
// import { CheckCSS } from 'checkcss'
import { isDevEnv } from '../views/main/consts.js'
import { setupDeletes } from './deletes/deletes.js'
import { setupFavorites } from './favorites/favorites.js'
import { setupI18n } from './i18n/setup-i18n.js'
import { loadFile } from './load-file/load-file.js'
import { setupScreenFull } from './screenfull/setup-screenfull.js'
import { setupAutoComplete } from './search/setup-autocomplete.js'
import { setupHolmes } from './search/setup-holmes.js'
import { renderShared } from './syncing/render-json.js'
import { setupInputTags } from './tags/setup-input-tags.js'
import { setupSubscribeTags } from './tags/setup-subscribe-tags.js'
import { setupQuill } from './text-editor/setup-editor.js'
import { runToasts } from './toasts/toasts.js'
import { setupThemeSwitcher } from './tweakBootstrap/setup-theme-switcher.js'

/**
 * Fulfill promises on phone all other devices
 * Also crushes if one or all fail depending on environment
 * production is more permissive for fails than local/dev
 */
export const setupShared = () => {
    const absoarb = (x) => x
    absoarb(Tooltip)
    const log = window.log
    window.htmx = htmx
    log.info('Logging setup shared')
    const toArray = (a) => (Array.isArray(a) ? a : [a])
    const inapp = new InApp(navigator.userAgent || navigator.vendor || window.opera)
    let functions = [
        [setupI18n, true],
        [setupHolmes, true],
        [setupAutoComplete, true],
        [setupInputTags, true],
        [setupSubscribeTags, true],
        // Fix bugs
        // [setupLeaflet, true],
        [setupUndrawKeywords, true],
        [runToasts, true],
        // TODO: Fix not working favorite feature
        [setupFavorites, true],
        [setupDeletes, true],
        [setupInteractiveListings, false],
        [setupInteractiveNotifications, true],
        [setupTour, false],
        [setupScrollBlink, true],
        [renderShared, true],
        [setupSadFace, false],
        [setupScreenFull, true],
        [setupTabUuid, true],
        [setupThemeSwitcher, true],
        [setupQuill, true],
    ]
    if (inapp.isMobile) {
        log.info('RUNNING ON A MOBILE DEVICE')
        functions = functions.filter((p) => p[1])
    }
    // Instantiate Promises
    let promises = functions.map((p) => p[0]())

    const logPromises = (results) => {
        log.info('Logging succeeded promises')
        toArray(results).forEach((result) => log.info(result))
    }
    const logErrors = (errors) => {
        log.info('Logging failed promises')
        toArray(errors).forEach((error) => log.info(error))
    }

    Promise.all(promises)
        .then((results) => logPromises(results))
        .catch((errors) => logErrors(errors))

    // TODO: Review sockets
    // setupSocket()
    // Global objects that I need as inline JS inside HTML (Could be attached 100% in JS though)
    window.loadFile = loadFile
    if (isDevEnv) {
        // const checkcss = new CheckCSS();
        // checkcss.scan().watch();
    }

    // fetch('/session', {
    //     credentials: 'include',
    // }).then((res) => {
    //     console.log(res)
    // })
}
