import { classifyFeedbackReason } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-905
  test("却下修正理由のカテゴリ自動分類 - テキスト理由が事前定義カテゴリに自動分類され、集計データに反映される", () => {
    // 初期状態：カテゴリ別集計データ
    const aggregationData: Record<string, number> = {
      performance: 0,
      security: 0,
      ui_ux: 0,
      nutrition: 0,
      budget: 0,
      cooking_time: 0,
      ingredient_restriction: 0,
      family_preference: 0,
      inventory: 0,
    };

    // テスト1: パフォーマンス関連の理由を分類
    const reason1 = "パフォーマンスが低下している";
    const classification1 = classifyFeedbackReason(reason1);
    expect(classification1.category).toBe("performance");
    expect(classification1.confidence).toBeGreaterThanOrEqual(0.7);
    aggregationData[classification1.category]++;
    expect(aggregationData.performance).toBe(1);

    // テスト2: セキュリティ関連の理由を分類
    const reason2 = "セキュリティ脆弱性がある";
    const classification2 = classifyFeedbackReason(reason2);
    expect(classification2.category).toBe("security");
    expect(classification2.confidence).toBeGreaterThanOrEqual(0.7);
    aggregationData[classification2.category]++;
    expect(aggregationData.security).toBe(1);

    // テスト3: UI/UX改善関連の理由を分類
    const reason3 = "UI/UX改善が必要";
    const classification3 = classifyFeedbackReason(reason3);
    expect(classification3.category).toBe("ui_ux");
    expect(classification3.confidence).toBeGreaterThanOrEqual(0.7);
    aggregationData[classification3.category]++;
    expect(aggregationData.ui_ux).toBe(1);

    // テスト4: 栄養バランス関連の理由を分類
    const reason4 = "栄養バランスが偏っている";
    const classification4 = classifyFeedbackReason(reason4);
    expect(classification4.category).toBe("nutrition");
    expect(classification4.confidence).toBeGreaterThanOrEqual(0.7);
    aggregationData[classification4.category]++;
    expect(aggregationData.nutrition).toBe(1);

    // テスト5: 予算関連の理由を分類
    const reason5 = "予算内での献立が難しい";
    const classification5 = classifyFeedbackReason(reason5);
    expect(classification5.category).toBe("budget");
    expect(classification5.confidence).toBeGreaterThanOrEqual(0.7);
    aggregationData[classification5.category]++;
    expect(aggregationData.budget).toBe(1);

    // テスト6: 調理時間関連の理由を分類
    const reason6 = "調理時間が予定より長くかかった";
    const classification6 = classifyFeedbackReason(reason6);
    expect(classification6.category).toBe("cooking_time");
    expect(classification6.confidence).toBeGreaterThanOrEqual(0.7);
    aggregationData[classification6.category]++;
    expect(aggregationData.cooking_time).toBe(1);

    // テスト7: 食材制限関連の理由を分類
    const reason7 = "アレルギー食材が含まれていた";
    const classification7 = classifyFeedbackReason(reason7);
    expect(classification7.category).toBe("ingredient_restriction");
    expect(classification7.confidence).toBeGreaterThanOrEqual(0.7);
    aggregationData[classification7.category]++;
    expect(aggregationData.ingredient_restriction).toBe(1);

    // テスト8: 家族の好み関連の理由を分類
    const reason8 = "家族の好みに合わなかった";
    const classification8 = classifyFeedbackReason(reason8);
    expect(classification8.category).toBe("family_preference");
    expect(classification8.confidence).toBeGreaterThanOrEqual(0.7);
    aggregationData[classification8.category]++;
    expect(aggregationData.family_preference).toBe(1);

    // テスト9: 在庫関連の理由を分類
    const reason9 = "必要な食材が在庫にない";
    const classification9 = classifyFeedbackReason(reason9);
    expect(classification9.category).toBe("inventory");
    expect(classification9.confidence).toBeGreaterThanOrEqual(0.7);
    aggregationData[classification9.category]++;
    expect(aggregationData.inventory).toBe(1);

    // 最終集計データ検証
    expect(aggregationData.performance).toBe(1);
    expect(aggregationData.security).toBe(1);
    expect(aggregationData.ui_ux).toBe(1);
    expect(aggregationData.nutrition).toBe(1);
    expect(aggregationData.budget).toBe(1);
    expect(aggregationData.cooking_time).toBe(1);
    expect(aggregationData.ingredient_restriction).toBe(1);
    expect(aggregationData.family_preference).toBe(1);
    expect(aggregationData.inventory).toBe(1);

    // 合計件数確認
    const totalCount = Object.values(aggregationData).reduce((sum, count) => sum + count, 0);
    expect(totalCount).toBe(9);

    // テスト10: 複数回同じカテゴリに分類される場合
    const reason10 = "さらにパフォーマンス改善が必要";
    const classification10 = classifyFeedbackReason(reason10);
    expect(classification10.category).toBe("performance");
    aggregationData[classification10.category]++;
    expect(aggregationData.performance).toBe(2);

    // 最終合計確認
    const finalTotalCount = Object.values(aggregationData).reduce((sum, count) => sum + count, 0);
    expect(finalTotalCount).toBe(10);
  });
});