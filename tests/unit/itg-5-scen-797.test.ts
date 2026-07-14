import { analyzeExternalFactorCorrelation } from '../../src/logic/it-7-2-1';

describe('外部要因相関分析機能 - サンプル数有意性チェック', () => {
  // SCEN-797
  test('サンプル数n=29（最小要件未満）の場合、警告フラグと警告メッセージが付与される', () => {
    const correlationDataset = {
      sampleCount: 29,
      weatherData: Array.from({ length: 29 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        temperature: 15 + Math.random() * 10,
        precipitation: Math.random() * 50,
      })),
      demandData: Array.from({ length: 29 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        demandQuantity: 100 + Math.random() * 50,
      })),
      eventData: Array.from({ length: 29 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        eventType: i % 3 === 0 ? 'sale' : i % 3 === 1 ? 'holiday' : 'normal',
      })),
      competitorData: Array.from({ length: 29 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        campaignActive: i % 2 === 0,
      })),
    };

    const result = analyzeExternalFactorCorrelation(correlationDataset);

    // 警告フラグが付与される
    expect(result.hasWarning).toBe(true);

    // 警告メッセージが正確に表示される
    expect(result.warningMessage).toBe(
      '統計的有意性を確保するにはサンプル数が不足しています（現在：29、最小要件：30）'
    );

    // 警告レベルが'insufficient'に設定される
    expect(result.warningLevel).toBe('insufficient');

    // 分析結果は表示されるが、信頼度フラグが低く設定される
    expect(result.trustworthiness).toBe('limited');
    expect(result.trustworthinessPercentage).toBe(50);

    // 相関分析の計算自体は実施されている（結果オブジェクトが存在）
    expect(result.correlationResults).toBeDefined();
    expect(Array.isArray(result.correlationResults)).toBe(true);

    // 相関結果には最低でも天気・需要・イベント・競合データの相関情報が含まれる
    expect(result.correlationResults.length).toBeGreaterThan(0);
    expect(result.correlationResults.some((r) => r.factorType === 'weather')).toBe(
      true
    );

    // 表示形式フラグが警告状態に設定される
    expect(result.displayFlags).toEqual({
      showWarningBanner: true,
      enableResultDetails: true,
      limitPrecisionDisplay: true,
      highlightUncertainty: true,
    });

    // 分析実行時刻が記録される
    expect(result.analysisTimestamp).toBeDefined();
    expect(typeof result.analysisTimestamp).toBe('string');

    // メタデータに不足サンプル数が記録される
    expect(result.metadata).toBeDefined();
    expect(result.metadata.insufficientSampleCount).toBe(1);
    expect(result.metadata.minimumRequiredSampleCount).toBe(30);
    expect(result.metadata.actualSampleCount).toBe(29);
  });
});