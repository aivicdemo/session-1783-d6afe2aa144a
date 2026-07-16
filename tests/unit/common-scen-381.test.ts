import { optimizeMenuScoringWithFallback } from "../../src/logic/common";
const fetchMock = require("jest-fetch-mock");

describe("共通 - 献立案の最適化スコアリング機能", () => {
  // SCEN-381
  test("流通業者のAPI連携が失敗した場合、フォールバック処理が実行され献立提示が中断される", () => {
    fetchMock.resetMocks();
    
    const menuId = "menu-001";
    const userId = "user-123";
    
    // 流通業者API連携がエラーレスポンス（500）を返すように設定
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );

    const result = optimizeMenuScoringWithFallback({
      menuId: menuId,
      userId: userId,
      distributorApiUrl: "https://api.distributor.example.com/prices"
    });

    // フォールバック処理が実行されたことを確認
    expect(result.isFallbackExecuted).toBe(true);
    
    // 献立提示が中断されたことを確認
    expect(result.menuPresentationStatus).toBe("suspended");
    
    // エラーメッセージが表示されることを確認
    expect(result.errorMessage).toMatch(/流通業者/);
    
    // システムが安定した状態を保つことを確認
    expect(result.systemStatus).toBe("stable");
    
    // フォールバック時には代替スコアが使用されることを確認
    expect(result.score).toBeDefined();
    expect(typeof result.score).toBe("number");
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});