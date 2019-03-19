import MusicXmlContainer from "../xml/MusicXmlContainer";
import VexFlowMeasure from '../vex/VexFlowMeasure';
import { vexConverter } from './MusicVisitor';
import { ToastAndroid} from 'react-native';

export default class VexMusicContainer {
    constructor() {
        this.drawables = [];
    }

    loadFromString(xmlDocumentContent) {
        this.musicXml = new MusicXmlContainer(xmlDocumentContent);
        this.musicXml.parts.forEach((part) => {
            part.measures.forEach((xmlMeasure) => {
                this.drawables.push(new VexFlowMeasure(xmlMeasure));
            });
        });
    }

    //TODO this works only with a single part => generalize
    adjust(options, formatter) {
        const { staveWidth, measuresPerStave, stavesPerPage } = options;
        let counter = 1;
        this.drawables.forEach(vexMeasure => {
            const number = vexMeasure.number;
            const lineOnPage = Math.ceil(number / measuresPerStave) - 1;
            vexMeasure.page = Math.floor(lineOnPage / stavesPerPage);
            const x = ((number - 1) % measuresPerStave) * staveWidth;
            //const y = lineOnPage % stavesPerPage * staveSpace;
            vexMeasure.staveList.forEach((stave,idx) => {
                //stave.setX(x).setY(y + idx * staveSpace).setWidth(staveWidth)
                stave.setX(x).setY(0).setWidth(staveWidth);//.setText(`stave #${counter}`, 3);
                ++counter;
                if ((number-1) % measuresPerStave === 0)
                {   
                    let staveClef = vexMeasure.getClefByStaff(idx);
                    if (staveClef === undefined)
                        staveClef = 'treble';
                    else
                        staveClef = vexConverter.visitClef(staveClef);
                    stave.addTimeSignature(vexMeasure.time.toString())
                        .addKeySignature(vexMeasure.key.accept(vexConverter))
                        .addClef(staveClef);
                }
            });
        });
        this.drawables.forEach(measure => measure.joinVoices(formatter));
    }

    getMeasuresOnPage(pageIdx) {
        return this.drawables.filter(drawable => drawable.page === pageIdx);
    }

    /*
    src: vexflow/src/stavenote.js
    duration
    keys - 'note/octave' format
    clef - google.com
    isRest - whether it is a pause note
    isChord - whether it is an accord
    getDots - a note might have a dot assigned to it. It means that the note will be played + 0.5x of its original time
    getAccidentals - they change a note's sound
    */
    get allNotes() {
        const notesByMeasures = this.drawables.reduce((arr, measure, idx) => {
            arr.push([]);
            arr[idx].push(...measure.voiceList[0][0].tickables); //FIXME [0][0]
            return arr;
        }, []);
        return notesByMeasures;
    }

    get stavesNumber() {
        return this.musicXml.parts
            .map(p => p.measures.length)
            .reduce((acc, cur) => acc + cur);
    }

    get partsNumber() {
        return this.musicXml.parts.length;
    }

    get measuresNumber() {
        return this.musicXml.parts
            .map(p => p.measures.length)
            .reduce((acc, cur) => acc + cur);
    }
}