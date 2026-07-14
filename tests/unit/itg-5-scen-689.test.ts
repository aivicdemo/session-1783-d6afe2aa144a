import { calculateNextVerificationTiming } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案 - 検証実行タイミング自動決定', () => {
  // SCEN-689
  test('改善提案提出時に次回検証タイミングを即座に再計算する', () => {
    // 初期状態：前回検証実行日が2024-01-08、検証周期が週次（7日）
    const previousVerificationDate = new Date('2024-01-08T00:00:00Z');
    const verificationCycle = 7; // 日単位

    // 改善提案1：優先度高、期待効果大
    const improvementProposal1 = {
      id: 'proposal_001',
      title: 'ユーザー満足度スコア計算ロジック改善',
      description: '満足度スコアに家族成員の完食度をより強く反映させる',
      expectedEffect: 0.8,
      priority: 'high',
      submittedAt: new Date('2024-01-15T09:30:00Z'),
    };

    // 改善提案提出後の次回検証タイミング計算
    // 優先度が高く期待効果が大きい場合、検証周期を短縮（5日に短縮）
    const nextTiming1 = calculateNextVerificationTiming({
      previousVerificationDate,
      improvementProposal: improvementProposal1,
      baseVerificationCycle: verificationCycle,
      currentDate: improvementProposal1.submittedAt,
    });

    // 期待値：提案日時（2024-01-15T09:30:00Z）から5日後 = 2024-01-20T09:30:00Z
    const expected1 = new Date('2024-01-20T09:30:00Z');
    expect(nextTiming1.nextVerificationDate).toEqual(expected1);
    expect(nextTiming1.adjustedCycle).toBe(5);
    expect(nextTiming1.cycleAdjustmentReason).toBe('high_priority_proposal');

    // 改善提案2：優先度中、期待効果中程度
    const improvementProposal2 = {
      id: 'proposal_002',
      title: '調理時間短縮度計算の精密化',
      description: '調理準備時間をより正確に計算する',
      expectedEffect: 0.5,
      priority: 'medium',
      submittedAt: new Date('2024-01-22T14:00:00Z'),
    };

    const nextTiming2 = calculateNextVerificationTiming({
      previousVerificationDate,
      improvementProposal: improvementProposal2,
      baseVerificationCycle: verificationCycle,
      currentDate: improvementProposal2.submittedAt,
    });

    // 期待値：提案日時（2024-01-22T14:00:00Z）から7日後 = 2024-01-29T14:00:00Z（ベース周期）
    const expected2 = new Date('2024-01-29T14:00:00Z');
    expect(nextTiming2.nextVerificationDate).toEqual(expected2);
    expect(nextTiming2.adjustedCycle).toBe(7);
    expect(nextTiming2.cycleAdjustmentReason).toBe('standard_cycle');

    // 改善提案3：優先度低、期待効果小
    const improvementProposal3 = {
      id: 'proposal_003',
      title: '軽微なUI改善',
      description: 'ダッシュボードのレイアウト調整',
      expectedEffect: 0.2,
      priority: 'low',
      submittedAt: new Date('2024-01-25T10:00:00Z'),
    };

    const nextTiming3 = calculateNextVerificationTiming({
      previousVerificationDate,
      improvementProposal: improvementProposal3,
      baseVerificationCycle: verificationCycle,
      currentDate: improvementProposal3.submittedAt,
    });

    // 期待値：提案日時（2024-01-25T10:00:00Z）から10日後 = 2024-02-04T10:00:00Z（周期延長）
    const expected3 = new Date('2024-02-04T10:00:00Z');
    expect(nextTiming3.nextVerificationDate).toEqual(expected3);
    expect(nextTiming3.adjustedCycle).toBe(10);
    expect(nextTiming3.cycleAdjustmentReason).toBe('low_priority_proposal');

    // 複数提案を順序立てて提出し、都度更新を検証
    // 初期提案（優先度高）→ 次回検証日が前倒し
    const sequenceResult1 = calculateNextVerificationTiming({
      previousVerificationDate: new Date('2024-01-01T00:00:00Z'),
      improvementProposal: {
        id: 'seq_001',
        title: '栄養バランス基準の厳格化',
        description: '栄養摂取範囲を±5%に絞る',
        expectedEffect: 0.75,
        priority: 'high',
        submittedAt: new Date('2024-01-08T09:00:00Z'),
      },
      baseVerificationCycle: 7,
      currentDate: new Date('2024-01-08T09:00:00Z'),
    });

    expect(sequenceResult1.nextVerificationDate).toEqual(
      new Date('2024-01-13T09:00:00Z')
    ); // 5日短縮

    // 次の提案（優先度中）→ 前回計算結果を更新
    const sequenceResult2 = calculateNextVerificationTiming({
      previousVerificationDate: new Date('2024-01-01T00:00:00Z'),
      improvementProposal: {
        id: 'seq_002',
        title: '食材制限ロジック最適化',
        description: '食材チェックを並列処理に',
        expectedEffect: 0.45,
        priority: 'medium',
        submittedAt: new Date('2024-01-10T11:30:00Z'),
      },
      baseVerificationCycle: 7,
      currentDate: new Date('2024-01-10T11:30:00Z'),
    });

    expect(sequenceResult2.nextVerificationDate).toEqual(
      new Date('2024-01-17T11:30:00Z')
    ); // 標準7日

    // 最後の提案（優先度高）→ 前回結果を上書き（より短い周期を適用）
    const sequenceResult3 = calculateNextVerificationTiming({
      previousVerificationDate: new Date('2024-01-01T00:00:00Z'),
      improvementProposal: {
        id: 'seq_003',
        title: '献立却下パターン自動分類改善',
        description: '機械学習分類精度を90%以上に',
        expectedEffect: 0.85,
        priority: 'high',
        submittedAt: new Date('2024-01-12T15:45:00Z'),
      },
      baseVerificationCycle: 7,
      currentDate: new Date('2024-01-12T15:45:00Z'),
    });

    expect(sequenceResult3.nextVerificationDate).toEqual(
      new Date('2024-01-17T15:45:00Z')
    ); // 5日周期
    expect(sequenceResult3.adjustedCycle).toBe(5);

    // ダッシュボード表示用の集計結果を検証
    const aggregatedResult = {
      currentVerificationDate: new Date('2024-01-08T00:00:00Z'),
      nextVerificationDate: sequenceResult3.nextVerificationDate,
      proposalCount: 3,
      highPriorityCount: 2,
      mediumPriorityCount: 1,
      averageExpectedEffect: (0.75 + 0.45 + 0.85) / 3, // 0.683...
    };

    expect(aggregatedResult.nextVerificationDate).toEqual(
      new Date('2024-01-17T15:45:00Z')
    );
    expect(aggregatedResult.proposalCount).toBe(3);
    expect(aggregatedResult.highPriorityCount).toBe(2);
    expect(
      Math.round(aggregatedResult.averageExpectedEffect * 1000) / 1000
    ).toBe(0.683);
  });
});