// Define the modal (for the image onclick) behavior
import { LIS } from '../../helpers/lis.js'

export const setupDeletes = async () => {
    if (
        (typeof __context__ !== 'undefined' && __context__ !== 'alllistings') ||
        !document.querySelector('.ol-deletes')
    ) {
        return '### function "setupDeletes" ignored well'
    }
    const elems = LIS.elements('ol-deletes')
    const confirmIt = function (e) {
        if (!confirm('Are you sure?')) e.preventDefault()
    }
    for (let i = 0, l = elems.length; i < l; i++) {
        elems[i].addEventListener('click', confirmIt, false)
    }
    return '### function "setupDeletes" run successfully'
}
