'use strict'

import fs from 'fs'
import path from 'path'

const artsPath = path.join(__dirname, '../../data/raw/arts/')

export function loadSVGArts(give) {
    give.SVGs = fs
        .readdirSync(artsPath)
        .filter((file) => path.extname(file).toLowerCase() === '.svg')
        .map((p) => path.join(__dirname, '../../data/raw/arts/' + p))
        .map((p) => fs.readFileSync(p, 'utf-8'))
}
