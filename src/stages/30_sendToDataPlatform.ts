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
    if (response.message.statusCode !== 200) {
      const body = await response.readBody();
      throw new Error(`Failed to create dataset: ${response.message.statusCode} ${body}`);
    }
  }

  for (const feature of features) {
    const body = JSON.stringify({
      properties: feature.properties,
      geom: feature.geometry,
    });

    const response = await client.post(url, body, {
      'Content-Type': 'application/json',
    });

    if (response.message.statusCode !== 200) {
      const body = await response.readBody();
      throw new Error(`Failed to send data to the platform: ${response.message.statusCode} ${body}`);
    }
  }
}
