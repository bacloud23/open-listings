import Quill from 'quill/core.js'

import Toolbar from 'quill/modules/toolbar.js'
import Snow from 'quill/themes/snow.js'

import Bold from 'quill/formats/bold.js'
import Header from 'quill/formats/header.js'
import Italic from 'quill/formats/italic.js'
import Underline from 'quill/formats/underline.js'

Quill.register({
    'modules/toolbar': Toolbar,
    'themes/snow': Snow,
    'formats/bold': Bold,
    'formats/italic': Italic,
    'formats/header': Header,
    'formats/underline': Underline,
})

export default Quill
