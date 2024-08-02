import * as core from '@actions/core';
import * as http from '@actions/http-client';
import { v7 as uuid7 } from 'uuid';
import { InputData } from './10_findInputData';

export default async function sendToDataPlatform(inputData: InputData, features: GeoJSON.Feature[]): Promise<void> {
  const apiKey = core.getInput('api-key');
  const dataPlatformClient = new http.HttpClient('data-platform', [], {
    headers: {
      'authorization': `Bearer ${apiKey}`,
      [http.Headers.ContentType]: 'application/json',
    },
  });
  const apiEndpoint = core.getInput('api-endpoint');
  const tenantId = core.getInput('id');

  const newDatasetSlug = uuid7();

  const datasetUrl = `${apiEndpoint}/api/${tenantId}/dataset`;

  const body = JSON.stringify({
    slug: newDatasetSlug,
    display_name: inputData.layerName,
  });
  const createDatasetResp = await dataPlatformClient.post(datasetUrl, body);
  const respBody = await createDatasetResp.readBody();
  if (createDatasetResp.message.statusCode !== 200) {
    throw new Error(`Failed to create dataset: ${createDatasetResp.message.statusCode} ${respBody}`);
  }

  const sendChunk = async (chunk: string): Promise<void> => {
    const response = await dataPlatformClient.post(`${datasetUrl}/${newDatasetSlug}/features`, chunk);

    const body = await response.readBody();
    if (response.message.statusCode !== 200) {
      throw new Error(`Failed to send data to the platform: ${response.message.statusCode} ${body}`);
    }
  };

  // We can POST up to about 5MB of data at a time, so we'll split the data into chunks.
  let currentChunk: string = '[';
  let currentChunkCount = 0;
  for (const feature of features) {
    const body = JSON.stringify({
      properties: feature.properties,
      geom: feature.geometry,
    });

    if (currentChunk.length + body.length > 5_000_000) {
      if (currentChunkCount === 0) {
        throw new Error('Feature too large to send to the platform - each singular feature must be less than 5MB');
      }
      currentChunk = currentChunk.slice(0, -1) + ']';
      console.log(`Sending chunk of ${currentChunkCount} features`);
      await sendChunk(currentChunk);
      currentChunkCount = 0;
      currentChunk = '[';
    } else {
      currentChunkCount += 1;
      currentChunk += body + ',';
    }
  }

  if (currentChunk.length > 1) {
    currentChunk = currentChunk.slice(0, -1) + ']';
    console.log(`Sending chunk of ${currentChunkCount} features`);
    await sendChunk(currentChunk);
  }
  // Rename the dataset to the final name, overwriting the current data
  const renameUrl = `${datasetUrl}/${newDatasetSlug}/rename`;
  const renameBody = JSON.stringify({
    slug: inputData.layerName,
  });
  const renameResp = await dataPlatformClient.post(renameUrl, renameBody);
  const renameRespBody = await renameResp.readBody();
  if (renameResp.message.statusCode !== 200) {
    throw new Error(`Failed to rename dataset: ${renameResp.message.statusCode} ${renameRespBody}`);
  }
}
