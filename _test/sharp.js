import { createRequire } from 'module'
const require = createRequire(import.meta.url)
let sharp
try {
    sharp = require('sharp')
} catch (error) {
    console.log(error)
    console.log('oh no no sharp module. I hope this is not a production environment')
}
