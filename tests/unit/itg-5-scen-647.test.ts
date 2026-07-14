import { classifyMealFeedbackReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類機能', () => {
  // SCEN-647
  test('献立却下・修正理由が定義されたカテゴリに正確に自動分類される', () => {
    // ========================================
    // 1. テスト環境のセットアップ
    // ========================================
    const feedbackReasonSamples = [
      // 栄養バランスに該当する理由
      {
        reason_id: 'reason_001',
        reason_text: 'タンパク質の量が少なすぎる',
        expected_category: 'nutrition_balance'
      },
      {
        reason_id: 'reason_002',
        reason_text: '栄養バランスが悪い',
        expected_category: 'nutrition_balance'
      },
      // 食材入手困難に該当する理由
      {
        reason_id: 'reason_003',
        reason_text: '鮮魚が入手困難',
        expected_category: 'ingredient_unavailability'
      },
      {
        reason_id: 'reason_004',
        reason_text: '旬の野菜が見つからない',
        expected_category: 'ingredient_unavailability'
      },
      // 調理時間超過に該当する理由
      {
        reason_id: 'reason_005',
        reason_text: '調理時間が30分を超えてしまう',
        expected_category: 'cooking_time_exceeded'
      },
      {
        reason_id: 'reason_006',
        reason_text: '仕込みに1時間かかる',
        expected_category: 'cooking_time_exceeded'
      },
      // 家族の好みに該当する理由
      {
        reason_id: 'reason_007',
        reason_text: '子どもが嫌いな野菜が多く含まれている',
        expected_category: 'family_preference'
      },
      {
        reason_id: 'reason_008',
        reason_text: '妻がこのメニューは好きじゃない',
        expected_category: 'family_preference'
      },
      // 予算制約に該当する理由
      {
        reason_id: 'reason_009',
        reason_text: '食材費が予算を超過する',
        expected_category: 'budget_constraint'
      },
      {
        reason_id: 'reason_010',
        reason_text: '高級食材ばかりで高すぎる',
        expected_category: 'budget_constraint'
      },
      // 食事制限・アレルギーに該当する理由
      {
        reason_id: 'reason_011',
        reason_text: 'アレルゲン食材が含まれている',
        expected_category: 'allergy_restriction'
      },
      {
        reason_id: 'reason_012',
        reason_text: '塩分制限に違反している',
        expected_category: 'allergy_restriction'
      }
    ];

    // ========================================
    // 2. 複数の献立却下・修正理由サンプルデータを準備し、
    //    各サンプルに対して自動カテゴリ分類機能を実行
    // ========================================
    const classificationResults = feedbackReasonSamples.map((sample) => {
      const result = classifyMealFeedbackReason({
        reason_text: sample.reason_text
      });
      return {
        reason_id: sample.reason_id,
        reason_text: sample.reason_text,
        assigned_category: result.assigned_category,
        confidence_score: result.confidence_score,
        expected_category: sample.expected_category
      };
    });

    // ========================================
    // 3. 分類結果が定義されたカテゴリマスターと一致することを確認
    // ========================================
    const defined_categories = [
      'nutrition_balance',
      'ingredient_unavailability',
      'cooking_time_exceeded',
      'family_preference',
      'budget_constraint',
      'allergy_restriction'
    ];

    classificationResults.forEach((result) => {
      // 分類結果が定義済みカテゴリに含まれることを確認
      expect(defined_categories).toContain(result.assigned_category);

      // 分類結果が期待値と一致することを確認
      expect(result.assigned_category).toBe(result.expected_category);

      // 信頼度スコアが0～100の範囲内であることを確認
      expect(result.confidence_score).toBeGreaterThanOrEqual(0);
      expect(result.confidence_score).toBeLessThanOrEqual(100);
    });

    // ========================================
    // 4. 境界値に該当する理由データ（複数カテゴリに該当する可能性のあるもの）
    //    を入力し、正確に1つのカテゴリに分類されることを検証
    // ========================================
    const boundary_case_1 = classifyMealFeedbackReason({
      reason_text: '高い食材を使うので調理時間も長い'
    });
    expect(['budget_constraint', 'cooking_time_exceeded']).toContain(
      boundary_case_1.assigned_category
    );
    expect(typeof boundary_case_1.assigned_category).toBe('string');
    expect(boundary_case_1.assigned_category.length).toBeGreaterThan(0);

    const boundary_case_2 = classifyMealFeedbackReason({
      reason_text: '子どもが好きなメニューなのに栄養が足りない'
    });
    expect(['nutrition_balance', 'family_preference']).toContain(
      boundary_case_2.assigned_category
    );

    const boundary_case_3 = classifyMealFeedbackReason({
      reason_text: 'アレルギー対応だけど時間がかかる'
    });
    expect(['allergy_restriction', 'cooking_time_exceeded']).toContain(
      boundary_case_3.assigned_category
    );

    // ========================================
    // 5. 未定義のカテゴリに該当する理由データを入力し、
    //    適切なエラーハンドリングまたはデフォルトカテゴリへの
    //    振り分けが行われることを確認
    // ========================================
    const undefined_case = classifyMealFeedbackReason({
      reason_text: 'なんか気に入らないから却下'
    });
    // デフォルトカテゴリまたはエラー処理が実装されている場合
    // 定義済みカテゴリのいずれかに分類されるか、適切な結果が返される
    expect(
      defined_categories.includes(undefined_case.assigned_category) ||
        undefined_case.assigned_category === 'other' ||
        undefined_case.assigned_category === 'unknown'
    ).toBe(true);

    // ========================================
    // 6. 分類結果をダッシュボード表示用に集計し、
    //    UIに正確に反映されることを確認
    // ========================================
    const dashboard_aggregation = classificationResults.reduce(
      (acc, result) => {
        const category = result.assigned_category;
        if (!acc[category]) {
          acc[category] = {
            category_name: category,
            count: 0,
            average_confidence: 0,
            sample_reasons: []
          };
        }
        acc[category].count += 1;
        acc[category].average_confidence =
          (acc[category].average_confidence * (acc[category].count - 1) +
            result.confidence_score) /
          acc[category].count;
        acc[category].sample_reasons.push(result.reason_text);
        return acc;
      },
      {} as Record<
        string,
        {
          category_name: string;
          count: number;
          average_confidence: number;
          sample_reasons: string[];
        }
      >
    );

    // 集計結果が正常に計算されたことを確認
    Object.values(dashboard_aggregation).forEach((category_data) => {
      expect(category_data.count).toBeGreaterThan(0);
      expect(category_data.average_confidence).toBeGreaterThanOrEqual(0);
      expect(category_data.average_confidence).toBeLessThanOrEqual(100);
      expect(Array.isArray(category_data.sample_reasons)).toBe(true);
      expect(category_data.sample_reasons.length).toBe(category_data.count);
    });

    // ========================================
    // 7. 複数回の実行において、同じ入力に対して
    //    同じ分類結果が得られることを確認（一貫性の検証）
    // ========================================
    const consistency_test_reason =
      'タンパク質が足りないから栄養バランスが悪い';
    const consistency_results = [];

    for (let i = 0; i < 5; i++) {
      const result = classifyMealFeedbackReason({
        reason_text: consistency_test_reason
      });
      consistency_results.push({
        iteration: i + 1,
        assigned_category: result.assigned_category,
        confidence_score: result.confidence_score
      });
    }

    // 5回の実行すべてで同じカテゴリに分類されることを確認
    const first_category = consistency_results[0].assigned_category;
    consistency_results.forEach((result) => {
      expect(result.assigned_category).toBe(first_category);
    });

    // 一貫性の検証サマリー
    const all_results_consistent = consistency_results.every(
      (r) => r.assigned_category === first_category
    );
    expect(all_results_consistent).toBe(true);

    // ========================================
    // 8. 最終的な分類結果の統計サマリー
    // ========================================
    const total_reasons_processed = classificationResults.length;
    const correctly_classified = classificationResults.filter(
      (r) => r.assigned_category === r.expected_category
    ).length;
    const classification_accuracy =
      (correctly_classified / total_reasons_processed) * 100;

    expect(total_reasons_processed).toBe(12);
    expect(correctly_classified).toBe(12);
    expect(classification_accuracy).toBe(100);
  });
});