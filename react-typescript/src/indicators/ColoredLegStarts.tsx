import {
    DeepWriteable,
    IContext,
    IPineStudyResult,
    LibraryPineStudy,
    OhlcStudyPlotStyle,
    PineJS,
    RawStudyMetaInfoId,
    StudyPlotType
} from '../charting_library';

export const coloredLegStart = (pineJS: PineJS, coloredTimestamps: Set<number>) => ({
    name: 'Advanced Coloring Candles',
    metainfo: {
        _metainfoVersion: 51,
        id: 'advancedcolouringcandles@tv-basicstudies-1' as RawStudyMetaInfoId,
        name: 'Colored Leg starts',
        description: 'Colored Leg starts',
        shortDescription: 'Colored Leg starts',
        isCustomIndicator: true,
        is_price_study: false,
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
            },
            {
                id: 'plot_bar_color',
                type: 'ohlc_colorer' as DeepWriteable<StudyPlotType.OhlcColorer>,
                palette: 'palette_bar',
                target: 'plot_candle',
            },
            {
                id: 'plot_wick_color',
                type: 'wick_colorer' as DeepWriteable<StudyPlotType.CandleWickColorer>,
                palette: 'palette_wick',
                target: 'plot_candle',
            },
            {
                id: 'plot_border_color',
                type: 'border_colorer' as DeepWriteable<StudyPlotType.CandleBorderColorer>,
                palette: 'palette_border',
                target: 'plot_candle',
            },
        ],
        ohlcPlots: {
            plot_candle: {
                title: 'Candles',
            },
        },
        palettes: {
            palette_bar: {
                colors: [{name: 'Colour One'}, {name: 'Colour Two'}],

                valToIndex: {
                    0: 0,
                    1: 1,
                },
            },
            palette_wick: {
                colors: [{name: 'Colour One'}, {name: 'Colour Two'}],

                valToIndex: {
                    0: 0,
                    1: 1,
                },
            },
            palette_border: {
                colors: [{name: 'Colour One'}, {name: 'Colour Two'}],

                valToIndex: {
                    0: 0,
                    1: 1,
                },
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
            const o = pineJS.Std.open(this._context);
            const h = pineJS.Std.high(this._context);
            const l = pineJS.Std.low(this._context);
            const c = pineJS.Std.close(this._context);
            const time = pineJS.Std.time(this._context);

            let colour;
            if (coloredTimestamps.has(time)) {
                console.log(time);
                colour = 1;
            } else {
                colour = 0;
            }

            return [
                o,
                h,
                l,
                c,
                colour /*bar*/,
                colour /*wick*/,
                colour /*border*/,
            ];
        };
    },
});
