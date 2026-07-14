import { describe, test, expect } from '@jest/globals';
import { judgeAlgorithmImprovement } from '../../src/logic/it-7-2-1';

describe('アルゴリズム改善判定機能 - 乖離分析結果の欠損処理', () => {
  // SCEN-756
  test('乖離分析結果が欠損している場合、改善判定がスキップされエラーが返される', () => {
    // 乖離分析結果データを生成し、必須フィールドを意図的にnullに設定
    const divergenceAnalysisResult = {
      analysisId: 'div-20240115-001',
      forecastAccuracy: null, // 必須フィールドを欠損
      actualDemand: 150,
      divergenceRate: 8.5,
      categoryDivergences: [
        {
          categoryId: 'cat-001',
          categoryName: '主菜',
          predictedValue: 50,
          actualValue: 54,
          divergencePercentage: 8.0,
        },
      ],
      analysisTimestamp: new Date('2024-01-15T10:00:00Z'),
      analysisVersion: 'v1.2.1',
    };

    // 改善判定処理を実行
    const result = judgeAlgorithmImprovement(divergenceAnalysisResult);

    // エラーが返されることを検証
    expect(result).toHaveProperty('error');
    expect(result.error).toBe(true);

    // エラーメッセージに「乖離分析結果が欠損」が含まれることを検証
    expect(result.errorMessage).toMatch(/乖離分析結果が欠損/);

    // エラーコードが適切に設定されていることを検証
    expect(result.errorCode).toBe('DIVERGENCE_DATA_MISSING');

    // 改善判定の結果フィールドがnullまたは未設定であることを検証
    expect(result.improvementDecision).toBeNull();
    expect(result.recommendedAction).toBeUndefined();
    expect(result.confidenceScore).toBeUndefined();
  });

  // 追加: undefinedでの欠損ケースも検証
  test('乖離分析結果の必須フィールドがundefinedの場合もエラーが返される', () => {
    const divergenceAnalysisResult = {
      analysisId: 'div-20240115-002',
      forecastAccuracy: undefined, // 必須フィールドをundefinedで欠損
      actualDemand: 150,
      divergenceRate: 8.5,
      categoryDivergences: [],
      analysisTimestamp: new Date('2024-01-15T11:00:00Z'),
      analysisVersion: 'v1.2.1',
    };

    const result = judgeAlgorithmImprovement(divergenceAnalysisResult);

    expect(result.error).toBe(true);
    expect(result.errorMessage).toMatch(/乖離分析結果が欠損/);
    expect(result.errorCode).toBe('DIVERGENCE_DATA_MISSING');
    expect(result.improvementDecision).toBeNull();
  });

  // 追加: 複数の必須フィールド欠損ケース
  test('複数の必須フィールドが欠損している場合、改善判定がスキップされエラーが返される', () => {
    const divergenceAnalysisResult = {
      analysisId: null, // 複数フィールド欠損
      forecastAccuracy: null,
      actualDemand: undefined,
      divergenceRate: 8.5,
      categoryDivergences: null,
      analysisTimestamp: new Date('2024-01-15T12:00:00Z'),
      analysisVersion: 'v1.2.1',
    };

    const result = judgeAlgorithmImprovement(divergenceAnalysisResult);

    expect(result.error).toBe(true);
    expect(result.errorMessage).toMatch(/乖離分析結果が欠損/);
    expect(result.errorCode).toBe('DIVERGENCE_DATA_MISSING');
    expect(result.improvementDecision).toBeNull();
    expect(result.skipReason).toBe('MISSING_REQUIRED_FIELDS');
  });

  // 追加: 正常系での動作確認（欠損がない場合）
  test('乖離分析結果が完全である場合、改善判定が実行される', () => {
    const divergenceAnalysisResult = {
      analysisId: 'div-20240115-003',
      forecastAccuracy: 92.5,
      actualDemand: 150,
      divergenceRate: 6.2,
      categoryDivergences: [
        {
          categoryId: 'cat-001',
          categoryName: '主菜',
          predictedValue: 50,
          actualValue: 51,
          divergencePercentage: 2.0,
        },
        {
          categoryId: 'cat-002',
          categoryName: '副菜',
          predictedValue: 60,
          actualValue: 63,
          divergencePercentage: 5.0,
        },
      ],
      analysisTimestamp: new Date('2024-01-15T13:00:00Z'),
      analysisVersion: 'v1.2.1',
    };

    const result = judgeAlgorithmImprovement(divergenceAnalysisResult);

    expect(result.error).toBe(false);
    expect(result.improvementDecision).not.toBeNull();
    expect(result.recommendedAction).toBeDefined();
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(100);
  });
});