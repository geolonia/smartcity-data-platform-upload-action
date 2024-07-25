import path from 'node:path';
import glob from '@actions/glob';

export type InputData = {
  type: 'xlsx' | 'csv' | 'geojson' | 'shp';
  path: string;
  layerName: string;
}

export default async function findInputData(dataDirectory: string): Promise<InputData[]> {
  const patterns = [
    '**/*.xlsx',
    '**/*.csv',
    '**/*.geojson',
    '**/*.shp',
  ].map((pattern) => path.join(dataDirectory, pattern));

  const globber = await glob.create(patterns.join('\n'));
  const files = await globber.glob();

  return files.map((file) => {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);

    // layerName is the relative path from dataDirectory, separators replaced by underscores, and no extension
    const layerName = path.relative(dataDirectory, file).replace(/[\\/]/g, '_').replace(/\.[^.]+$/, '');    

    const inputData: InputData = {
      type: ext.slice(1) as InputData['type'],
      path: file,
      layerName,
    };
    return inputData;
  });
}
