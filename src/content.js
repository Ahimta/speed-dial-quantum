// @ts-check
import eventsHandlers from './_events_handlers'

const handlers = eventsHandlers()
document.addEventListener('keydown', handlers.keydown)
document.addEventListener('mousedown', handlers.mousedown)
document.addEventListener('keyup', handlers.keyup)
