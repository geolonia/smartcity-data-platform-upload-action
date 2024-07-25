import * as core from '@actions/core';
import findInputData from './stages/10_findInputData';
import inputToGeoJSON from './stages/20_inputToGeoJSON';

async function main() {
  const apiEndpoint = core.getInput('api-endpoint');
  const apiKey = core.getInput('api-key');
  core.setSecret(apiKey);

  const dataDirectory = core.getInput('data-directory');
  const id = core.getInput('id');

  // console.log('api-endpoint:', apiEndpoint);
  // console.log('api-key:', apiKey);
  // console.log('data-directory:', dataDirectory);
  // console.log('id:', id);

  const inputData = await findInputData(dataDirectory);
  core.debug(`Found ${inputData.length} input data files.`);

  if (inputData.length === 0) {
    core.setFailed('No input data found.');
    return;
  }

  for (const data of inputData) {
    console.log('レイヤー:', data.layerName);
    const features = await inputToGeoJSON(data);
    console.log('地物数:', features.length);
  }
}

main().catch((error) => {
  core.setFailed(error.message);
});
