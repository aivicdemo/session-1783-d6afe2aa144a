import { aggregateRejectionReasonsReport } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動集約処理', () => {
  // SCEN-903: [edge] 却下修正理由の自動集約処理 - 集約対象期間内に理由データが0件の場合、空の集約レポートが生成され正常終了する
  test('should generate empty aggregation report when no rejection reasons exist in target period', () => {
    // Arrange: 集約対象期間を「2024年1月1日～2024年1月31日」に設定
    const aggregationStartDate = new Date('2024-01-01T00:00:00Z');
    const aggregationEndDate = new Date('2024-01-31T23:59:59Z');

    // Act: 却下修正理由の自動集約処理を実行（空のデータセットに対して）
    const result = aggregateRejectionReasonsReport({
      startDate: aggregationStartDate,
      endDate: aggregationEndDate,
      rejectionReasons: [], // 集約対象期間内に理由データが0件
    });

    // Assert: 戻り値のレポートオブジェクトを確認
    expect(result).toBeDefined();
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('metadata');
    expect(result).toHaveProperty('aggregatedData');
    expect(result).toHaveProperty('processLog');

    // ステータスは「SUCCESS」となることを検証
    expect(result.status).toBe('SUCCESS');

    // レポートのデータ件数を確認（0件）
    expect(result.aggregatedData).toEqual([]);
    expect(result.aggregatedData.length).toBe(0);

    // レポートのメタデータ構造が正常に生成されていることを確認
    expect(result.metadata).toBeDefined();
    expect(result.metadata.aggregationPeriodStart).toEqual(aggregationStartDate);
    expect(result.metadata.aggregationPeriodEnd).toEqual(aggregationEndDate);
    expect(result.metadata.totalRecordsProcessed).toBe(0);
    expect(result.metadata.successCount).toBe(0);
    expect(result.metadata.errorCount).toBe(0);
    expect(result.metadata.generatedAt).toBeDefined();

    // プロセスのログ出力を確認し、エラーが記録されていないことを検証
    expect(result.processLog).toBeDefined();
    expect(Array.isArray(result.processLog)).toBe(true);
    const errorLogs = result.processLog.filter(
      (log: { level: string }) => log.level === 'ERROR'
    );
    expect(errorLogs.length).toBe(0);

    // プロセスログに成功メッセージが含まれることを確認
    const successLogs = result.processLog.filter(
      (log: { level: string }) => log.level === 'INFO'
    );
    expect(successLogs.length).toBeGreaterThan(0);

    // ログにはプロセス開始と終了の記録があることを確認
    expect(result.processLog[0]).toHaveProperty('message');
    expect(result.processLog[0]).toHaveProperty('timestamp');
    expect(result.processLog[0]).toHaveProperty('level');
  });
});