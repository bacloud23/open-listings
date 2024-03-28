// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ TAGIFY @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/**
 *
 * @param {any} tagData
 */

export function colorContext(context) {
    return function transformTag(tagData) {
        // tagData.style = '--tag-bg:' + lightenDarkenColor(stringToColor(tagData.value), 30)
        if (context && context === 'all-tags') {
            tagData.style += '; --readonly-striped: 0'
        }
    }
}
