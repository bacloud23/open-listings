export const to = (promise) => promise.then((data) => [null, data]).catch((err) => [err, null])

export const removeKey = (key, { [key]: _, ...rest }) => rest
