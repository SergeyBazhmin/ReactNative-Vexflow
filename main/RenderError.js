export default class RenderError extends Error {
    constructor(error, msg) {
        super()
        this.name = `RenderError: ${error}`
        this.message = msg
    }
}