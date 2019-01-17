import XmlObject from './XmlObject'
import MusicXmlError from './MusicXmlError'
import Note from './Note';


export default class Measure extends XmlObject {
    constructor(node, lastAttributes, part) {
        if (node.tagName !== 'measure')
            throw new MusicXmlError('NotAMeasure', 'Wrong XML type')
        super(node)
        
        this.attributes = {}
        this.notes = []
        this.part = part

        this.number = parseInt(this.getAttribute('number'), 10)

        const children = this.getChildren()

        this.attributes = lastAttributes
        //this.startClefs = this.attributes.clefs

        children.forEach(child => {
            if (child.tagName === 'note')
            {
                const note = new Note(child, this.attributes.clefs)
                this.notes.push(note)
            }
        });

        this.voices = [...new Set(this.notes.map(n => n.voice))]
    }

    get staves() {
        return this.attributes.staves
    }

    get clefs() {
        return this.attributes.clefs
    }


    // getNotesByVoice(voice) {
    //     const newObj = new Measure(this.node, { lastAttributes: this.attributes, part: -1})
    //     newObj.notes = this.notes.filter(n => n.voice === voice)
    //     return newObj
    // }

    // getNotesByStaff(index) {
    //     const newObj = new Measure(this.node, { lastAttributes: this.attributes, part: -1})
    //     newObj.notes = this.notes.filter(n => n.staff === index)
    //     return newObj
    // }

    getClefByStaff(index) {
        //console.log(this.clefs)
        return this.clefs.filter(c => c.number == index)[0]
    }

    accept(visitor) {
        return visitor.visitMeasure(this)
    }

    toString() {
        return `Part ${this.part}, Measure ${this.number}`
    }
}