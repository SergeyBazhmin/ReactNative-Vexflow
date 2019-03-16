import XmlObject from './XmlObject';
import Part from './Part';

export default class MusicXmlContainer extends XmlObject {
    constructor(xmlDocString) {
        const DOMParser = require('xmldom').DOMParser;
        const parser = new DOMParser();
        xDoc = parser.parseFromString(xmlDocString, 'text/xml');

        super(xDoc.getElementsByTagName('score-partwise')[0]);
        this.version = this.getAttribute('version');

        const parts = this.getChildren('part');
        //const partList = this.getChild('part-list')
        this.parts = [...parts].map(part => new Part(part));
    }
}