import { Flow } from 'vexflow/src/tables';
import MusicXmlError from '../xml/MusicXmlError';
import { StaveNote } from 'vexflow/src/stavenote';
import { Accidental } from 'vexflow/src/accidental';
import { Articulation } from 'vexflow/src/articulation';
import { Stave } from 'vexflow/src/stave';
import Note from '../xml/Note';
import { ToastAndroid } from 'react-native';

class MusicVisitor {
    constructor() {
        //look vexflow/src/table.js for types
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
        };

        this.articulations = {
            'staccato': 'a.',
            'staccatissimo': 'av',
            'accent': 'a>',
            'tenuto': 'a-'
        };

        this.accidentals = {
            'natural': 'n',
            'flat': 'b',
            'sharp': '#'
        };

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
        };

        this.keySpec = [];
        for (const k in Flow.keySignature.keySpecs) {
            if ({}.hasOwnProperty.call(Flow.keySignature.keySpecs, k)) {
                const newEntry = Flow.keySignature.keySpecs[k];
                newEntry.name = k;
                this.keySpec.push(newEntry);
            }
        }
    }

    visitTime(time) {
        return {
            beats: time.beats,
            beatType: time.beatType
        };
    }

    visitClef(clef) {
        return this.clefTypes[`${clef.sign}${clef.line}`];
    }

    visitKey(key) {
        let filteredKeys = this.keySpec.filter(k => k.num === Math.abs(key.fifths));
        const mode = key.mode === 'major' ? 0 : 1;
        if (key.fifths < 0)
            filteredKeys = filteredKeys.filter(k => k.acc === 'b');
        else if (key.fifths > 0)
            filteredKeys = filteredKeys.filter(k => k.acc === '#');
        const entry = filteredKeys[mode].name;
        return entry;
    }

    visitNote(note) {
        const accidentals = [];
        if (note.hasAccidental()) accidentals.push(this.accidentals[note.accidental]);
        const step = note.isRest ? 'b' : note.pitch.step;
        const octave = note.isRest ? '4' : note.pitch.octave;
        let type = this.noteTypes[note.type];
        if (note.hasDot()) type += 'd';

        if (type === undefined)
            throw new MusicXmlError('BadType', 'Invalid note type');
        const vexParams = {
            keys: [`${step}/${octave}`],
            duration: type
        };
        if (note.isRest)
            vexParams.type = 'r';
        else if (note.clef !== undefined)
            vexParams.clef = this.visitClef(note.clef);
        if (note.clef)
        {
            let node = note.nextElementSibling;
            while (node) {
                const nextNote = new Note(node, [note.clef]);
                if (nextNote.isInChord)
                {
                    vexParams.keys.push(nextNote.toString());
                    if (nextNote.hasAccidental()) ;
                        accidentals.push(this.accidentals[nextNote.accidental]);
                }
                else
                    break;
                node = node.nextSibling;
                while(node && node.nodeType !== 1)
                    node = node.nextSibling;
            }
        }

        const vexFlowNote = new StaveNote(vexParams);

        for(let idx = 0; i < accidentals.length; ++idx)
        {
            vexFlowNote.addAccidental(idx, new Accidental(sign));
        }

        if (note.hasArticulations()) {
            const arts = note.articulations;
            arts.forEach(art => {
                if (art.type in this.articulations) {
                    vexFlowNote.addArticulation(0, new Articulation(this.articulations[art.type]));
                }
            });
        }
        
        if (note.hasDot()) {
            vexFlowNote.addDotToAll();
        }

        return vexFlowNote;
    }

    visitMeasure(measure) {
        const staveList = [];
        const allStaves = measure.staves;
        for (let s = 0; s < allStaves; ++s) {
            const vexFlowStave = new Stave();
            staveList.push(vexFlowStave);
        }
        return staveList;
    }
}

export const vexConverter = new MusicVisitor();