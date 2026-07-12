// AIVIC Backend Configuration
// AIVIC_APP_URL 環境変数が設定されている場合は自動セットされます
// 未設定の場合: REPLACE_WITH_API_URL を AIVIC アプリの URL（例: https://your-app.amplifyapp.com）に書き換えてください

window.AIVIC_API_URL = "REPLACE_WITH_API_URL";
window.AIVIC_TABLES = {
  "月次食費予算": 0,
  "食費実績": 1,
  "購入記録": 2,
  "食材": 3,
  "流通業者": 4,
  "スーパー": 5,
  "在庫データ": 6,
  "価格データ": 7,
  "超過要因分析": 8,
  "削減効果分析": 9
};
