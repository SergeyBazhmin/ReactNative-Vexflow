import XmlObject from './XmlObject';

export default class Key extends XmlObject {
    constructor(node) {
        super(node);
        if (node.tagName !== 'key')
            throw new MusicXmlError('NotAKey', 'Wrong XML type');
    }

    get fifths() {
        return this.getNumber('fifths');
    }

    get mode() {
        const mode = this.getText('mode');
        return mode === '' ? 'major' : mode;
    }

    accept(visitor) {
        return visitor.visitKey(this);
    }

    toString() {
        return `Fifths: ${this.fifths} mode: ${this.mode}`;
    }
}