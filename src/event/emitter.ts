import mitt from 'mitt'

const emitter = mitt()
const definedEvent ={
    ChangeTheme : "change-theme"
}
export {emitter,definedEvent}