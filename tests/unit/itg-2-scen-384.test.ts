import { analyzeFeatureUsagePatterns } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能", () => {
  // SCEN-384
  test("[error] 機能別使用パターン分析機能 - 利用ログデータが存在しない場合にエラーが適切に返却される", async () => {
    const fetchMock = require("jest-fetch-mock");
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    // 利用ログデータが存在しないユーザーID
    const nonExistentUserId = "user-does-not-exist-12345";

    // API が 404 を返すモック設定
    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: "利用ログデータが見つかりません",
        code: "LOG_NOT_FOUND",
        statusCode: 404,
      }),
      { status: 404 }
    );

    // 関数呼び出し時にエラーが発生することを検証
    await expect(
      analyzeFeatureUsagePatterns({
        userId: nonExistentUserId,
        analysisStartDate: "2024-01-01",
        analysisEndDate: "2024-01-31",
      })
    ).rejects.toThrow(/利用ログ/);

    // API が正しく呼ばれたことを検証
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`user_id=${nonExistentUserId}`),
      expect.objectContaining({
        method: "GET",
      })
    );
  });
});