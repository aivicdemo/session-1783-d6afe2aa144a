import { analyzeFeatureUsageAndDropoffPoints } from '../../src/logic/it-1-br-8-2-2-1';

describe('機能別使用頻度・離脱ポイント自動抽出・分析機能', () => {
  // SCEN-369: [edge] 機能別使用頻度が0件の場合、離脱率スコア計算が正常に完了する
  test('機能別使用頻度が0件の場合、離脱率スコア計算が正常に完了する', () => {
    // arrange: 機能別使用頻度が0件（空配列）の状態を準備
    const emptyFeatureUsageData: Array<{
      featureId: string;
      featureName: string;
      usageCount: number;
      dropoffCount: number;
      segmentId: string;
    }> = [];

    const analysisConfig = {
      segmentId: 'segment_001_professional_househusband',
      analysisStartDate: '2024-01-01',
      analysisEndDate: '2024-03-31',
      dropoffThresholdPercentage: 20,
    };

    // act: 機能別使用頻度データ（0件）を離脱率スコア計算関数に入力
    const result = analyzeFeatureUsageAndDropoffPoints(
      emptyFeatureUsageData,
      analysisConfig
    );

    // assert: 計算処理が実行され、エラーが発生しないことを確認
    expect(result).toBeDefined();

    // assert: 計算結果がオブジェクト型で返却されることを確認
    expect(typeof result).toBe('object');

    // assert: dropoffRateScore が数値型で返却されることを確認
    expect(typeof result.dropoffRateScore).toBe('number');

    // assert: 計算結果が妥当な範囲内の値（0～100）であることを確認
    expect(result.dropoffRateScore).toBeGreaterThanOrEqual(0);
    expect(result.dropoffRateScore).toBeLessThanOrEqual(100);

    // assert: デフォルト値（0またはN/A相当）が返却されることを確認
    expect(result.dropoffRateScore).toBe(0);

    // assert: 機能別使用頻度リストが空配列として返却されることを確認
    expect(Array.isArray(result.featureUsageList)).toBe(true);
    expect(result.featureUsageList.length).toBe(0);

    // assert: 警告フラグがセットされていることを確認
    expect(result.hasWarning).toBe(true);
    expect(result.warningMessage).toMatch(/使用頻度/);

    // assert: 後続処理への影響がない状態（statusが正常）であることを確認
    expect(result.status).toBe('success');

    // assert: 統計情報が正常に計算されていることを確認
    expect(result.totalFeaturesAnalyzed).toBe(0);
    expect(result.averageDropoffRate).toBe(0);
  });
});