import * as core from '@actions/core';
import findInputData from './findInputData';

async function main() {
  const apiEndpoint = core.getInput('api-endpoint');
  const apiKey = core.getInput('api-key');
  core.setSecret(apiKey);

  const dataDirectory = core.getInput('data-directory');
  const id = core.getInput('id');
  const shapefileDefaultCrs = core.getInput('shapefile-default-crs');

  // console.log('api-endpoint:', apiEndpoint);
  // console.log('api-key:', apiKey);
  // console.log('data-directory:', dataDirectory);
  // console.log('id:', id);
  // console.log('shapefile-default-crs:', shapefileDefaultCrs);

  const inputData = await findInputData(dataDirectory);
  core.debug(`Found ${inputData.length} input data files.`);
  console.log('inputData:', inputData);

  if (inputData.length === 0) {
    core.setFailed('No input data found.');
    return;
  }
}

main().catch((error) => {
  core.setFailed(error.message);
});
