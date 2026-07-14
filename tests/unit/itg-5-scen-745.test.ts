import { judgeAnalysisTimingIt721 } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの週次分析タイミング判定', () => {
  test('SCEN-745: 毎週月曜日09:00に週次分析タイミングが正しく判定される', () => {
    // 現在時刻を毎週月曜日09:00に設定（2024年1月15日は月曜日）
    const current_timestamp = new Date('2024-01-15T09:00:00Z');

    // 分析タイミング判定機能を実行
    const result = judgeAnalysisTimingIt721({
      current_timestamp,
    });

    // 期待値：分析タイプが「週次分析」
    expect(result.analysis_type).toBe('週次分析');

    // 期待値：戻り値のタイムスタンプが月曜日09:00
    expect(result.timestamp).toEqual(new Date('2024-01-15T09:00:00Z'));

    // 期待値：分析実行フラグがtrue
    expect(result.should_execute_analysis).toBe(true);

    // 期待値：次回分析予定時刻が翌週月曜日09:00（2024年1月22日）
    expect(result.next_scheduled_analysis_time).toEqual(
      new Date('2024-01-22T09:00:00Z')
    );
  });
});