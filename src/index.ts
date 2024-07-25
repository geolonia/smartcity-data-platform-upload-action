import * as core from '@actions/core';

async function main() {
  const apiEndpoint = core.getInput('api-endpoint');
  const apiKey = core.getInput('api-key');
  core.setSecret(apiKey);

  const dataDirectory = core.getInput('data-directory');
  const id = core.getInput('id');
  const shapefileDefaultCrs = core.getInput('shapefile-default-crs');

  console.log('api-endpoint:', apiEndpoint);
  console.log('api-key:', apiKey);
  console.log('data-directory:', dataDirectory);
  console.log('id:', id);
  console.log('shapefile-default-crs:', shapefileDefaultCrs);
}

main().catch((error) => {
  core.setFailed(error.message);
});
