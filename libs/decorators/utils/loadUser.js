
// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'

/**
 *
 * @param {Types.RequestExtended} request
 * @param {*} data
 */
export const loadUser = (request, data) => {
    // Store username in params (to be used in front). It can be tempted !
    request.params.user = { role: data.role, username: data.username }
    // Store username in session (to be used in back). It cannot be tempted !
    request.session.set('user', { role: data.role, username: data.username })
}
