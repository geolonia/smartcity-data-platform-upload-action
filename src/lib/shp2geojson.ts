import path from 'node:path';
import fs from 'node:fs';
import * as exec from '@actions/exec';
import * as core from '@actions/core';

export default async function shp2geojson(shpPath: string): Promise<GeoJSON.Feature[]> {
  const shapefileDefaultCrs = core.getInput('shapefile-default-crs');

  // is .prj file present?
  let srsArgs: string[] = [];
  const prjPath = path.join(path.dirname(shpPath), path.basename(shpPath, path.extname(shpPath)) + '.prj');
  if (!fs.existsSync(prjPath)) {
    if (!shapefileDefaultCrs) {
      throw new Error('shapefile の CRS が不明です。shapefile-default-crs にデフォルトの CRS を指定してください。');
    }
    srsArgs = ['-s_srs', shapefileDefaultCrs];
  }

  let rawGeoJSON = '';
  const ogrArgs = [
    ...srsArgs,
    '-f', 'GeoJSON',
    '/vsistdout/',
    shpPath,
  ];
  await exec.exec('ogr2ogr', ogrArgs, {
    listeners: {
      stdout: (data) => {
        rawGeoJSON += data.toString();
      },
    }
  });
  const geojson = JSON.parse(rawGeoJSON) as GeoJSON.FeatureCollection;
  return geojson.features;
}
