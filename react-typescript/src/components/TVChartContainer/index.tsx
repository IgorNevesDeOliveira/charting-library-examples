import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import './index.css';
import {
	ChartingLibraryWidgetOptions,
	IChartingLibraryWidget,
	LanguageCode,
	ResolutionString,
	widget,
} from '../../charting_library';

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

	const [selectedIndicator, setSelectedIndicator] = useState('');
	// const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);

	/* eslint-disable align */
	// const signalTimestamps = useRef<Set<number>>(new Set());
	const currentResolution = useRef<string>('');

	const applyIndicatorLogic = (tvWidget: IChartingLibraryWidget) => {
		switch (selectedIndicator) {
			case 'imbalances':
				tvWidget.chart().removeAllShapes();
				fetch(`http://localhost:8090/signal?signalName=${selectedIndicator}&resolution=${currentResolution.current}`)
					.then((response) => response.json())
					.then((result) => {
						return new Set(Object.values(result).map(Number));
					}).then((timestampList) => {
					timestampList.forEach(timestamp => {
						console.log(timestamp);
						tvWidget.chart().createShape(
							{time: timestamp / 1000},
							{
								shape: 'arrow_down',
								text: 'Arrow!'
							}
						);
					});
				});
				break;
			default:
				console.warn(`Unknown indicator: ${selectedIndicator}`);
		}
	};

	// useEffect(() => {
	// 	console.log('test');
	// 	applyIndicatorLogic(tvWidgetRef.current);
	// }, [selectedIndicator]);

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
			studies_overrides: defaultProps.studiesOverrides
		};

		const tvWidget = new widget(widgetOptions);
		// tvWidgetRef.current = tvWidget;
		tvWidget.onChartReady(() => {
			tvWidget.chart().onIntervalChanged().subscribe(null, (interval) => {
				currentResolution.current = interval;
				applyIndicatorLogic(tvWidget);
			});
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

	const handleIndicatorChange = (indicator: string) => {
		setSelectedIndicator(indicator);
	};

	return (
		<>
			<div>
				<select onChange={ (e) => handleIndicatorChange(e.target.value) }>
					<option value="">Select Indicator</option>
					<option value="imbalances">Arrow Indicator - Imbalances</option>
				</select>
			</div>
			<div ref={ chartContainerRef } className={ 'TVChartContainer' } />
		</>
	);
};