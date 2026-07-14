import { determinePriorityForExternalFactors } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案', () => {
  // SCEN-798
  test('相関分析から抽出された外部要因変数について、精度への影響度と実装難易度の2軸で優先度を自動判定し、承認ルーティングが実行される', () => {
    // Arrange: 相関分析から抽出された外部要因変数（3件以上）を準備
    const externalFactorVariables = [
      {
        variableId: 'var_weather_001',
        variableName: '気象データ（気温）',
        correlationCoefficient: 0.78,
        precisionImpactScore: 85,
        implementationDifficultyScore: 25,
      },
      {
        variableId: 'var_event_002',
        variableName: 'イベント情報（セール・キャンペーン）',
        correlationCoefficient: 0.65,
        precisionImpactScore: 72,
        implementationDifficultyScore: 45,
      },
      {
        variableId: 'var_competitor_003',
        variableName: '競合店舗施策',
        correlationCoefficient: 0.58,
        precisionImpactScore: 62,
        implementationDifficultyScore: 68,
      },
      {
        variableId: 'var_holiday_004',
        variableName: '休日・祝日',
        correlationCoefficient: 0.71,
        precisionImpactScore: 79,
        implementationDifficultyScore: 15,
      },
    ];

    // Act: 優先度判定機能を実行
    const priorityResult = determinePriorityForExternalFactors(
      externalFactorVariables
    );

    // Assert: 2軸（精度への影響度と実装難易度）に基づいて優先度が自動計算されたことを確認
    expect(priorityResult).toBeDefined();
    expect(priorityResult.prioritizedVariables).toHaveLength(4);

    // 優先度計算ロジックが正しく適用されているか検証
    // 優先度スコア = 影響度 / (1 + 実装難易度 * 0.01)
    // var_holiday_004: 79 / (1 + 15 * 0.01) = 79 / 1.15 ≈ 68.70 (1位)
    // var_weather_001: 85 / (1 + 25 * 0.01) = 85 / 1.25 = 68.00 (2位)
    // var_event_002: 72 / (1 + 45 * 0.01) = 72 / 1.45 ≈ 49.66 (3位)
    // var_competitor_003: 62 / (1 + 68 * 0.01) = 62 / 1.68 ≈ 36.90 (4位)

    expect(priorityResult.prioritizedVariables[0].variableId).toBe(
      'var_holiday_004'
    );
    expect(priorityResult.prioritizedVariables[0].priorityScore).toBeCloseTo(
      68.7,
      1
    );
    expect(priorityResult.prioritizedVariables[0].priorityRank).toBe(1);

    expect(priorityResult.prioritizedVariables[1].variableId).toBe(
      'var_weather_001'
    );
    expect(priorityResult.prioritizedVariables[1].priorityScore).toBe(68);
    expect(priorityResult.prioritizedVariables[1].priorityRank).toBe(2);

    expect(priorityResult.prioritizedVariables[2].variableId).toBe(
      'var_event_002'
    );
    expect(priorityResult.prioritizedVariables[2].priorityScore).toBeCloseTo(
      49.66,
      1
    );
    expect(priorityResult.prioritizedVariables[2].priorityRank).toBe(3);

    expect(priorityResult.prioritizedVariables[3].variableId).toBe(
      'var_competitor_003'
    );
    expect(priorityResult.prioritizedVariables[3].priorityScore).toBeCloseTo(
      36.9,
      1
    );
    expect(priorityResult.prioritizedVariables[3].priorityRank).toBe(4);

    // 影響度が高く難易度が低い変数が最優先であることを確認
    const topPriorityVariable = priorityResult.prioritizedVariables[0];
    expect(topPriorityVariable.precisionImpactScore).toBeGreaterThanOrEqual(79);
    expect(topPriorityVariable.implementationDifficultyScore).toBeLessThanOrEqual(
      15
    );

    // 優先度判定結果に基づいて承認ルーティング処理が開始されることを確認
    expect(priorityResult.approvalRoutingInitiated).toBe(true);
    expect(priorityResult.routingList).toBeDefined();
    expect(priorityResult.routingList).toHaveLength(4);

    // 承認ルーティングが適切な承認者に割り当てられたことを確認
    // 優先度1位: 最高承認者（Director）
    expect(priorityResult.routingList[0].variableId).toBe('var_holiday_004');
    expect(priorityResult.routingList[0].assignedApprover).toBe('Director');
    expect(priorityResult.routingList[0].approvalLevel).toBe(1);

    // 優先度2位: 高承認者（Senior Manager）
    expect(priorityResult.routingList[1].variableId).toBe('var_weather_001');
    expect(priorityResult.routingList[1].assignedApprover).toBe('Senior Manager');
    expect(priorityResult.routingList[1].approvalLevel).toBe(2);

    // 優先度3位: 中承認者（Manager）
    expect(priorityResult.routingList[2].variableId).toBe('var_event_002');
    expect(priorityResult.routingList[2].assignedApprover).toBe('Manager');
    expect(priorityResult.routingList[2].approvalLevel).toBe(3);

    // 優先度4位: 通常承認者（Lead）
    expect(priorityResult.routingList[3].variableId).toBe('var_competitor_003');
    expect(priorityResult.routingList[3].assignedApprover).toBe('Lead');
    expect(priorityResult.routingList[3].approvalLevel).toBe(4);

    // 承認ルーティングのステータスが正常に遷移することを確認
    expect(priorityResult.routingList[0].routingStatus).toBe('pending');
    expect(priorityResult.routingList[0].routingInitiatedAt).toBeDefined();
    expect(
      new Date(priorityResult.routingList[0].routingInitiatedAt)
    ).toBeInstanceOf(Date);

    expect(priorityResult.routingList[1].routingStatus).toBe('pending');
    expect(priorityResult.routingList[2].routingStatus).toBe('pending');
    expect(priorityResult.routingList[3].routingStatus).toBe('pending');

    // 優先度判定の完全性を検証
    expect(priorityResult.priorityDeterminationCompletedAt).toBeDefined();
    expect(priorityResult.priorityDeterminationStatus).toBe('completed');
    expect(priorityResult.totalVariablesProcessed).toBe(4);
  });
});