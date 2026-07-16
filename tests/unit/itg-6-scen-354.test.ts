import { recalculatePriorityMatrix } from '../../src/logic/it-8-1-1-1';

describe('優先度マトリクス再計算機能 - 複数変化要因の同時反映', () => {
  test('SCEN-354: 複数の変化要因が同時に検出されたとき、すべての要因が反映されて再計算される', () => {
    // 初期状態の優先度マトリクス
    const initialMatrix = [
      {
        painFactorId: 'PF001',
        painName: '食材制限',
        frequency: 45,
        impact: 70,
        priorityScore: 3150,
        order: 1,
      },
      {
        painFactorId: 'PF002',
        painName: '調理時間制限',
        frequency: 35,
        impact: 60,
        priorityScore: 2100,
        order: 2,
      },
      {
        painFactorId: 'PF003',
        painName: '予算制約',
        frequency: 25,
        impact: 50,
        priorityScore: 1250,
        order: 3,
      },
    ];

    // 複数の変化要因を同時に準備
    const changeFactors = [
      {
        factorType: 'pain_value_change',
        targetPainId: 'PF001',
        oldFrequency: 45,
        newFrequency: 38,
        oldImpact: 70,
        newImpact: 65,
        timestamp: '2024-01-20T10:00:00Z',
      },
      {
        factorType: 'differentiation_score_update',
        targetPainId: 'PF002',
        oldCompetitorGap: 15,
        newCompetitorGap: 35,
        timestamp: '2024-01-20T10:05:00Z',
      },
      {
        factorType: 'weight_adjustment',
        frequencyWeight: 0.5,
        impactWeight: 0.5,
        previousFrequencyWeight: 0.4,
        previousImpactWeight: 0.6,
        timestamp: '2024-01-20T10:10:00Z',
      },
    ];

    // 3つ以上の変化要因を一度に入力し、再計算処理を実行
    const recalculationResult = recalculatePriorityMatrix({
      currentMatrix: initialMatrix,
      changeFactors: changeFactors,
      recalculationId: 'RECALC-20240120-001',
      executedAt: '2024-01-20T10:15:00Z',
    });

    // マトリクス上の各項目の優先度スコアが再計算されていることを確認
    // PF001: 新優先度 = (38 * 0.5) * (65 * 0.5) = 19 * 32.5 = 617.5
    // PF002: 新優先度 = (35 * 0.5) * (60 * 0.5) * (35/15補正) = 17.5 * 30 * 2.33 = 1227.75 ≈ 1228
    // PF003: 重み適用 = (25 * 0.5) * (50 * 0.5) = 12.5 * 25 = 312.5
    expect(recalculationResult.recalculatedMatrix).toBeDefined();
    expect(recalculationResult.recalculatedMatrix.length).toBe(3);

    // 再計算後の優先度スコアが正確に更新されている
    const recalcPF001 = recalculationResult.recalculatedMatrix.find(
      (item) => item.painFactorId === 'PF001'
    );
    expect(recalcPF001).toBeDefined();
    expect(recalcPF001?.priorityScore).toBe(617.5);

    const recalcPF002 = recalculationResult.recalculatedMatrix.find(
      (item) => item.painFactorId === 'PF002'
    );
    expect(recalcPF002).toBeDefined();
    expect(recalcPF002?.priorityScore).toBeCloseTo(1228, 0);

    const recalcPF003 = recalculationResult.recalculatedMatrix.find(
      (item) => item.painFactorId === 'PF003'
    );
    expect(recalcPF003).toBeDefined();
    expect(recalcPF003?.priorityScore).toBe(312.5);

    // 複数要因の相互作用による優先度変動が正しく計算され、マトリクス全体の順序が期待値と一致
    expect(recalculationResult.recalculatedMatrix[0].painFactorId).toBe('PF002');
    expect(recalculationResult.recalculatedMatrix[0].order).toBe(1);
    expect(recalculationResult.recalculatedMatrix[1].painFactorId).toBe('PF001');
    expect(recalculationResult.recalculatedMatrix[1].order).toBe(2);
    expect(recalculationResult.recalculatedMatrix[2].painFactorId).toBe('PF003');
    expect(recalculationResult.recalculatedMatrix[2].order).toBe(3);

    // ログに各変化要因の処理完了記録が全件記録される
    expect(recalculationResult.processLog).toBeDefined();
    expect(recalculationResult.processLog.length).toBe(3);

    const painValueChangeLog = recalculationResult.processLog.find(
      (log) => log.factorType === 'pain_value_change'
    );
    expect(painValueChangeLog).toBeDefined();
    expect(painValueChangeLog?.status).toBe('completed');
    expect(painValueChangeLog?.targetPainId).toBe('PF001');

    const diffScoreLog = recalculationResult.processLog.find(
      (log) => log.factorType === 'differentiation_score_update'
    );
    expect(diffScoreLog).toBeDefined();
    expect(diffScoreLog?.status).toBe('completed');
    expect(diffScoreLog?.targetPainId).toBe('PF002');

    const weightAdjustLog = recalculationResult.processLog.find(
      (log) => log.factorType === 'weight_adjustment'
    );
    expect(weightAdjustLog).toBeDefined();
    expect(weightAdjustLog?.status).toBe('completed');

    // すべての変化要因が計算ロジックに反映されていることをログ出力から検証
    expect(recalculationResult.processLog.every((log) => log.status === 'completed')).toBe(true);
    expect(recalculationResult.totalFactorsProcessed).toBe(3);

    // 再計算前後の優先度順序が正しく変更されていることを確認
    const orderingChanged = recalculationResult.recalculatedMatrix.some(
      (item) => item.order !== initialMatrix.find((init) => init.painFactorId === item.painFactorId)?.order
    );
    expect(orderingChanged).toBe(true);

    // 複数の変化要因が部分的にのみ反映されていないことを検証
    expect(recalculationResult.partiallyAppliedFactors).toEqual([]);
    expect(recalculationResult.allFactorsFullyApplied).toBe(true);
  });
});