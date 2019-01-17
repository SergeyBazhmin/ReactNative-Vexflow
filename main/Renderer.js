import { Formatter } from 'vexflow/src/formatter'
import { ReactNativeSVGContext, NotoFontPack } from 'standalone-vexflow-context'
import { Dimensions } from 'react-native'
import { RenderError } from './RenderError'
//import { vexConverter } from './MusicVisitor'
import { Stave } from 'vexflow/src/stave'
import { Header } from 'react-navigation'

export default class Renderer {
    constructor() {
        this.formatter = new Formatter()
        this.options = this._calculateLayout()
    }

    render(drawables) {
        if (drawables === undefined)
            return
        context = new ReactNativeSVGContext(NotoFontPack, {
            width: this.options.screenWidth,
            height: this.options.screenHeight - Header.HEIGHT - 50
        })
        drawables.forEach(object => {
            object.draw(context)
        })
        return context.render()
    }

    // setDrawables(container) {
    //     if (container.drawables === undefined)
    //         throw new RenderError('NoDrawables', "Drawables have not been loaded yet")

    //     this.drawableMeasures = drawableContainer.drawables
    //     this._adjustDrawables()
    // }

    _calculateLayout() {
        const { width, height } = Dimensions.get('window')
        const tmpStave = new Stave()
        const staveHeight = tmpStave.getHeight()
        const staveSpace = staveHeight + 20
        const measuresPerStave = width <= 360 ? 1 : 3
        const staveWidth = Math.round(width / measuresPerStave)
        const stavesPerPage = Math.floor((height - Header.HEIGHT - 100) / staveSpace) // TODO replace 50 with header's height
        return {
            staveSpace,
            staveWidth,
            measuresPerStave,
            stavesPerPage,
            screenWidth: width,
            screenHeight: height
        }
    }

    // _adjustDrawables() {
    //     const { staveSpace, staveWidth, measuresPerStave, stavesPerPage } = this.options
    //     this.drawablesToPage = []
    //     this.drawableMeasures.forEach(vexMeasure => {
    //         //const part = measure.part
    //         const number = vexMeasure.number
    //         const lineOnPage = Math.ceil(number / measuresPerStave) - 1
    //         vexMeasure.page = lineOnPage % stavesPerPage
    //         const x = (number - 1) % measuresPerStave * staveWidth
    //         const y = lineOnPage % stavesPerPage * staveSpace
    //         vexMeasure.staveList.forEach((stave,idx) => {
    //             stave.setX(x).setY(y + idx * staveSpace).setWidth(staveWidth)
    //             stave.setContext(this.context) 
    //             if ((number-1) % measuresPerStave === 0)
    //             {
    //                 let staveClef = vexMeasure.getClefByStaff(idx)
    //                 if (staveClef === undefined)
    //                     staveClef = 'treble'
    //                 else
    //                     staveClef = this.visitClef(staveClef)           
    //                 stave.addTimeSignature(vexMeasure.time.toString())
    //                     .addKeySignature(vexMeasure.key.accept(vexConverter))
    //                     .addClef(staveClef) 
    //             }
    //         })
    //     })
    //     this.drawableMeasures.forEach(measure => measure.joinVoices(this.formatter))
    // }



}