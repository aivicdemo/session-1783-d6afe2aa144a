import { describe, test, expect, beforeEach } from '@jest/globals';
import { validateMonthlyDemandForecastFlow } from '../../src/logic/it-7-2-1';

describe('月次需要予測検証フロー自動実行機能 - データ品質基準検証', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  // SCEN-803: 欠損率が5%以上のデータで月次需要予測検証フロー中断と改善処置記録
  test('SCEN-803: 欠損率5%以上時に検証フローが中断され、中断ログと改善処置が記録される', async () => {
    // 【テストデータ準備】
    // 欠損率 6% のデータセット（100行中6行が欠損）
    const totalRecords = 100;
    const missingRecords = 6;
    const missingRatePercent = (missingRecords / totalRecords) * 100; // 6%
    const dataQualityThreshold = 5;

    const mockForecastData = {
      datasetId: 'forecast_2024_12_monthly',
      totalRecords: totalRecords,
      missingRecords: missingRecords,
      missingRate: missingRatePercent,
      collectionPeriod: {
        startDate: '2024-12-01',
        endDate: '2024-12-31',
      },
      records: Array.from({ length: totalRecords - missingRecords }, (_, i) => ({
        recordId: `rec_${i + 1}`,
        date: `2024-12-${String((i % 30) + 1).padStart(2, '0')}`,
        demandQty: Math.floor(Math.random() * 500) + 100,
        actualSales: Math.floor(Math.random() * 480) + 120,
      })),
    };

    // 【月次需要予測検証フロー自動実行機能の起動】
    const flowInput = {
      verificationMonth: '2024-12',
      dataQualityThresholdPercent: dataQualityThreshold,
      autoExecuteEnabled: true,
      forecastDataSource: mockForecastData,
    };

    // フロー実行結果
    const result = await validateMonthlyDemandForecastFlow(flowInput);

    // 【データ品質チェック処理実行 → 欠損率検証】
    // 期待: 欠損率 6% > 閾値 5% なので検証が中断される
    expect(result.flowStatus).toBe('HALTED');
    expect(result.haltReason).toBe('DATA_QUALITY_FAILURE');
    expect(result.dataQualityMetrics.missingRate).toBe(6);
    expect(result.dataQualityMetrics.missingRate).toBeGreaterThan(
      dataQualityThreshold,
    );

    // 【検証フロー中断ログの記録確認】
    expect(result.haltLog).toBeDefined();
    expect(result.haltLog.severity).toBe('ERROR');
    expect(result.haltLog.code).toBe('DQ_MISSING_RATE_EXCEEDED');
    expect(result.haltLog.timestamp).toBe('2024-12-31T23:59:59Z');
    expect(result.haltLog.stepName).toBe('DATA_QUALITY_CHECK');

    // 【改善処置推奨内容の生成確認】
    expect(result.remediationActions).toBeDefined();
    expect(result.remediationActions.length).toBeGreaterThan(0);

    const cleaningAction = result.remediationActions.find(
      (action) => action.actionType === 'DATA_CLEANING',
    );
    expect(cleaningAction).toBeDefined();
    expect(cleaningAction?.priority).toBe('HIGH');
    expect(cleaningAction?.description).toContain('Remove');

    const completionAction = result.remediationActions.find(
      (action) => action.actionType === 'DATA_COMPLETION',
    );
    expect(completionAction).toBeDefined();
    expect(completionAction?.priority).toBe('MEDIUM');

    // 【改善処置記録の保存確認】
    expect(result.remediationRecordId).toBeDefined();
    expect(result.remediationRecordId).toMatch(/^rem_\d+_2024_12$/);
    expect(result.recordedAt).toBe('2024-12-31T23:59:59Z');

    // 【ダッシュボード表示用の詳細情報確認】
    expect(result.dashboardDisplay).toBeDefined();
    expect(result.dashboardDisplay.statusBadge).toBe('HALTED');
    expect(result.dashboardDisplay.statusColor).toBe('red');
    expect(result.dashboardDisplay.haltMessage).toContain('中断');
    expect(result.dashboardDisplay.remediationSummary).toBeDefined();
    expect(result.dashboardDisplay.remediationSummary.totalActions).toBe(2);
    expect(result.dashboardDisplay.remediationSummary.estimatedResolutionDays).toBe(
      3,
    );

    // 【欠損率5%未満での検証継続確認（反例）】
    const goodDataInput = {
      verificationMonth: '2024-12',
      dataQualityThresholdPercent: dataQualityThreshold,
      autoExecuteEnabled: true,
      forecastDataSource: {
        ...mockForecastData,
        missingRecords: 4, // 4% (100中4行が欠損)
        missingRate: 4,
      },
    };

    const goodDataResult =
      await validateMonthlyDemandForecastFlow(goodDataInput);
    expect(goodDataResult.flowStatus).toBe('PASSED');
    expect(goodDataResult.dataQualityMetrics.missingRate).toBe(4);
    expect(goodDataResult.dataQualityMetrics.missingRate).toBeLessThanOrEqual(
      dataQualityThreshold,
    );
  });
});