# SmartCity データ基盤アップロードアクション

レポジトリで管理している位置情報データを Geolonia SmartCity データ基盤にアップロードするために使用します。

## 使用例

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: geolonia/smartcity-data-platform-upload-action@main
    with:
      # アカウントが発行されるときに策定する識別子
      # 必須
      id: my-id
      # データ基盤に認証するためのAPIキー
      # 必須
      api-key: ${secrets.GEOLONIA_DATA_PLATFORM_API_KEY}

      # 元データを読み込むディレクトリ
      # デフォルト: `./data`
      # 任意
      data-directory:

      # Shapefile の .prj ファイルが存在しないときに使うCRS。
      # デフォルト: shapefileが認識されたが、 .prj が見つからない場合はエラーとなります。
      # 任意
      shapefile-default-crs:
```

デフォルトで `data` ディレクトリ内の CSV, GeoJSON, Excel, Shapefile ファイルを列挙し、データ基盤に送信します。

`id` はアカウント発行するときに策定されます。APIキーはシステム管理者に問い合わせてください。`id` は公開しても問題ないのですが、 `api-key` を公開すると第三者がデータを改ざんする事ができるので、大事に管理してください。 GitHub Actions から安全にリリースするために、 [GitHub Actions のシークレット](https://docs.github.com/ja/actions/security-guides/using-secrets-in-github-actions)として使用し、参照してください。

データセット名はファイル名から自動計算されます。
