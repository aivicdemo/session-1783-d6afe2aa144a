import { classifyRejectionReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類機能', () => {
  // SCEN-672: 却下修正理由自動カテゴリ分類機能 - 献立却下・修正理由を定義済みカテゴリに自動分類し、分類精度を検証
  test('should classify rejection reasons into predefined categories and calculate precision metrics', () => {
    // 入力: テスト用の献立却下・修正理由データセット（最小10件以上）
    const rejection_reasons_dataset = [
      {
        reason_id: 'r001',
        reason_text: '栄養バランスが悪い。タンパク質が不足している。',
        timestamp: '2024-01-15T10:00:00Z',
      },
      {
        reason_id: 'r002',
        reason_text: '指定した食材が近所のスーパーに在庫がない。',
        timestamp: '2024-01-15T10:05:00Z',
      },
      {
        reason_id: 'r003',
        reason_text: '調理時間が60分では終わらない。もっと簡単な献立をお願いします。',
        timestamp: '2024-01-15T10:10:00Z',
      },
      {
        reason_id: 'r004',
        reason_text: '予算上限3000円を超えている。食材費を削減してほしい。',
        timestamp: '2024-01-15T10:15:00Z',
      },
      {
        reason_id: 'r005',
        reason_text: '子どもが卵アレルギーなのに卵が含まれている。',
        timestamp: '2024-01-15T10:20:00Z',
      },
      {
        reason_id: 'r006',
        reason_text: 'ビタミンC摂取量が目標値以下。野菜をもっと増やしてください。',
        timestamp: '2024-01-15T10:25:00Z',
      },
      {
        reason_id: 'r007',
        reason_text: '特売セール対象外の商品ばかりで割高。割引商品を優先してほしい。',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        reason_id: 'r008',
        reason_text: '加熱調理が30分以上必要で手間がかかりすぎる。',
        timestamp: '2024-01-15T10:35:00Z',
      },
      {
        reason_id: 'r009',
        reason_text: '食物繊維が推奨値を大きく下回っている。',
        timestamp: '2024-01-15T10:40:00Z',
      },
      {
        reason_id: 'r010',
        reason_text: '地元の農家直売所の旬の野菜が活用されていない。',
        timestamp: '2024-01-15T10:45:00Z',
      },
      {
        reason_id: 'r011',
        reason_text: 'カロリーが500kcal超過している。',
        timestamp: '2024-01-15T10:50:00Z',
      },
    ];

    // 実行: 自動分類処理を実行
    const classification_result = classifyRejectionReasons(rejection_reasons_dataset);

    // 期待値の計算:
    // - 定義済みカテゴリ: 栄養, 食材調達, 調理技術, コスト, アレルギー, その他
    // - r001, r006, r009, r011 → 栄養 (4件)
    // - r002, r010 → 食材調達 (2件)
    // - r003, r008 → 調理技術 (2件)
    // - r004, r007 → コスト (2件)
    // - r005 → アレルギー (1件)
    // 合計11件中、正確に分類できたと想定される: 11件
    // 正解率 = 11/11 = 1.0 (100%)
    // 適合率・再現率も各カテゴリで理想値 = 1.0

    // 検証1: 分類結果が存在すること
    expect(classification_result).toBeDefined();

    // 検証2: 各理由が定義済みカテゴリに割り当てられていること
    expect(classification_result.classified_reasons).toHaveLength(11);
    expect(classification_result.classified_reasons[0]).toHaveProperty('reason_id');
    expect(classification_result.classified_reasons[0]).toHaveProperty('assigned_category');
    expect(classification_result.classified_reasons[0]).toHaveProperty('confidence_score');

    // 検証3: 信頼度スコアが 0-1 の範囲内であること
    classification_result.classified_reasons.forEach((item: any) => {
      expect(item.confidence_score).toBeGreaterThanOrEqual(0);
      expect(item.confidence_score).toBeLessThanOrEqual(1);
    });

    // 検証4: カテゴリ分布の検証
    // r001 → 栄養, r002 → 食材調達, r003 → 調理技術, r004 → コスト, r005 → アレルギー,
    // r006 → 栄養, r007 → コスト, r008 → 調理技術, r009 → 栄養, r010 → 食材調達, r011 → 栄養
    const expected_distribution = {
      nutrition: 4,
      food_sourcing: 2,
      cooking_technique: 2,
      cost: 2,
      allergy: 1,
    };

    const actual_distribution: Record<string, number> = {};
    classification_result.classified_reasons.forEach((item: any) => {
      actual_distribution[item.assigned_category] =
        (actual_distribution[item.assigned_category] || 0) + 1;
    });

    // 栄養カテゴリの検証
    expect(actual_distribution['nutrition'] || 0).toBe(expected_distribution.nutrition);
    expect(actual_distribution['food_sourcing'] || 0).toBe(expected_distribution.food_sourcing);
    expect(actual_distribution['cooking_technique'] || 0).toBe(
      expected_distribution.cooking_technique,
    );
    expect(actual_distribution['cost'] || 0).toBe(expected_distribution.cost);
    expect(actual_distribution['allergy'] || 0).toBe(expected_distribution.allergy);

    // 検証5: 分類精度指標の検証
    // 正解率 (accuracy) = 11/11 = 1.0
    // 適合率 (precision) と再現率 (recall) も理想値が 1.0 に近い
    expect(classification_result.precision_metrics).toBeDefined();
    expect(classification_result.precision_metrics.accuracy).toBe(1.0);
    expect(classification_result.precision_metrics.accuracy).toBeGreaterThanOrEqual(0.8); // 閾値 80%

    // 検証6: 精度指標が 0-1 の範囲内であること
    expect(classification_result.precision_metrics.accuracy).toBeGreaterThanOrEqual(0);
    expect(classification_result.precision_metrics.accuracy).toBeLessThanOrEqual(1);

    // 検証7: カテゴリ別精度が提供されていること
    expect(classification_result.precision_metrics.by_category).toBeDefined();
    expect(classification_result.precision_metrics.by_category).toHaveProperty('nutrition');
    expect(classification_result.precision_metrics.by_category).toHaveProperty('food_sourcing');
    expect(classification_result.precision_metrics.by_category).toHaveProperty('cooking_technique');
    expect(classification_result.precision_metrics.by_category).toHaveProperty('cost');
    expect(classification_result.precision_metrics.by_category).toHaveProperty('allergy');

    // 検証8: 各カテゴリの精度が 0-1 の範囲内であること
    Object.values(classification_result.precision_metrics.by_category).forEach((score: any) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    // 検証9: 分類結果の詳細情報にエクスポート用フィールドが含まれていること
    expect(classification_result.export_data).toBeDefined();
    expect(classification_result.export_data).toHaveProperty('timestamp');
    expect(classification_result.export_data).toHaveProperty('total_records_processed');
    expect(classification_result.export_data.total_records_processed).toBe(11);

    // 検証10: エクスポート用データに各理由の詳細情報が含まれていること
    expect(classification_result.export_data.classified_details).toHaveLength(11);
    expect(classification_result.export_data.classified_details[0]).toHaveProperty('reason_id');
    expect(classification_result.export_data.classified_details[0]).toHaveProperty('reason_text');
    expect(classification_result.export_data.classified_details[0]).toHaveProperty(
      'assigned_category',
    );
    expect(classification_result.export_data.classified_details[0]).toHaveProperty(
      'confidence_score',
    );

    // 検証11: 複数回実行の一貫性確認（同じ入力で再度実行）
    const second_execution_result = classifyRejectionReasons(rejection_reasons_dataset);
    expect(second_execution_result.precision_metrics.accuracy).toBe(
      classification_result.precision_metrics.accuracy,
    );
    expect(second_execution_result.classified_reasons).toEqual(
      classification_result.classified_reasons,
    );

    // 検証12: 分類精度が設定閾値 80% 以上を満たすこと
    expect(classification_result.precision_metrics.accuracy).toBeGreaterThanOrEqual(0.8);

    // 検証13: 処理タイムスタンプが ISO 形式であること
    expect(classification_result.export_data.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
    );
  });
});