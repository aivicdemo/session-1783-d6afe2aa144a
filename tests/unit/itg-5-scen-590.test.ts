import { analyzeExternalDataCorrelation } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案 - 外部データ相関分析機能のエラーハンドリング', () => {
  test('SCEN-590: 外部データソースが不完全または欠損している場合、エラーハンドリングを実施して分析不可を適切に通知できる', () => {
    // 欠損フィールドを含む不完全な外部データソース
    const incompleteExternalDataSource = {
      sourceId: 'weather-api-001',
      sourceType: 'weather',
      dataPoints: [
        {
          date: '2024-01-15',
          temperature: 15.5,
          // humidity が欠損
          precipitation: 2.3,
        },
        {
          date: '2024-01-16',
          temperature: 16.2,
          humidity: 65,
          // precipitation が欠損
        },
      ],
      // lastUpdated フィールドが欠損
    };

    // 正常な外部データソース
    const completeExternalDataSource = {
      sourceId: 'event-info-001',
      sourceType: 'event',
      dataPoints: [
        {
          date: '2024-01-15',
          eventType: 'sale',
          eventName: 'Winter Sale',
          impactScore: 0.85,
        },
      ],
      lastUpdated: '2024-01-15T10:00:00Z',
    };

    // 実績需要データ
    const actualDemandData = {
      demandRecordId: 'demand-001',
      recordDate: '2024-01-15',
      actualQuantity: 250,
      category: 'vegetables',
    };

    // 不完全データソースで分析実行
    const incompleteResult = analyzeExternalDataCorrelation({
      externalDataSource: incompleteExternalDataSource,
      actualDemandData: actualDemandData,
    });

    // エラー通知の確認
    expect(incompleteResult.status).toBe('分析不可');
    expect(incompleteResult.errorNotification).toBeDefined();
    expect(incompleteResult.errorNotification.message).toMatch(/欠損/);
    
    // 欠損フィールド詳細がエラーログに含まれることを確認
    expect(incompleteResult.errorLog).toBeDefined();
    expect(incompleteResult.errorLog.missingFields).toContain('humidity');
    expect(incompleteResult.errorLog.missingFields).toContain('precipitation');
    expect(incompleteResult.errorLog.missingFields).toContain('lastUpdated');
    expect(incompleteResult.errorLog.sourceId).toBe('weather-api-001');
    
    // ダッシュボード表示用通知フォーマット
    expect(incompleteResult.dashboardNotification).toBeDefined();
    expect(incompleteResult.dashboardNotification.displayStatus).toBe('分析不可');
    expect(incompleteResult.dashboardNotification.errorDetail).toMatch(/weather-api-001/);
    
    // 正常なデータソースで分析実行
    const completeResult = analyzeExternalDataCorrelation({
      externalDataSource: completeExternalDataSource,
      actualDemandData: actualDemandData,
    });

    // 正常なデータソースは正常に動作することを確認
    expect(completeResult.status).toBe('成功');
    expect(completeResult.errorNotification).toBeNull();
    expect(completeResult.correlationCoefficient).toBeDefined();
    expect(typeof completeResult.correlationCoefficient).toBe('number');
    expect(completeResult.correlationCoefficient).toBeGreaterThanOrEqual(-1);
    expect(completeResult.correlationCoefficient).toBeLessThanOrEqual(1);
    
    // 他のデータ分析機能が影響を受けないことを確認
    expect(completeResult.analysisTimestamp).toBeDefined();
    expect(completeResult.processedRecordCount).toBe(1);
    expect(completeResult.isSystemHealthy).toBe(true);
  });
});