import { setupGravatar } from './gravatar/setup-gravatar.js'
import { setupImageModal } from './modals/setup-image-modal.js'
import { setupQuillForEdit } from './text-editor/setup-listing-editor.js'
import { setupQuillForMessage } from './text-editor/setup-message-editor.js'
import { undrawOutput } from './undraw-output/undraw-output.js'

setupGravatar()
setupImageModal()
undrawOutput()
setupQuillForEdit()
setupQuillForMessage()
