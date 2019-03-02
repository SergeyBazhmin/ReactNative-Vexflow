import { Formatter } from 'vexflow/src/formatter'
import { ReactNativeSVGContext, NotoFontPack } from 'standalone-vexflow-context'
import { Dimensions } from 'react-native'
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

        attachedComponents = []
        drawables.forEach(object => {
            context = new ReactNativeSVGContext(NotoFontPack, {
                width: this.options.screenWidth,
                height: this.options.staveSpace 
            })
            object.draw(context)
            attachedComponents.push(context.render())
        })
        return attachedComponents
    }

    _calculateLayout() {
        const { width, height } = Dimensions.get('window')
        const tmpStave = new Stave()
        const staveHeight = tmpStave.getHeight()
        const staveSpace = staveHeight + 20
        const measuresPerStave = width <= 360 ? 1 : 3
        const staveWidth = Math.round(width / measuresPerStave)
        const stavesPerPage = Math.floor((height - Header.HEIGHT - 100) / staveSpace)//TODO replace 100
        return {
            staveSpace,
            staveWidth,
            measuresPerStave,
            stavesPerPage,
            screenWidth: width,
            screenHeight: height
        }
    }
}