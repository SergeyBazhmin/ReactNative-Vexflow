import XmlObject from './XmlObject'
import Key from './Key'
import Clef from './Clef'
import Time from './Time'

export default class Attributes extends XmlObject {
    constructor(node) {
        super(node)
        if (node.tagName !== 'attributes')
            throw new MusicXmlError('NotAttributes', 'Wrong XML type')
    }

    get divisions() {
        const dv = this.getNumber('divisions')
        return Number.isNaN(dv) ? 1 : dv
    }

    get staves() {
        const st = this.getNumber('staves')
        return Number.isNaN(st) ? 1 : st
    }

    get key() {
        return new Key(this.getChild('key'))
    }

    get time() {
        return new Time(this.getChild('time'))
    }

    get clefs() {
        const clef = this.getChildren('clef')
        return [...clef.map(c => new Clef(c))]
    }


    toString() {
        return `Divisions\t-> ${this.divisions}\n` +
        `Time\t-> ${this.time}\n` +
        `Staves\t-> ${this.staves}\n` +
        `Key\t-> ${this.key}\n` +
        `Clef\t-> ${this.clef}`
    }
}