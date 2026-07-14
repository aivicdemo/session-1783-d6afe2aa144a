import { detectAndExcludeMissingValues } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善の定量指標自動集計と効果差検証', () => {
  // SCEN-900: ユーザーデータの欠損値・異常値検出と除外処理
  test('should detect missing values and apply correction or exclusion logic based on percentage thresholds', () => {
    // テストデータセット準備: 総レコード数100件
    const createUserDataset = (missingCount: number) => {
      const dataset = [];
      for (let i = 0; i < 100; i++) {
        if (i < missingCount) {
          dataset.push({
            userId: `user_${i}`,
            menuGenerationSuccessRate: null, // 欠損値
            cookingTimeSavingDegree: 0,
            userSatisfactionScore: 0,
          });
        } else {
          dataset.push({
            userId: `user_${i}`,
            menuGenerationSuccessRate: 85 + Math.random() * 10,
            cookingTimeSavingDegree: 20 + Math.random() * 10,
            userSatisfactionScore: 4.0 + Math.random() * 1.0,
          });
        }
      }
      return dataset;
    };

    // ケース1: 欠損値割合4%（欠損4件）- 除外対象にならない
    const dataset_4percent = createUserDataset(4);
    const result_4percent = detectAndExcludeMissingValues(dataset_4percent);
    expect(result_4percent.missingValuePercentage).toBe(4);
    expect(result_4percent.isExcluded).toBe(false);
    expect(result_4percent.correctionApplied).toBe(false);
    expect(result_4percent.processedRecordCount).toBe(100);

    // ケース2: 欠損値割合5%（欠損5件）- 補正ロジック適用
    const dataset_5percent = createUserDataset(5);
    const result_5percent = detectAndExcludeMissingValues(dataset_5percent);
    expect(result_5percent.missingValuePercentage).toBe(5);
    expect(result_5percent.isExcluded).toBe(false);
    expect(result_5percent.correctionApplied).toBe(true);
    expect(result_5percent.correctionMethod).toBe('mean_imputation');
    expect(result_5percent.processedRecordCount).toBe(95);

    // ケース3: 欠損値割合10%（欠損10件）- 補正ロジック適用
    const dataset_10percent = createUserDataset(10);
    const result_10percent = detectAndExcludeMissingValues(dataset_10percent);
    expect(result_10percent.missingValuePercentage).toBe(10);
    expect(result_10percent.isExcluded).toBe(false);
    expect(result_10percent.correctionApplied).toBe(true);
    expect(result_10percent.correctionMethod).toBe('mean_imputation');
    expect(result_10percent.processedRecordCount).toBe(90);

    // ケース4: 欠損値割合11%（欠損11件）- 除外対象
    const dataset_11percent = createUserDataset(11);
    const result_11percent = detectAndExcludeMissingValues(dataset_11percent);
    expect(result_11percent.missingValuePercentage).toBe(11);
    expect(result_11percent.isExcluded).toBe(true);
    expect(result_11percent.correctionApplied).toBe(false);
    expect(result_11percent.processedRecordCount).toBe(0);
    expect(result_11percent.excludeReason).toBe('missing_value_percentage_exceeds_threshold');

    // 各処理結果のログと処理フラグを検証
    expect(result_4percent.log).toMatch(/4.*percent.*no.*exclusion/i);
    expect(result_5percent.log).toMatch(/5.*percent.*correction.*applied/i);
    expect(result_10percent.log).toMatch(/10.*percent.*correction.*applied/i);
    expect(result_11percent.log).toMatch(/11.*percent.*excluded/i);

    // 処理フラグの確認
    expect(result_4percent.processingFlag).toBe('processed_without_correction');
    expect(result_5percent.processingFlag).toBe('processed_with_correction');
    expect(result_10percent.processingFlag).toBe('processed_with_correction');
    expect(result_11percent.processingFlag).toBe('excluded_due_to_high_missing_rate');
  });
});