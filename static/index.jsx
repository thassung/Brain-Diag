import { h, render, Component } from 'preact';
import * as cornerstone from '@cornerstonejs/core';
import dicomParser from 'dicom-parser';
import { api } from 'dicomweb-client';
import dcmjs from 'dcmjs';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';

class App extends Component {
	async componentDidMount() {
		await cornerstone.init();
		this.initCornerstoneDICOMImageLoader();

		// Get Cornerstone imageIds and fetch metadata into RAM
		const imageIds = await this.createImageIdsAndCacheMetaData({
		  StudyInstanceUID:
		    '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
		  SeriesInstanceUID:
		    '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
		  wadoRsRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
		});

		const content = document.getElementById('content');
		const element = document.createElement('div');

		element.style.width = '500px';
		element.style.height = '500px';

		content.appendChild(element);
		const renderingEngineId = 'myRenderingEngine';
		const renderingEngine = new cornerstone.RenderingEngine(renderingEngineId);
		const viewportId = 'CT_AXIAL_STACK';

		const viewportInput = {
		  viewportId,
		  element,
		  type: cornerstone.Enums.ViewportType.STACK,
		};

		renderingEngine.enableElement(viewportInput);
		const viewport = renderingEngine.getViewport(viewportId);

		viewport.setStack(imageIds, 60);

		viewport.render();
	}


	initCornerstoneDICOMImageLoader() {
	  const { preferSizeOverAccuracy, useNorm16Texture } = cornerstone.getConfiguration().rendering;
	  cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
	  cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;
	  cornerstoneDICOMImageLoader.configure({
	    useWebWorkers: true,
	    decodeConfig: {
	      convertFloatPixelDataToInt: false,
	      use16BitDataType: preferSizeOverAccuracy || useNorm16Texture,
	    },
	  });

	  let maxWebWorkers = 1;

	  if (navigator.hardwareConcurrency) {
	    maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7);
	  }

	  var config = {
	    maxWebWorkers,
	    startWebWorkersOnDemand: false,
	    taskConfiguration: {
	      decodeTask: {
	        initializeCodecsOnStartup: false,
	        strict: false,
	      },
	    },
	  };

	  cornerstoneDICOMImageLoader.webWorkerManager.initialize(config);
	}


	async createImageIdsAndCacheMetaData({
	  StudyInstanceUID,
	  SeriesInstanceUID,
	  SOPInstanceUID = null,
	  wadoRsRoot,
	  client = null,
	}) {
	  const SOP_INSTANCE_UID = '00080018';
	  const SERIES_INSTANCE_UID = '0020000E';
	  const MODALITY = '00080060';

	  const studySearchOptions = {
	    studyInstanceUID: StudyInstanceUID,
	    seriesInstanceUID: SeriesInstanceUID,
	  };

	  client = client || new api.DICOMwebClient({ url: wadoRsRoot });
	  const instances = await client.retrieveSeriesMetadata(studySearchOptions);
	  const modality = instances[0][MODALITY].Value[0];
	  let imageIds = instances.map((instanceMetaData) => {
	    const SeriesInstanceUID = instanceMetaData[SERIES_INSTANCE_UID].Value[0];
	    const SOPInstanceUIDToUse =
	      SOPInstanceUID || instanceMetaData[SOP_INSTANCE_UID].Value[0];

	    const prefix = 'wadors:';

	    const imageId =
	      prefix +
	      wadoRsRoot +
	      '/studies/' +
	      StudyInstanceUID +
	      '/series/' +
	      SeriesInstanceUID +
	      '/instances/' +
	      SOPInstanceUIDToUse +
	      '/frames/1';

	    cornerstoneDICOMImageLoader.wadors.metaDataManager.add(
	      imageId,
	      instanceMetaData
	    );
	    return imageId;
	  });

	  return imageIds;
	}


	render() {
		return (
			<div>
				<p>hello world</p>
				<div id="content"></div>
			</div>
		)
	}
}

render(<App />, document.getElementById('app'));
