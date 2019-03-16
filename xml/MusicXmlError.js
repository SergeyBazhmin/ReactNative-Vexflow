export default class MusicXmlError extends TypeError {
    constructor(error, msg) {
        super();
        this.name = `MusicXmlError: ${error}`;
        this.message = msg;
    }
}