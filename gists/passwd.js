import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import zxcvbnFrPackage from '@zxcvbn-ts/language-fr'
import { Mutex } from 'async-mutex'

const options = {
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
    },
}
// set options acts on the main module
zxcvbnOptions.setOptions(options)
let locks = new Map()
async function isFinePassword(password, lang, sessionId) {
    if (!locks.has(sessionId)) locks.set(sessionId, new Mutex())
    // @ts-ignore
    const release = await locks.get(sessionId).acquire()

    switch (lang) {
    case 'fr':
        options.dictionary = {
            ...zxcvbnCommonPackage.dictionary,
            ...zxcvbnFrPackage.dictionary,
        }
        options.translations = zxcvbnFrPackage.translations
        zxcvbnOptions.setOptions(options)
        break
    default:
        break
    }
    let result = zxcvbn(password)
    release()
    return result
}

const res = await isFinePassword("hello", "fdr", "0001")
console.log(res.feedback)