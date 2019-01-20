import XmlObject from './XmlObject'
import MusicXmlError from './MusicXmlError'

export default class Note extends XmlObject {
    constructor(node, clefs) {
        super(node)

        if (node.tagName !== 'note')
            throw new MusicXmlError('NotANote', 'Wrong XML type')
        this.clef = clefs.filter(c => c.number == this.staff)[0]
        
        //this.mAttributes = attributes
        // this.duration = this.getNum('duration')
        // this.type = this.getText('type')
        //this.noteLength = this.duration / this.mAttributes.divisions
        //this.dots = this.noteLength >= 1 && this.noteLength % 1 === 0.5
    }

    hasBeam() {
        return this.childExists('beam')
    }

    hasAccidental() {
        return this.childExists('accidental')
    }

    get beams() {
        return this.getChildren('beam').map(b => b.textContent)
    }

    get pitch() {
        const stepName = this.isUnpitched ? 'display-step' : 'step'
        const octaveName = this.isUnpitched ? 'display-octave' : 'octave'
        return {
            step: this.getText(stepName),
            octave: this.getNumber(octaveName)
        }
    }

    get accidental() {
        return this.getText('accidental')
    }

    get voice() {
        const vc = this.getNumber('voice')
        return Number.isNaN(vc) ? 1 : vc
    }

    get duration() {
        return this.getNumber('duration')
    }

    get isUnpitched() {
        return this.childExists('unpitched')
    }

    get type() {
        return this.getText('type')
    }

    get stem() {
        return this.getText('stem')
    }

    get isRest() {
        return this.childExists('rest')
    }

    get isInChord() {
        return this.childExists('chord')
    }

    get staff() {
        const nstaff = this.getNumber('staff')
        return Number.isNaN(nstaff) ? 1 : nstaff
    }

    accept(visitor) {
        return visitor.visitNote(this)
    }

    toString() {
        const note = this.pitch
        return `${note.step}/${note.octave}`
    }

}