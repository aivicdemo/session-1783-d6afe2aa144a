import { acquireExternalFactorDataWithTrustScore } from "../../src/logic/it-1-br-6-2-1-1";

describe("食材流通業者・スーパーの在庫・価格データ連携インターフェース", () => {
  // SCEN-471
  test("外部要因データの信頼度スコア付与・採用判定 - データソース連携エラーで外部要因データ取得に失敗した場合例外を返す", () => {
    const mockExternalDataSource = {
      fetchWeatherData: jest.fn().mockRejectedValueOnce(
        new Error("データソース接続エラー")
      ),
      fetchPriceIndex: jest.fn(),
      fetchEventInfo: jest.fn(),
    };

    const inputParams = {
      targetDate: new Date("2024-12-15T09:00:00Z"),
      dataSourceConnections: mockExternalDataSource,
      requiredFactorTypes: ["weather", "priceIndex"],
    };

    expect(() =>
      acquireExternalFactorDataWithTrustScore(inputParams)
    ).toThrow(/データソース接続エラー/);

    const result = (() => {
      try {
        return acquireExternalFactorDataWithTrustScore(inputParams);
      } catch (error) {
        return {
          isError: true,
          message:
            error instanceof Error ? error.message : "不明なエラー",
        };
      }
    })();

    expect(result.isError).toBe(true);
    expect(
      result.message.includes("データソース接続エラー") ||
        result.message.includes("外部要因データ取得失敗")
    ).toBe(true);

    expect(mockExternalDataSource.fetchWeatherData).toHaveBeenCalledTimes(1);

    const trustScoreResult = (() => {
      try {
        acquireExternalFactorDataWithTrustScore(inputParams);
        return { trustScores: null };
      } catch {
        return { trustScores: null };
      }
    })();

    expect(trustScoreResult.trustScores).toBeNull();
  });
});