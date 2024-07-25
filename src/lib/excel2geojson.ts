import csv2geojson from "./csv2geojson";
import excel2csv from "./excel2csv";

export default async function excel2geojson(excelPath: string): Promise<GeoJSON.Feature[]> {
  const csv = await excel2csv(excelPath);
  return csv2geojson(csv);
}
