import { Formatter } from 'vexflow/src/formatter';
import { ReactNativeSVGContext, NotoFontPack } from 'standalone-vexflow-context';
import { Dimensions, PixelRatio, ToastAndroid } from 'react-native';
import { Stave } from 'vexflow/src/stave';
import { Header } from 'react-navigation';

const isTablet = () => {
    const { width, height } = Dimensions.get('window');
    let pixelDensity = PixelRatio.get();
    const adjustedWidth = width * pixelDensity;
    const adjustedHeight = height * pixelDensity;
    if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
      return true;
    } else
      return (
        pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)
      );
  };
  

export default class Renderer {
    constructor() {
        this.formatter = new Formatter();
        this.options = this._calculateLayout();
    }

    render(drawables) {
        if (drawables === undefined)
            return;

        attachedComponents = [];
        const step = this.options.measuresPerStave;
        for(let i = 0; i < drawables.length; i += step) {
            context = new ReactNativeSVGContext(NotoFontPack, {
                width: this.options.screenWidth,
                height: this.options.staveSpace 
            });
            for(let j = i; j < Math.min(drawables.length, i + step); ++j)
                drawables[j].draw(context);
            attachedComponents.push(context.render());
        }
        return attachedComponents;
    }

    _calculateLayout() {
        const { width, height } = Dimensions.get('window');
        const tablet = isTablet();
        const tmpStave = new Stave();
        const staveHeight = tmpStave.getHeight();
        const staveSpace = staveHeight + 20;
        const measuresPerStave = tablet ? 3 : 1;
        const staveWidth = Math.round(width / measuresPerStave);
        const stavesPerPage = Math.floor((height - Header.HEIGHT - 100) / staveSpace);
        return {
            staveSpace,
            staveWidth,
            measuresPerStave,
            stavesPerPage,
            tablet,
            screenWidth: width,
            screenHeight: height
        };
    }
}