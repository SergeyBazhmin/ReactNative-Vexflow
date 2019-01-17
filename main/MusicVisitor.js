import { Flow } from 'vexflow/src/tables'
import MusicXmlError from '../xml/MusicXmlError';
import { StaveNote } from 'vexflow/src/stavenote'
import { Stave } from 'vexflow/src/stave'

class MusicVisitor {
    constructor() {
         this.clefTypes = {
            'F4': 'bass',
            'G2': 'treble',
            'C3': 'alto',
            'C4': 'tenor',
            'C1': 'soprano',
            'C2': 'mezzo soprano',
            'C5': 'baritone',
            'F3': 'baritone',
            'percussion': 'percussion'
        }

        this.accidentals = {
            'natural': 'n',
            'flat': 'b',
            'sharp': '#'
        }

        this.noteTypes = {
            'whole': 'w',
            'half': 'h',
            'quarter': 'q',
            'eighth': '8',
            '16th': '16',
            '32th': '32',
            '64th': '64',
            '128th': '128',
            '256th': '256',
            '512th': '512',
            '1024th': '1024'
        }

        this.keySpec = []
        for (const k in Flow.keySignature.keySpecs) {
            if ({}.hasOwnProperty.call(Flow.keySignature.keySpecs, k)) {
                const newEntry = Flow.keySignature.keySpecs[k]
                newEntry.name = k
                this.keySpec.push(newEntry)
            }
        }
    }

    visitTime(time) {
        return {
            beats: time.beats,
            beatType: time.beatType
        }
    }

    visitClef(clef) {
        return this.clefTypes[`${clef.sign}${clef.line}`]
    }

    visitKey(key) {
        let filteredKeys = this.keySpec.filter(k => k.num === Math.abs(key.fifths))
        const mode = key.mode === 'major' ? 0 : 1
        if (key.fifths < 0)
            filteredKeys = filteredKeys.filter(k => k.acc === 'b')
        else if (key.fifths > 0)
            filteredKeys = filteredKeys.filter(k => k.acc === '#')
        const entry = filteredKeys[mode].name
        return entry
    }

    visitNote(note) {
        const step = note.isRest ? 'b' : note.pitch.step
        const octave = note.isRest ? '4' : note.pitch.octave
        const type = this.noteTypes[note.type]

        if (type === undefined)
            throw new MusicXmlError('BadType', 'Invalid note type')
        const vexParams = {
            keys: [`${step}/${octave}`],
            duration: type
        }
        if (note.isRest)
            vexParams.type = 'r'
        else if (note.clef !== undefined)
            vexParams.clef = this.visitClef(note.clef)
        /*let nextNode = note.node.nextElementSibling
        while(nextNode) {
            if (nextNode.tagName === 'note') {
                const curNote = new Note(nextNode)
                if (curNote.isInChord)
                    vexParams.keys.push(`${curNote.pitch.step}/${curNote.pitch.octave}`)
                else
                    break
            }
            else
                break
        }*/
        //vexParams['clef'] = 'treble'

        const vexFlowNote = new StaveNote(vexParams)
        return vexFlowNote
    }

    visitMeasure(measure) {
        const staveList = []
        const allStaves = measure.staves
        for (let s = 0; s < allStaves; ++s) {
            const vexFlowStave = new Stave()
            staveList.push(vexFlowStave)
        }
        return staveList
    }
}

export const vexConverter = new MusicVisitor()