import XmlObject from './XmlObject';
import Attributes from './Attributes';
import Measure from './Measure';

export default class Part extends XmlObject {
    constructor(node) {
        super(node);
        if (node.tagName !== 'part')
            throw new MusicXmlError('NotAPart', 'Wrong XML type');
        const measuresxml = this.getChildren('measure');
        this.id = parseInt(this.getAttribute('id').match(/[0-9]+/)[0], 10);

        let lastAttributes = new Attributes(node.getElementsByTagName('attributes')[0]);

        this.measures = [];

        measuresxml.forEach(measure => {
            const curMeasure = new Measure(measure, lastAttributes, this.id);
            this.measures.push(curMeasure);
            lastAttributes = curMeasure.attributes;
        })
    }
    
    getNotesByStaff(index) {
        const notes = [];
        this.measures.forEach(key => notes.push(...this.measures[key].getNotesByStaff(index)));
        return notes;
    }
}