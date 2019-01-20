import MusicXmlContainer from "../xml/MusicXmlContainer";
import VexFlowMeasure from '../vex/VexFlowMeasure'
import { vexConverter } from './MusicVisitor'

export default class VexMusicContainer {
    constructor() {
        this.drawables = []
    }

    loadFromString(xmlDocumentContent) {
        this.musicXml = new MusicXmlContainer(xmlDocumentContent)
        this.musicXml.parts.forEach((part) => {
            part.measures.forEach((xmlMeasure) => {
                this.drawables.push(new VexFlowMeasure(xmlMeasure))
            })
        })
    }

    //TODO this works only with a single part => generalize
    adjust(options, formatter) {
        const { staveSpace, staveWidth, measuresPerStave, stavesPerPage } = options
        this.drawables.forEach(vexMeasure => {
            const number = vexMeasure.number
            const lineOnPage = Math.ceil(number / measuresPerStave) - 1
            vexMeasure.page = Math.floor(lineOnPage / stavesPerPage)
            const x = (number - 1) % measuresPerStave * staveWidth
            const y = lineOnPage % stavesPerPage * staveSpace
            vexMeasure.staveList.forEach((stave,idx) => {
                stave.setX(x).setY(y + idx * staveSpace).setWidth(staveWidth)
                if ((number-1) % measuresPerStave === 0)
                {
                    let staveClef = vexMeasure.getClefByStaff(idx)
                    if (staveClef === undefined)
                        staveClef = 'treble'
                    else
                        staveClef = vexConverter.visitClef(staveClef)           
                    stave.addTimeSignature(vexMeasure.time.toString())
                        .addKeySignature(vexMeasure.key.accept(vexConverter))
                        .addClef(staveClef) 
                }
            })
        })
        this.drawables.forEach(measure => measure.joinVoices(formatter))
    }

    getMeasuresOnPage(pageIdx) {
        return this.drawables.filter(drawable => drawable.page === pageIdx)
    }

    get stavesNumber() {
        return this.musicXml.parts
            .map(p => p.measures.nstaves)
            .reduce((acc, cur) => acc + cur)
    }

    get partsNumber() {
        return this.musicXml.parts.length
    }

    get measuresNumber() {
        return this.musicXml.parts
            .map(p => p.measures.length)
            .reduce((acc, cur) => acc + cur)
    }
}