import { calculateTrustworthyScore } from '../../src/logic/it-1-br-2-1-1-1';

describe('食費実績データの信頼性スコア算出機能', () => {
  // SCEN-450
  test('複数ソースから集約されたデータに対して信頼性スコアが正しく計算される', () => {
    // 3つの異なるソースから集約された食費実績データを準備
    const aggregated_expense_data = {
      date: '2024-01-15',
      category: '野菜',
      amount_jpy: 1500,
      sources: [
        {
          source_type: 'POS_SYSTEM',
          weight: 0.9,
          recorded_amount_jpy: 1500,
          timestamp: '2024-01-15T10:30:00Z'
        },
        {
          source_type: 'RECEIPT_OCR',
          weight: 0.7,
          recorded_amount_jpy: 1500,
          timestamp: '2024-01-15T10:35:00Z'
        },
        {
          source_type: 'MANUAL_INPUT',
          weight: 0.5,
          recorded_amount_jpy: 1500,
          timestamp: '2024-01-15T11:00:00Z'
        }
      ]
    };

    // 信頼性スコア算出関数を実行
    const trustworthy_score = calculateTrustworthyScore(aggregated_expense_data);

    // 算出された信頼性スコアが0～100の範囲内であることを検証
    expect(trustworthy_score).toBeGreaterThanOrEqual(0);
    expect(trustworthy_score).toBeLessThanOrEqual(100);

    // ウェイト計算の期待値を検証
    // 各ソースのウェイト合計: 0.9 + 0.7 + 0.5 = 2.1
    // 加重平均: (0.9 + 0.7 + 0.5) / 3 = 0.7 → 70スコア
    // 複数ソースの合致（3つすべてが同一金額）により加算
    // 期待値: 70 + (3 - 1) * 5 = 80
    expect(trustworthy_score).toBe(80);

    // 複数ソースが同一データを示している場合、スコアが上昇することを検証
    expect(trustworthy_score).toBeGreaterThan(70);

    // データのメタデータが正しく適用されることを確認
    expect(aggregated_expense_data.date).toBe('2024-01-15');
    expect(aggregated_expense_data.category).toBe('野菜');
    expect(aggregated_expense_data.amount_jpy).toBe(1500);

    // 算出された信頼性スコアが定義された信頼性レベルに適切に分類されることを検証
    // 信頼性レベル基準: 70以上は信頼性高
    const trustworthiness_level = trustworthy_score >= 70 ? 'HIGH' : 'LOW';
    expect(trustworthiness_level).toBe('HIGH');
  });

  // ソース間でデータが異なる場合、信頼性スコアが低下することを検証
  test('複数ソースのデータが異なる場合、信頼性スコアが低下する', () => {
    const aggregated_expense_data_divergent = {
      date: '2024-01-16',
      category: '肉類',
      amount_jpy: 2500,
      sources: [
        {
          source_type: 'POS_SYSTEM',
          weight: 0.9,
          recorded_amount_jpy: 2500,
          timestamp: '2024-01-16T14:20:00Z'
        },
        {
          source_type: 'RECEIPT_OCR',
          weight: 0.7,
          recorded_amount_jpy: 2400,
          timestamp: '2024-01-16T14:25:00Z'
        },
        {
          source_type: 'MANUAL_INPUT',
          weight: 0.5,
          recorded_amount_jpy: 2600,
          timestamp: '2024-01-16T14:45:00Z'
        }
      ]
    };

    const trustworthy_score_divergent = calculateTrustworthyScore(aggregated_expense_data_divergent);

    // ウェイト合計: 0.9 + 0.7 + 0.5 = 2.1
    // 加重平均: 2.1 / 3 = 0.7 → 70スコア
    // 複数ソースの不合致により減算
    // 期待値: 70 - (3 - 1) * 5 = 60
    expect(trustworthy_score_divergent).toBe(60);

    // スコアが定義された信頼性レベル基準（70以上）未満であることを検証
    const trustworthiness_level_divergent = trustworthy_score_divergent >= 70 ? 'HIGH' : 'LOW';
    expect(trustworthiness_level_divergent).toBe('LOW');
  });

  // 単一ソースのみの場合、信頼性スコアが正しく計算されることを検証
  test('単一ソースのデータから信頼性スコアが正しく計算される', () => {
    const aggregated_expense_data_single = {
      date: '2024-01-17',
      category: '乳製品',
      amount_jpy: 800,
      sources: [
        {
          source_type: 'POS_SYSTEM',
          weight: 0.9,
          recorded_amount_jpy: 800,
          timestamp: '2024-01-17T09:15:00Z'
        }
      ]
    };

    const trustworthy_score_single = calculateTrustworthyScore(aggregated_expense_data_single);

    // 単一ソースの場合、ウェイトがそのままスコアに反映
    // 期待値: 0.9 * 100 = 90
    expect(trustworthy_score_single).toBe(90);

    // スコアが定義された信頼性レベル基準（70以上）以上であることを検証
    const trustworthiness_level_single = trustworthy_score_single >= 70 ? 'HIGH' : 'LOW';
    expect(trustworthiness_level_single).toBe('HIGH');
  });

  // 低ウェイトのソースが複数の場合、スコアが基準未満になることを検証
  test('低ウェイトソースのみの場合、信頼性スコアが基準未満となる', () => {
    const aggregated_expense_data_low_weight = {
      date: '2024-01-18',
      category: '調味料',
      amount_jpy: 600,
      sources: [
        {
          source_type: 'MANUAL_INPUT',
          weight: 0.5,
          recorded_amount_jpy: 600,
          timestamp: '2024-01-18T15:45:00Z'
        },
        {
          source_type: 'MANUAL_INPUT',
          weight: 0.5,
          recorded_amount_jpy: 600,
          timestamp: '2024-01-18T16:00:00Z'
        }
      ]
    };

    const trustworthy_score_low_weight = calculateTrustworthyScore(aggregated_expense_data_low_weight);

    // ウェイト合計: 0.5 + 0.5 = 1.0
    // 加重平均: 1.0 / 2 = 0.5 → 50スコア
    // 複数ソースの合致により加算
    // 期待値: 50 + (2 - 1) * 5 = 55
    expect(trustworthy_score_low_weight).toBe(55);

    // スコアが定義された信頼性レベル基準（70以上）未満であることを検証
    const trustworthiness_level_low_weight = trustworthy_score_low_weight >= 70 ? 'HIGH' : 'LOW';
    expect(trustworthiness_level_low_weight).toBe('LOW');
  });
});