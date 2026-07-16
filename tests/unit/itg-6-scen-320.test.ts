import { extractAndAnalyzeDisengagementPoints } from '../../src/logic/it-1-br-8-2-2-1';

describe('機能別使用頻度・離脱ポイント自動抽出・分析機能', () => {
  // SCEN-320
  test('同一フロー段階での複数回離脱が全て正確にカウントされる', () => {
    // テストユーザー作成
    const testUserId = 'user-320-001';
    const flowStage = 'stage-1-ingredient-selection';

    // 第1回目の離脱ポイント記録
    const disengagementRecord1 = {
      user_id: testUserId,
      flow_stage: flowStage,
      disengagement_timestamp: new Date('2024-01-15T10:00:00Z'),
      entry_timestamp: new Date('2024-01-15T09:55:00Z'),
      session_id: 'session-001',
    };

    // 第2回目の離脱ポイント記録（ユーザーが再度フローに進入後、離脱）
    const disengagementRecord2 = {
      user_id: testUserId,
      flow_stage: flowStage,
      disengagement_timestamp: new Date('2024-01-15T11:30:00Z'),
      entry_timestamp: new Date('2024-01-15T11:20:00Z'),
      session_id: 'session-002',
    };

    // 第3回目の離脱ポイント記録（ユーザーが再度フローに進入後、離脱）
    const disengagementRecord3 = {
      user_id: testUserId,
      flow_stage: flowStage,
      disengagement_timestamp: new Date('2024-01-15T14:15:00Z'),
      entry_timestamp: new Date('2024-01-15T14:05:00Z'),
      session_id: 'session-003',
    };

    // 機能別使用頻度・離脱ポイント分析実行
    const analysisResult = extractAndAnalyzeDisengagementPoints({
      user_id: testUserId,
      flow_stage: flowStage,
      disengagement_records: [
        disengagementRecord1,
        disengagementRecord2,
        disengagementRecord3,
      ],
    });

    // 期待結果1: 同一フロー段階における離脱ポイント数が正確に3件
    expect(analysisResult.total_disengagement_count).toBe(3);

    // 期待結果2: 各離脱ポイントのユーザーIDが正確に紐付いている
    expect(analysisResult.disengagement_points).toHaveLength(3);
    expect(analysisResult.disengagement_points[0].user_id).toBe(testUserId);
    expect(analysisResult.disengagement_points[1].user_id).toBe(testUserId);
    expect(analysisResult.disengagement_points[2].user_id).toBe(testUserId);

    // 期待結果3: 各離脱ポイントのフロー段階が正確に紐付いている
    expect(analysisResult.disengagement_points[0].flow_stage).toBe(flowStage);
    expect(analysisResult.disengagement_points[1].flow_stage).toBe(flowStage);
    expect(analysisResult.disengagement_points[2].flow_stage).toBe(flowStage);

    // 期待結果4: 各離脱ポイントのタイムスタンプが正確に記録されている
    expect(analysisResult.disengagement_points[0].disengagement_timestamp).toEqual(
      new Date('2024-01-15T10:00:00Z')
    );
    expect(analysisResult.disengagement_points[1].disengagement_timestamp).toEqual(
      new Date('2024-01-15T11:30:00Z')
    );
    expect(analysisResult.disengagement_points[2].disengagement_timestamp).toEqual(
      new Date('2024-01-15T14:15:00Z')
    );

    // 期待結果5: 各離脱ポイントがユニークなセッションIDを持つ
    expect(analysisResult.disengagement_points[0].session_id).toBe('session-001');
    expect(analysisResult.disengagement_points[1].session_id).toBe('session-002');
    expect(analysisResult.disengagement_points[2].session_id).toBe('session-003');

    // 期待結果6: 離脱時間を正確に計算（滞在時間 = 離脱時刻 - 進入時刻）
    const expectedDurationSeconds1 = 5 * 60; // 5分
    const expectedDurationSeconds2 = 10 * 60; // 10分
    const expectedDurationSeconds3 = 10 * 60; // 10分

    expect(analysisResult.disengagement_points[0].duration_seconds).toBe(
      expectedDurationSeconds1
    );
    expect(analysisResult.disengagement_points[1].duration_seconds).toBe(
      expectedDurationSeconds2
    );
    expect(analysisResult.disengagement_points[2].duration_seconds).toBe(
      expectedDurationSeconds3
    );

    // 期待結果7: 分析に使用可能な状態であることを確認（離脱パターン分析用フラグ）
    expect(analysisResult.is_analysis_ready).toBe(true);

    // 期待結果8: 複数回離脱が検出されたことを示すフラグが立つ
    expect(analysisResult.has_multiple_disengagements).toBe(true);

    // 期待結果9: データの完全性（必須フィールドが全て存在）
    analysisResult.disengagement_points.forEach((point) => {
      expect(point).toHaveProperty('user_id');
      expect(point).toHaveProperty('flow_stage');
      expect(point).toHaveProperty('disengagement_timestamp');
      expect(point).toHaveProperty('entry_timestamp');
      expect(point).toHaveProperty('session_id');
      expect(point).toHaveProperty('duration_seconds');
    });
  });
});