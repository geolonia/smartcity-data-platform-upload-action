import * as core from '@actions/core';
import findInputData from './stages/10_findInputData';
import inputToGeoJSON from './stages/20_inputToGeoJSON';
import sendToDataPlatform from './stages/30_sendToDataPlatform';

async function main() {
  const apiKey = core.getInput('api-key');
  core.setSecret(apiKey);

  const dataDirectory = core.getInput('data-directory');

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
    console.log(`レイヤー: ${data.layerName} (${data.type})`);
    const features = await inputToGeoJSON(data);
    console.log(`[${data.layerName}] 地物数:`, features.length);

    await sendToDataPlatform(data, features);
    console.log(`[${data.layerName}] 送信完了`);
  }

  console.log('処理完了');
}

main().catch((error) => {
  core.setFailed(error.message);
});
