import type GeoJSON from 'geojson';
import fsP from 'fs/promises';
import Papa from 'papaparse';
import detectAndDecode from './detectAndDecode';

export class CSV2GeoJSONError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CSV2GeoJSONError';
  }
}

export async function csvFile2geojson(csvPath: string): Promise<GeoJSON.Feature[]> {
  const csvData = await fsP.readFile(csvPath);
  const csvString = detectAndDecode(csvData);
  return csv2geojson(csvString);
}

export default function csv2geojson(csvString: string): Promise<GeoJSON.Feature[]> {
  return new Promise<GeoJSON.Feature[]>((resolve, reject) => {
    Papa.parse<{[key: string]: any}>(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const latHeaders = [
          /緯度/,
          /lat(itude)?/i,
        ];
        const lonHeaders = [
          /経度/,
          /lon(gitude)?/i,
          /lng/i,
        ];

        let latField: string | undefined, lonField: string | undefined;

        const headers = results.meta.fields;

        // 緯度・経度のヘッダー名を判定
        for (const field of (headers || [])) {

          if (typeof latField === 'undefined' && latHeaders.some((regex) => regex.test(field))) {
            latField = field;
          }
          if (typeof lonField === 'undefined' && lonHeaders.some((regex) => regex.test(field))) {
            lonField = field;
          }
        }

        if (!latField || !lonField) {
          return reject(new CSV2GeoJSONError("緯度または経度の列が見つかりません。"));
        }

        // let out = '{"type":"FeatureCollection","features":[\n';
        const out: GeoJSON.Feature[] = [];

        let recordedFeatures = 0;
        for (const record of results.data) {
          const latValue = parseFloat(record[latField]);
          const lonValue = parseFloat(record[lonField]);

          if (isNaN(latValue) || isNaN(lonValue)) {
            // 緯度・経度の値が数値でない場合はスキップ
            continue;
          }

          // recordから緯度・経度のフィールドを削除
          delete record[latField];
          delete record[lonField];

          recordedFeatures += 1;
          out.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [lonValue, latValue]
            },
            properties: record
          });
        }

        //geojson の features が空の場合はエラー
        if (recordedFeatures === 0) {
          return reject(new CSV2GeoJSONError("緯度・経度の列に数値以外の値が含まれているか、データが空です。"));
        }

        resolve(out);
      },
      error: (err: unknown) => {
        reject(err);
      }
    });
  });
}
