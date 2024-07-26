import * as core from '@actions/core';
import * as http from '@actions/http-client';
import { InputData } from './10_findInputData';

export default async function sendToDataPlatform(inputData: InputData, features: GeoJSON.Feature[]): Promise<void> {
  const client = new http.HttpClient('data-platform');
  const apiEndpoint = core.getInput('api-endpoint');
  const tenantId = core.getInput('id');

  const datasetUrl = `${apiEndpoint}/api/${tenantId}/dataset`;
  const url = `${datasetUrl}/${inputData.layerName}/features`;

  const datasetResp = await client.get(url);
  if (datasetResp.message.statusCode === 404) {
    // dataset not found, create one.
    const body = JSON.stringify({
      slug: inputData.layerName,
      display_name: inputData.layerName,
    });
    const response = await client.post(datasetUrl, body, {
      'Content-Type': 'application/json',
    });
    const respBody = await response.readBody();
    if (response.message.statusCode !== 200) {
      throw new Error(`Failed to create dataset: ${response.message.statusCode} ${respBody}`);
    }
  }

  const sendChunk = async (chunk: string): Promise<void> => {
    const response = await client.post(url, chunk, {
      'Content-Type': 'application/json',
    });

    // we must consume the body, otherwise the connection will be left open and the action will hang.
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
}
