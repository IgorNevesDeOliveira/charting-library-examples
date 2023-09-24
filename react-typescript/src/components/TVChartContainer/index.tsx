import { useEffect, useRef, useState } from 'react';
import './index.css';
import {
	widget,
	ChartingLibraryWidgetOptions,
	LanguageCode,
	ResolutionString,
	// RawStudyMetaInfoId,
	CustomIndicator, IChartingLibraryWidget,
	// LibraryPineStudy,
	// IPineStudyResult, DeepWriteable, OhlcStudyPlotStyle, StudyPlotType, IContext
} from '../../charting_library';
import * as React from 'react';
// import { coloredLegStart } from '../../indicators/ColoredLegStarts';
import { arrowLegStart } from '../../indicators/ArrowLegStarts';
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
		symbol: 'US500',
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
	/* eslint-disable align */
	const [legStartTimestamps, setLegStartTimestamps] = useState<Set<number>>(new Set());
	useEffect(() => {
		fetch('http://localhost:8090/leg-start')
			.then((response) => response.json())
			.then((result) => {
				const numericResult = new Set(Object.values(result).map(Number));
				setLegStartTimestamps(numericResult);
			});
	}, []);

	const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);

	const createShapeCallback = (time: number) => {
		if (tvWidgetRef.current && tvWidgetRef.current.chart()) {
			tvWidgetRef.current.chart().createShape(
				{ time: time / 1000 },
				{
					shape: 'arrow_up',
					text: 'Arrow!'
				}
			);
		}
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
					// coloredLegStart(PineJS, legStartTimestamps) as CustomIndicator,
					arrowLegStart(PineJS, legStartTimestamps, createShapeCallback) as CustomIndicator
				]);
			},
		};

		const tvWidget = new widget(widgetOptions);
		tvWidgetRef.current = tvWidget;
		tvWidget.onChartReady(() => {
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
	}, [legStartTimestamps]);

	return (
		<div
			ref={ chartContainerRef }
			className={ 'TVChartContainer' }
		/>
	);
};
