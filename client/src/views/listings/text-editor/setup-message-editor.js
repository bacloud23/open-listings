import Quill from 'quill'
import 'quill-paste-smart'
// import Quill from './init-quill.js'

const minLength = 140 / 2
const maxLength = (200 * 6.5) / 2

export const setupQuillForMessage = async () => {
    if (!document.querySelector('.message#quill-counter') || !document.querySelector('#send-message')) {
        return '### function "setupQuillForMessage" ignored well'
    }
    // Implement and register module
    Quill.register('modules/counter', function (/** @type {Quill} */ quill, options) {
        let container = document.querySelector('.message#quill-counter')
        let sendMessage = document.querySelector('#send-message')
        quill.on('text-change', function () {
            let text = quill.getText()

            let words = text.split(/\s+/).length // max 200
            let characters = text.length // max 200 * 6.5
            let charactersLeft = maxLength - characters
            let wordsLeft = 200 - words
            let minimalLeft = minLength - characters

            if (minimalLeft > 0 || charactersLeft < 0 || wordsLeft < 0) {
                let moreText = ''
                if (minimalLeft > 0) moreText = ` . Add more text (${minimalLeft})...`
                container.innerHTML = `<p style="color:red;">Characters left: ${charactersLeft} . Words left: ${wordsLeft}${moreText}</p>`
                sendMessage.disabled = true
            } else {
                container.innerHTML = `<p>Characters left: ${charactersLeft} . Words left: ${wordsLeft}</p>`
                sendMessage.disabled = false
                document.querySelectorAll('.send#message')[0].value = quill.root.innerHTML
            }
        })
    })

    const allowedTags = [
        'a',
        'b',
        'blockquote',
        'code',
        'h3',
        'h4',
        'hr',
        'i',
        'li',
        'ol',
        'p',
        'pre',
        'span',
        'strike',
        'u',
        'ul',
    ]

    // We can now initialize Quill with something like this:
    let quill = new Quill('.message#quill-editor', {
        modules: {
            counter: true,
            clipboard: {
                allowed: {
                    tags: allowedTags,
                    attributes: ['href', 'rel', 'target', 'class'],
                },
                keepSelection: true,
                substituteBlockElements: true,
                magicPasteLinks: true,
                hooks: {
                    uponSanitizeElement(node, data, config) {
                        // console.log(node)
                    },
                },
            },
        },
        theme: 'snow',
    })
    return '### function "setupQuillForMessage" run successfully'
}
