import { classifyPainFactors } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーペイン自動分類機能", () => {
  // SCEN-386
  test("離脱ポイントと入力パターンからペイン要因が正確に自動分類される", () => {
    // ハッピーパス: 標準的な離脱ポイントと入力パターンの組み合わせ
    const loginScreenExitWithInputError = classifyPainFactors({
      exitPoint: "login_screen",
      inputPattern: "input_error",
      timestamp: new Date("2024-01-15T10:30:00Z"),
      userId: "user_001",
      sessionId: "sess_001",
    });
    expect(loginScreenExitWithInputError).toEqual({
      painFactorCategory: "入力エラー",
      riskLevel: "高",
      priority: 1,
      suggestedAction: "入力フォームのバリデーション改善",
      affectedUserSegment: "全セグメント",
      estimatedImpact: 85,
    });

    const nutritionScreenExitWithTimeout = classifyPainFactors({
      exitPoint: "nutrition_input_screen",
      inputPattern: "timeout",
      timestamp: new Date("2024-01-15T11:00:00Z"),
      userId: "user_002",
      sessionId: "sess_002",
    });
    expect(nutritionScreenExitWithTimeout).toEqual({
      painFactorCategory: "システムパフォーマンス",
      riskLevel: "高",
      priority: 2,
      suggestedAction: "API レスポンスタイムの最適化",
      affectedUserSegment: "栄養入力ユーザー",
      estimatedImpact: 78,
    });

    const analysisScreenExitWithOperationError = classifyPainFactors({
      exitPoint: "analysis_result_screen",
      inputPattern: "operation_error",
      timestamp: new Date("2024-01-15T11:30:00Z"),
      userId: "user_003",
      sessionId: "sess_003",
    });
    expect(analysisScreenExitWithOperationError).toEqual({
      painFactorCategory: "操作ミス",
      riskLevel: "中",
      priority: 3,
      suggestedAction: "UX ガイダンスの追加",
      affectedUserSegment: "シニアユーザー",
      estimatedImpact: 62,
    });

    const mealRecordScreenExitWithDataValidation = classifyPainFactors({
      exitPoint: "meal_record_screen",
      inputPattern: "data_validation_error",
      timestamp: new Date("2024-01-15T12:00:00Z"),
      userId: "user_004",
      sessionId: "sess_004",
    });
    expect(mealRecordScreenExitWithDataValidation).toEqual({
      painFactorCategory: "データ検証エラー",
      riskLevel: "中",
      priority: 4,
      suggestedAction: "入力値チェック機構の強化",
      affectedUserSegment: "栄養記録ユーザー",
      estimatedImpact: 71,
    });

    // 境界値テスト: 複数の同時離脱パターン
    const multipleExitPatterns = classifyPainFactors({
      exitPoint: "dashboard_summary",
      inputPattern: "network_interruption",
      timestamp: new Date("2024-01-15T12:30:00Z"),
      userId: "user_005",
      sessionId: "sess_005",
    });
    expect(multipleExitPatterns).toEqual({
      painFactorCategory: "ネットワーク問題",
      riskLevel: "高",
      priority: 1,
      suggestedAction: "オフラインモード対応",
      affectedUserSegment: "モバイルユーザー",
      estimatedImpact: 88,
    });

    // エッジケース: 未知の入力パターン
    const unknownPatternHandling = classifyPainFactors({
      exitPoint: "unknown_screen",
      inputPattern: "unknown_error_type",
      timestamp: new Date("2024-01-15T13:00:00Z"),
      userId: "user_006",
      sessionId: "sess_006",
    });
    expect(unknownPatternHandling).toEqual({
      painFactorCategory: "その他",
      riskLevel: "低",
      priority: 5,
      suggestedAction: "詳細なエラーログの確認推奨",
      affectedUserSegment: "未特定",
      estimatedImpact: 0,
    });

    // エッジケース: 境界値 - 優先度スコア計算の最小値
    const lowPriorityPattern = classifyPainFactors({
      exitPoint: "settings_screen",
      inputPattern: "display_issue",
      timestamp: new Date("2024-01-15T13:30:00Z"),
      userId: "user_007",
      sessionId: "sess_007",
    });
    expect(lowPriorityPattern).toEqual({
      painFactorCategory: "UI 表示問題",
      riskLevel: "低",
      priority: 5,
      suggestedAction: "スタイルシート修正",
      affectedUserSegment: "特定デバイスユーザー",
      estimatedImpact: 18,
    });

    // エッジケース: 優先度スコア計算の最大値
    const highPriorityPattern = classifyPainFactors({
      exitPoint: "login_screen",
      inputPattern: "security_breach",
      timestamp: new Date("2024-01-15T14:00:00Z"),
      userId: "user_008",
      sessionId: "sess_008",
    });
    expect(highPriorityPattern).toEqual({
      painFactorCategory: "セキュリティ",
      riskLevel: "極高",
      priority: 1,
      suggestedAction: "セキュリティ対策の即時実施",
      affectedUserSegment: "全セグメント",
      estimatedImpact: 100,
    });

    // エッジケース: 同一ユーザーの重複した離脱パターン
    const duplicateExitPattern = classifyPainFactors({
      exitPoint: "nutrition_input_screen",
      inputPattern: "input_error",
      timestamp: new Date("2024-01-15T14:30:00Z"),
      userId: "user_001",
      sessionId: "sess_009",
    });
    expect(duplicateExitPattern).toEqual({
      painFactorCategory: "入力エラー",
      riskLevel: "高",
      priority: 1,
      suggestedAction: "入力フォームのバリデーション改善",
      affectedUserSegment: "全セグメント",
      estimatedImpact: 85,
    });

    // エッジケース: タイムスタンプ近接パターン
    const closeTimestampPatterns = classifyPainFactors({
      exitPoint: "analysis_result_screen",
      inputPattern: "timeout",
      timestamp: new Date("2024-01-15T14:59:59Z"),
      userId: "user_009",
      sessionId: "sess_010",
    });
    expect(closeTimestampPatterns).toEqual({
      painFactorCategory: "システムパフォーマンス",
      riskLevel: "高",
      priority: 2,
      suggestedAction: "API レスポンスタイムの最適化",
      affectedUserSegment: "栄養入力ユーザー",
      estimatedImpact: 78,
    });

    // エラーテスト: 必須フィールド exitPoint の欠落
    expect(() =>
      classifyPainFactors({
        exitPoint: "",
        inputPattern: "input_error",
        timestamp: new Date("2024-01-15T15:00:00Z"),
        userId: "user_010",
        sessionId: "sess_011",
      })
    ).toThrow(/exitPoint/);

    // エラーテスト: 必須フィールド inputPattern の欠落
    expect(() =>
      classifyPainFactors({
        exitPoint: "login_screen",
        inputPattern: "",
        timestamp: new Date("2024-01-15T15:00:00Z"),
        userId: "user_011",
        sessionId: "sess_012",
      })
    ).toThrow(/inputPattern/);

    // エラーテスト: 無効なタイムスタンプ
    expect(() =>
      classifyPainFactors({
        exitPoint: "login_screen",
        inputPattern: "input_error",
        timestamp: new Date("invalid"),
        userId: "user_012",
        sessionId: "sess_013",
      })
    ).toThrow(/timestamp/);

    // エラーテスト: 無効なユーザー ID
    expect(() =>
      classifyPainFactors({
        exitPoint: "login_screen",
        inputPattern: "input_error",
        timestamp: new Date("2024-01-15T15:00:00Z"),
        userId: "",
        sessionId: "sess_014",
      })
    ).toThrow(/userId/);

    // エラーテスト: 無効なセッション ID
    expect(() =>
      classifyPainFactors({
        exitPoint: "login_screen",
        inputPattern: "input_error",
        timestamp: new Date("2024-01-15T15:00:00Z"),
        userId: "user_013",
        sessionId: "",
      })
    ).toThrow(/sessionId/);

    // 一貫性テスト: 同じパターンで複数回呼び出すと結果が一致することを確認
    const result1 = classifyPainFactors({
      exitPoint: "login_screen",
      inputPattern: "input_error",
      timestamp: new Date("2024-01-15T16:00:00Z"),
      userId: "user_014",
      sessionId: "sess_015",
    });
    const result2 = classifyPainFactors({
      exitPoint: "login_screen",
      inputPattern: "input_error",
      timestamp: new Date("2024-01-15T16:00:00Z"),
      userId: "user_015",
      sessionId: "sess_016",
    });
    expect(result1).toEqual(result2);
  });
});