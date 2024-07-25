import fsP from "fs/promises";
import shp2geojson from "../lib/shp2geojson";
import { InputData } from "./10_findInputData";
import { csvFile2geojson } from "../lib/csv2geojson";
import excel2geojson from "../lib/excel2geojson";

const PROCESSORS: { [key: string]: (inputPath: string) => Promise<GeoJSON.Feature[]> } = {
  'shp': shp2geojson,
  'geojson': async (inputPath: string) => {
    const rawGeoJSON = await fsP.readFile(inputPath, { encoding: 'utf-8' });
    const geojson = JSON.parse(rawGeoJSON);
    if (geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
      throw new Error('GeoJSON の type が FeatureCollection ではありません。');
    }
    return (geojson as GeoJSON.FeatureCollection).features;
  },
  'csv': csvFile2geojson,
  'xlsx': excel2geojson,
};

export default async function inputToGeoJSON(inputData: InputData): Promise<GeoJSON.Feature[]> {
  const processor = PROCESSORS[inputData.type];
  if (!processor) {
    throw new Error(`未対応のファイル形式です: ${inputData.type}`);
  }
  return processor(inputData.path);
}
