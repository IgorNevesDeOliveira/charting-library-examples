import { useEffect, useRef } from 'react';
import './index.css';
import {
	widget,
	ChartingLibraryWidgetOptions,
	LanguageCode,
	ResolutionString,
	RawStudyMetaInfoId,
	CustomIndicator,
	LibraryPineStudy,
	IPineStudyResult, DeepWriteable, OhlcStudyPlotStyle, StudyPlotType, IContext
} from '../../charting_library';
import * as React from 'react';

export interface ChartContainerProps {
	symbol: ChartingLibraryWidgetOptions['symbol'];
	interval: ChartingLibraryWidgetOptions['interval'];

	// BEWARE: no trailing slash is expected in feed URL
	datafeedUrl: string;
	libraryPath: ChartingLibraryWidgetOptions['library_path'];
	chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
	chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
	clientId: ChartingLibraryWidgetOptions['client_id'];
	userId: ChartingLibraryWidgetOptions['user_id'];
	fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
	autosize: ChartingLibraryWidgetOptions['autosize'];
	studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
	container: ChartingLibraryWidgetOptions['container'];
}

const getLanguageFromURL = (): LanguageCode | null => {
	const regex = new RegExp('[\\?&]lang=([^&#]*)');
	const results = regex.exec(location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode;
};

export const TVChartContainer = () => {
	const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

	const defaultProps: Omit<ChartContainerProps, 'container'> = {
		symbol: 'AAPL',
		interval: 'D' as ResolutionString,
		datafeedUrl: 'http://localhost:8090',
		libraryPath: '/charting_library/',
		chartsStorageUrl: 'https://saveload.tradingview.com',
		chartsStorageApiVersion: '1.1',
		clientId: 'tradingview.com',
		userId: 'public_user_id',
		fullscreen: false,
		autosize: true,
		studiesOverrides: {},
	};

	useEffect(() => {
		const widgetOptions: ChartingLibraryWidgetOptions = {
			symbol: defaultProps.symbol as string,
			// BEWARE: no trailing slash is expected in feed URL
			// tslint:disable-next-line:no-any
			datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(defaultProps.datafeedUrl),
			interval: defaultProps.interval as ChartingLibraryWidgetOptions['interval'],
			container: chartContainerRef.current,
			library_path: defaultProps.libraryPath as string,
			locale: getLanguageFromURL() || 'en',
			disabled_features: ['use_localstorage_for_settings'],
			enabled_features: ['study_templates'],
			charts_storage_url: defaultProps.chartsStorageUrl,
			charts_storage_api_version: defaultProps.chartsStorageApiVersion,
			client_id: defaultProps.clientId,
			user_id: defaultProps.userId,
			fullscreen: defaultProps.fullscreen,
			autosize: defaultProps.autosize,
			studies_overrides: defaultProps.studiesOverrides,
			custom_indicators_getter: PineJS => {
				return Promise.resolve<CustomIndicator[]>([

					/* Advanced Colouring Candles */
					{
						name: 'Advanced Coloring Candles',
						metainfo: {
							_metainfoVersion: 51,

							id: 'advancedcolouringcandles@tv-basicstudies-1' as RawStudyMetaInfoId,
							name: 'Advanced Coloring Candles',
							description: 'Advanced Coloring Candles',
							shortDescription: 'Advanced Coloring Candles',

							isCustomIndicator: true,

							is_price_study: false, // whether the study should appear on the main series pane.
							linkedToSeries: true, // whether the study price scale should be the same as the main series one.

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

							palettes: {
								palette_bar: {
									colors: [{ name: 'Colour One' }, { name: 'Colour Two' }],

									valToIndex: {
										0: 0,
										1: 1,
									},
								},
								palette_wick: {
									colors: [{ name: 'Colour One' }, { name: 'Colour Two' }],

									valToIndex: {
										0: 0,
										1: 1,
									},
								},
								palette_border: {
									colors: [{ name: 'Colour One' }, { name: 'Colour Two' }],

									valToIndex: {
										0: 0,
										1: 1,
									},
								},
							},

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

								palettes: {
									palette_bar: {
										colors: [
											{ color: '#1948CC', width: 1, style: 0 },
											{ color: '#F47D02', width: 1, style: 0 },
										],
									},
									palette_wick: {
										colors: [{ color: '#0C3299' }, { color: '#E65000' }],
									},
									palette_border: {
										colors: [{ color: '#5B9CF6' }, { color: '#FFB74D' }],
									},
								},

								precision: 2,
								inputs: {},
							},
							styles: {},
							inputs: [],
						},
						constructor: function (
							this: LibraryPineStudy<IPineStudyResult>
						) {

							this.main = function (context: IContext, inputCallback) {
								this._context = context;
								this._input = inputCallback;

								this._context.select_sym(0);

								const o = PineJS.Std.open(this._context);
								const h = PineJS.Std.high(this._context);
								const l = PineJS.Std.low(this._context);
								const c = PineJS.Std.close(this._context);

								// Color is determined randomly
								const colour = Math.round(Math.random());
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
					},
				]);
			},
		};

		const tvWidget = new widget(widgetOptions);
		tvWidget.onChartReady(() => {
			const studiesOnChart = tvWidget.chart().getAllStudies();
			const isStudyAdded = studiesOnChart.some(study => study.name === 'Advanced Coloring Candles');
			console.log('Is the study added?', isStudyAdded);

			tvWidget.headerReady().then(() => {
				const button = tvWidget.createButton();
				button.setAttribute('title', 'Click to show a notification popup');
				button.classList.add('apply-common-tooltip');
				button.addEventListener('click', () => tvWidget.showNoticeDialog({
						title: 'Notification',
						body: 'TradingView Charting Library API works correctly',
						callback: () => {
							console.log('Noticed!');
						},
					}));
				button.innerHTML = 'Check API';
			});
		});

		return () => {
			tvWidget.remove();
		};
	});

	return (
		<div
			ref={ chartContainerRef }
			className={ 'TVChartContainer' }
		/>
	);
};
