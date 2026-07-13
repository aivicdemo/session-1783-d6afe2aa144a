import { validateSegmentationCriteria } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能", () => {
  // SCEN-380
  test("セグメント別効果分析機能 - セグメント分類基準が不完全な場合にエラー通知される", () => {
    // 前提: 栄養管理・分析ダッシュボードシステムにログイン済み、セグメント別効果分析機能にアクセス
    // 発生条件: 必須項目を未入力のまま分類基準を保存しようとする

    // テストケース1: ageGroup が未入力
    const incompleteInput1 = {
      ageGroup: "",
      familyComposition: "nuclear_family",
      restrictionType: "allergy",
      timestamp: new Date("2024-01-15T11:00:00Z"),
    };

    expect(() => validateSegmentationCriteria(incompleteInput1)).toThrow(
      /年齢/
    );

    // テストケース2: familyComposition が未入力
    const incompleteInput2 = {
      ageGroup: "30-40",
      familyComposition: "",
      restrictionType: "allergy",
      timestamp: new Date("2024-01-15T11:00:00Z"),
    };

    expect(() => validateSegmentationCriteria(incompleteInput2)).toThrow(
      /家族構成/
    );

    // テストケース3: restrictionType が未入力
    const incompleteInput3 = {
      ageGroup: "30-40",
      familyComposition: "nuclear_family",
      restrictionType: "",
      timestamp: new Date("2024-01-15T11:00:00Z"),
    };

    expect(() => validateSegmentationCriteria(incompleteInput3)).toThrow(
      /制限/
    );

    // テストケース4: 複数の必須項目が未入力
    const incompleteInput4 = {
      ageGroup: "",
      familyComposition: "",
      restrictionType: "allergy",
      timestamp: new Date("2024-01-15T11:00:00Z"),
    };

    expect(() => validateSegmentationCriteria(incompleteInput4)).toThrow(
      /年齢/
    );

    // 期待結果: 正常系 - すべての必須項目が入力された場合、エラーが発生しない
    const validInput = {
      ageGroup: "30-40",
      familyComposition: "nuclear_family",
      restrictionType: "allergy",
      timestamp: new Date("2024-01-15T11:00:00Z"),
    };

    const result = validateSegmentationCriteria(validInput);

    expect(result).toEqual({
      isValid: true,
      ageGroup: "30-40",
      familyComposition: "nuclear_family",
      restrictionType: "allergy",
      timestamp: new Date("2024-01-15T11:00:00Z"),
    });

    // 期待結果: エラーメッセージが日本語で明確に表示され、ユーザーが必須項目を補完可能な状態である
    // テストケース5: ageGroup 未入力時のエラーメッセージ内容検証
    const errorMessage1 = () => validateSegmentationCriteria(incompleteInput1);
    expect(errorMessage1).toThrow(/年齢/);

    // テストケース6: familyComposition 未入力時のエラーメッセージ内容検証
    const errorMessage2 = () => validateSegmentationCriteria(incompleteInput2);
    expect(errorMessage2).toThrow(/家族構成/);

    // テストケース7: restrictionType 未入力時のエラーメッセージ内容検証
    const errorMessage3 = () => validateSegmentationCriteria(incompleteInput3);
    expect(errorMessage3).toThrow(/制限/);

    // 期待結果: エラー状態からの復帰が可能である
    // 不完全な入力でエラーが発生した後、同じ関数に完全な入力を渡すと成功する
    const recoveryResult = validateSegmentationCriteria(validInput);
    expect(recoveryResult.isValid).toBe(true);
  });
});