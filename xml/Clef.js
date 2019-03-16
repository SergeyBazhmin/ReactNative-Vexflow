import XmlObject from './XmlObject';

export default class Clef extends XmlObject {
    constructor(node) {
        super(node);
        if (node.tagName !== 'clef')
            throw new MusicXmlError('NotAClef', 'Wrong XML type');
    }

    get number() {
        const staffClefNum = parseInt(this.getAttribute('number'), 10);
        return Number.isNaN(staffClefNum) ? 1 : staffClefNum;
    }

    get sign() {
        return this.getText('sign');
    }

    get line() {
        const lineNum = this.getNumber('line');
        return Number.isNaN(lineNum) ? '' : lineNum;
    }

    accept(visitor) {
        return visitor.visitClef(this);
    }

    toString() {
        return `[Staff ${this.number}: ${this.sign}${this.line}]`;
    }
}