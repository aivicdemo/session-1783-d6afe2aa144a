import { determineTiming } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-546: [normal] 分析タイミング判定機能 - 毎月初日 09:00 に到達したとき月次分析タイミングが判定される
  test('SCEN-546: 毎月初日 09:00 に到達したときに月次分析タイミングが正しく判定される', () => {
    // ===== 初期状態: システム日時を毎月初日 08:59 に設定 =====
    const before_timestamp = new Date('2024-03-01T08:59:00Z');
    
    // 分析タイミング判定機能を実行し、月次分析タイミングが判定されていないことを確認
    const result_before = determineTiming({
      currentDateTime: before_timestamp,
      analysisType: 'monthly'
    });
    expect(result_before.isTimingMet).toBe(false);
    expect(result_before.analysisType).toBe('monthly');
    expect(result_before.targetMonth).toBeNull();
    
    // ===== システム日時を毎月初日 09:00 に進める =====
    const after_timestamp = new Date('2024-03-01T09:00:00Z');
    
    // 分析タイミング判定機能を実行する
    const result_after = determineTiming({
      currentDateTime: after_timestamp,
      analysisType: 'monthly'
    });
    
    // 戻り値からタイミング判定が成功したことを確認
    expect(result_after.isTimingMet).toBe(true);
    expect(result_after.analysisType).toBe('monthly');
    
    // 分析対象の月次データが正しく識別されていることを確認
    // 2024年3月のデータを対象とする
    expect(result_after.targetMonth).toBe('2024-03');
    expect(result_after.targetYear).toBe(2024);
    expect(result_after.targetMonthNumber).toBe(3);
    
    // トリガー条件が満たされたことを確認
    expect(result_after.triggerConditionMet).toBe(true);
    expect(result_after.analysisStartTime).toEqual(after_timestamp);
    expect(result_after.dataCollectionRequired).toBe(true);
  });
});