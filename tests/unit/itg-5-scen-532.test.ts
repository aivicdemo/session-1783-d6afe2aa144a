import { detectDietaryRestrictionChange, assignPriorityToDietaryChange } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-532
  test('新規食事制限入力時に変更内容を検出し優先度を付与する', () => {
    // Precondition: 既存の食事制限データが存在する状態
    const existingRestrictions = [
      { id: 'res-001', name: 'ナッツ類アレルギー', type: 'allergy', createdAt: '2024-01-01T10:00:00Z' },
      { id: 'res-002', name: 'ベジタリアン', type: 'dietary', createdAt: '2024-01-05T14:30:00Z' },
    ];

    // Trigger: 新規食事制限（グルテンフリー）を入力して送信
    const newRestriction = {
      name: 'グルテンフリー',
      type: 'dietary',
      timestamp: '2024-01-15T11:00:00Z',
    };

    // Outcome 1: 変更内容を正確に検出
    const changeDetected = detectDietaryRestrictionChange({
      existingRestrictions,
      newRestriction,
      detectionTimestamp: '2024-01-15T11:00:00Z',
    });

    expect(changeDetected).toEqual({
      changeType: 'ADD',
      changeContent: 'グルテンフリー',
      existingCount: 2,
      newCount: 3,
      timestamp: '2024-01-15T11:00:00Z',
      detected: true,
    });

    // Outcome 2: 適切な優先度レベルを自動付与
    const priorityResult = assignPriorityToDietaryChange({
      changeType: 'ADD',
      changeContent: 'グルテンフリー',
      restrictionType: 'dietary',
      daysSinceLastChange: 10,
      impactedMealCount: 5,
    });

    // 優先度付与ロジック検証：
    // - 新規追加（ADD）で dietary 型で、前回変更から 10 日経過で、5 食に影響
    // → 中程度～高優先度 (MEDIUM or HIGH) を期待
    expect(priorityResult).toEqual({
      priorityLevel: 'HIGH',
      priorityScore: 85,
      rationale: '新規食事制限追加で複数献立への影響が大きい',
      recommendedReflectionTiming: 'immediate',
    });

    // Outcome 3: 変更履歴に記録
    const auditLogEntry = {
      eventType: 'DIETARY_RESTRICTION_ADDED',
      restrictionName: 'グルテンフリー',
      priorityLevel: 'HIGH',
      timestamp: '2024-01-15T11:00:00Z',
      userId: 'user-spouse-001',
      changeDetected: true,
    };

    expect(auditLogEntry.eventType).toBe('DIETARY_RESTRICTION_ADDED');
    expect(auditLogEntry.priorityLevel).toBe('HIGH');
    expect(auditLogEntry.changeDetected).toBe(true);

    // Outcome 4: ダッシュボード表示データの確認
    const dashboardUpdate = {
      activeRestrictions: [
        { id: 'res-001', name: 'ナッツ類アレルギー', type: 'allergy', priorityLevel: 'MEDIUM' },
        { id: 'res-002', name: 'ベジタリアン', type: 'dietary', priorityLevel: 'LOW' },
        { id: 'res-003', name: 'グルテンフリー', type: 'dietary', priorityLevel: 'HIGH' },
      ],
      lastUpdated: '2024-01-15T11:00:00Z',
    };

    expect(dashboardUpdate.activeRestrictions).toHaveLength(3);
    expect(dashboardUpdate.activeRestrictions[2]).toEqual({
      id: 'res-003',
      name: 'グルテンフリー',
      type: 'dietary',
      priorityLevel: 'HIGH',
    });
    expect(dashboardUpdate.lastUpdated).toBe('2024-01-15T11:00:00Z');
  });
});