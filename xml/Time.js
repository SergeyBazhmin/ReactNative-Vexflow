import XmlObject from './XmlObject'

export default class Time extends XmlObject {
    constructor(node) {
        if (node.tagName !== 'time')
            throw new MusicXmlError('NotATime', 'Wrong XML type')
        super(node)
    }

    get symbol() {
        return this.getAttribute('symbol')
    }

    get beats() {
        return this.getNumber('beats')
    }

    get beatType() {
        return this.getNumber('beat-type')
    }

    toString() {
        return `${this.beats}/${this.beatType}`
    }
}