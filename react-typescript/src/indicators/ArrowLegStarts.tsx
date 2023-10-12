import {
    DeepWriteable, IChartingLibraryWidget,
    IContext,
    IPineStudyResult,
    LibraryPineStudy, OhlcStudyPlotStyle,
    PineJS, RawStudyMetaInfoId, StudyPlotType
} from '../charting_library';

export const arrowLegStart = (pineJS: PineJS, legStartTimestamps: Set<number>, callbackFunction: IChartingLibraryWidget | null) => ({
    name: 'Arrow',
    metainfo: {
        _metainfoVersion: 51,
        overlay: true,
        id: 'advancedcolouringcandles@tv-basicstudies-1' as RawStudyMetaInfoId,
        name: 'Arrow',
        description: 'Arrow',
        shortDescription: 'Arrow',
        isCustomIndicator: true,
        is_price_study: true,
        linkedToSeries: true,
        format: {
            type: 'price',
            precision: 2,
        },
        plots: [
            {
                id: 'plot_open',
                // tslint:disable-next-line:no-any
                type: 'ohlc_open' as DeepWriteable<StudyPlotType.OhlcOpen>,
                target: 'plot_candle',
            },
            {
                id: 'plot_high',
                type: 'ohlc_high' as DeepWriteable<StudyPlotType.OhlcHigh>,
                target: 'plot_candle',
            },
            {
                id: 'plot_low',
                type: 'ohlc_low' as DeepWriteable<StudyPlotType.OhlcLow>,
                target: 'plot_candle',
            },
            {
                id: 'plot_close',
                // tslint:disable-next-line:no-any
                type: 'ohlc_close' as DeepWriteable<StudyPlotType.OhlcClose>,
                target: 'plot_candle',
            }
        ],
        ohlcPlots: {
            plot_candle: {
                title: 'Candles',
            },
        },
        defaults: {
            ohlcPlots: {
                plot_candle: {
                    borderColor: '#000000',
                    color: '#000000',
                    drawBorder: true,
                    drawWick: true,
                    plottype: 'ohlc_candles' as DeepWriteable<OhlcStudyPlotStyle.OhlcCandles>,
                    visible: true,
                    wickColor: '#000000',
                },
            },

            // this can be removed and it will still work
            palettes: {
                palette_bar: {
                    colors: [
                        {color: '#cc1919', width: 1, style: 0},
                        {color: '#02f416', width: 1, style: 0},
                    ],
                },
                palette_wick: {
                    colors: [{color: '#cc1919'}, {color: '#02f416'}],
                },
                palette_border: {
                    colors: [{color: '#cc1919'}, {color: '#02f416'}],
                },
            },

            precision: 2,
            inputs: {},
        },
        styles: {},
        inputs: [],
    },
    constructor: function (this: LibraryPineStudy<IPineStudyResult>) {
        this.main = function (context: IContext, inputCallback) {
            this._context = context;
            this._input = inputCallback;
            this._context.select_sym(0);
            const time = pineJS.Std.time(this._context);
            const o = pineJS.Std.open(this._context);
            const h = pineJS.Std.high(this._context);
            const l = pineJS.Std.low(this._context);
            const c = pineJS.Std.close(this._context);

            if (callbackFunction != null && legStartTimestamps.has(time)) {
                callbackFunction.chart().createShape(
                    { time: time / 1000 },
                    {
                        shape: 'arrow_down',
                        text: 'Arrow!'
                    });
            }
            return [o, h, l, c];
        };
    },
});
