import * as React from 'react';
import './index.css';
import {
	ChartingLibraryWidgetOptions, IChartingLibraryWidget,
	LanguageCode,
	ResolutionString,
	widget,
} from '../../charting_library';
import { useEffect, useRef, useState } from 'react';

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
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const [selectedIndicator, setSelectedIndicator] = useState('');
	const currentResolution = useRef<string>('');

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

	function createSignal(tvWidget: IChartingLibraryWidget) {
		if (selectedIndicator === 'imbalances') {
			tvWidget.chart().removeAllShapes();
			fetch(`http://localhost:8090/signal?signalName=${selectedIndicator}&resolution=${currentResolution.current}`)
				.then(response => response.json())
				.then(result => new Set(Object.values(result).map(Number)))
				.then(timestampList => {
					timestampList.forEach(timestamp => {
						tvWidget.chart().createShape(
							{time: timestamp / 1000},
							{
								shape: 'arrow_down',
								text: '1D-SI'
							}
						);
					});
				});
		}
	}

	useEffect(() => {
		const widgetOptions: ChartingLibraryWidgetOptions = {
			symbol: defaultProps.symbol as string,
			// BEWARE: no trailing slash is expected in feed URL
			// tslint:disable-next-line:no-any
			datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(defaultProps.datafeedUrl),
			interval: defaultProps.interval as ChartingLibraryWidgetOptions['interval'],
			container: chartContainerRef.current as HTMLDivElement,
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
		tvWidget.onChartReady(() => {
			tvWidget.chart().onIntervalChanged().subscribe(null, interval => {
				currentResolution.current = interval;
				createSignal(tvWidget);
			});
		});

		return () => {
			tvWidget.remove();
		};
	});

	const handleIndicatorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedIndicator(event.target.value);
	};

	return (
		<>
			<div>
				<select onChange={ handleIndicatorChange }>
					<option value="">Select Indicator</option>
					<option value="imbalances">Arrow Indicator - Imbalances</option>
				</select>
			</div>
			<div ref={ chartContainerRef } className="TVChartContainer" />
		</>
	);
};