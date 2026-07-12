import { detectConstraintConflict, adjustConstraintPriority } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-509
  test('優先条件競合検証・調整機能 - 予算重視と栄養重視の複数条件が設定された場合、競合を検出して調整可能な順序が決定される', () => {
    // Setup: 複数の優先条件を定義
    const budgetConstraint = {
      type: 'budget',
      maxAmount: 1000,
      priority: 1,
    };

    const nutritionConstraint = {
      type: 'nutrition',
      proteinMin: 30,
      fatMax: 20,
      priority: 2,
    };

    const constraints = [budgetConstraint, nutritionConstraint];

    // ステップ1: 競合検出
    const conflictDetectionResult = detectConstraintConflict({
      constraints: constraints,
      timestamp: new Date('2024-01-15T10:00:00Z'),
    });

    // 競合が検出されることを確認
    expect(conflictDetectionResult.hasConflict).toBe(true);
    expect(conflictDetectionResult.conflictCount).toBe(1);
    expect(conflictDetectionResult.conflictDetails).toEqual([
      {
        type: 'priority_conflict',
        constraintPair: ['budget', 'nutrition'],
        reason: '予算制約と栄養制約は相互依存性が高く、同時最適化が困難',
        severity: 'high',
      },
    ]);

    // ステップ2: 優先順序の自動調整提案
    const adjustmentResult = adjustConstraintPriority({
      constraints: constraints,
      detectedConflict: conflictDetectionResult.conflictDetails[0],
      allocationStrategy: 'auto',
    });

    // 調整案が提案されることを確認
    expect(adjustmentResult.adjusted).toBe(true);
    expect(adjustmentResult.proposedOrder).toEqual(['budget', 'nutrition']);
    expect(adjustmentResult.proposedOrder.length).toBe(2);

    // ステップ3: 調整後の優先度スコア検証
    expect(adjustmentResult.priorityScores).toEqual({
      budget: 10,
      nutrition: 8,
    });
    expect(adjustmentResult.priorityScores.budget > adjustmentResult.priorityScores.nutrition).toBe(true);

    // ステップ4: 手動調整オプション確認
    const manualAdjustmentResult = adjustConstraintPriority({
      constraints: constraints,
      detectedConflict: conflictDetectionResult.conflictDetails[0],
      allocationStrategy: 'manual',
      userProposedOrder: ['nutrition', 'budget'],
    });

    expect(manualAdjustmentResult.adjusted).toBe(true);
    expect(manualAdjustmentResult.proposedOrder).toEqual(['nutrition', 'budget']);
    expect(manualAdjustmentResult.priorityScores).toEqual({
      nutrition: 10,
      budget: 8,
    });

    // ステップ5: 調整結果の整合性検証
    expect(manualAdjustmentResult.isValid).toBe(true);
    expect(manualAdjustmentResult.conflictResolved).toBe(true);
    expect(manualAdjustmentResult.adjustmentReason).toBe(
      'ユーザーが栄養重視を最優先として選択'
    );

    // ステップ6: 競合解決の妥当性判定
    expect(adjustmentResult.canResolveConflict).toBe(true);
    expect(adjustmentResult.resolutionMethod).toBe('sequential_optimization');
    expect(adjustmentResult.fallbackAvailable).toBe(true);

    // ステップ7: タイムスタンプと監査情報
    expect(adjustmentResult.timestamp).toBeDefined();
    expect(adjustmentResult.adjustmentId).toBeDefined();
    expect(typeof adjustmentResult.adjustmentId).toBe('string');
    expect(adjustmentResult.adjustmentId.length > 0).toBe(true);
  });
});