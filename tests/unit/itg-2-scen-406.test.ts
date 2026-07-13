import { calculateConflictPatternScore } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-406
  test('抵触パターン重要度スコア自動算出機能 - 複数の抵触パターンに対して重要度スコア（1-10）とリスク度（低・中・高）が正確に計算される', () => {
    // 抵触パターンデータの準備（3パターン以上）
    const conflictPatterns = [
      {
        patternId: 'conflict_001',
        conflictContent: 'タンパク質不足',
        conflictCount: 2,
        conflictDurationDays: 3,
        relatedNutrientStandardValue: 50,
        actualValue: 35,
        timestamp: new Date('2024-01-15T10:00:00Z'),
      },
      {
        patternId: 'conflict_002',
        conflictContent: 'カルシウム不足',
        conflictCount: 5,
        conflictDurationDays: 7,
        relatedNutrientStandardValue: 800,
        actualValue: 550,
        timestamp: new Date('2024-01-14T10:00:00Z'),
      },
      {
        patternId: 'conflict_003',
        conflictContent: '食物繊維超過',
        conflictCount: 1,
        conflictDurationDays: 1,
        relatedNutrientStandardValue: 25,
        actualValue: 45,
        timestamp: new Date('2024-01-13T10:00:00Z'),
      },
      {
        patternId: 'conflict_004',
        conflictContent: 'ビタミンA不足',
        conflictCount: 8,
        conflictDurationDays: 14,
        relatedNutrientStandardValue: 700,
        actualValue: 400,
        timestamp: new Date('2024-01-12T10:00:00Z'),
      },
    ];

    // 重要度スコア自動算出機能を実行
    const result = calculateConflictPatternScore(conflictPatterns);

    // すべての抵触パターンに対して重要度スコアが1～10の範囲内で計算されていることを確認
    expect(result).toHaveLength(4);
    expect(result[0]).toHaveProperty('patternId', 'conflict_001');
    expect(result[0]).toHaveProperty('importanceScore');
    expect(result[0]).toHaveProperty('riskLevel');

    // パターン1（タンパク質不足）: 抵触回数2回、期間3日 → スコア3（低）
    expect(result[0].importanceScore).toBe(3);
    expect(result[0].riskLevel).toBe('低');

    // パターン2（カルシウム不足）: 抵触回数5回、期間7日 → スコア6（中）
    expect(result[1].importanceScore).toBe(6);
    expect(result[1].riskLevel).toBe('中');

    // パターン3（食物繊維超過）: 抵触回数1回、期間1日 → スコア1（低）
    expect(result[2].importanceScore).toBe(1);
    expect(result[2].riskLevel).toBe('低');

    // パターン4（ビタミンA不足）: 抵触回数8回、期間14日 → スコア9（高）
    expect(result[3].importanceScore).toBe(9);
    expect(result[3].riskLevel).toBe('高');

    // スコア範囲の検証
    result.forEach((pattern) => {
      expect(pattern.importanceScore).toBeGreaterThanOrEqual(1);
      expect(pattern.importanceScore).toBeLessThanOrEqual(10);
    });

    // リスク度の検証
    result.forEach((pattern) => {
      expect(['低', '中', '高']).toContain(pattern.riskLevel);
    });

    // スコア1-3 = 低リスク
    const lowRiskPatterns = result.filter((p) => p.importanceScore >= 1 && p.importanceScore <= 3);
    lowRiskPatterns.forEach((pattern) => {
      expect(pattern.riskLevel).toBe('低');
    });

    // スコア4-6 = 中リスク
    const mediumRiskPatterns = result.filter((p) => p.importanceScore >= 4 && p.importanceScore <= 6);
    mediumRiskPatterns.forEach((pattern) => {
      expect(pattern.riskLevel).toBe('中');
    });

    // スコア7-10 = 高リスク
    const highRiskPatterns = result.filter((p) => p.importanceScore >= 7 && p.importanceScore <= 10);
    highRiskPatterns.forEach((pattern) => {
      expect(pattern.riskLevel).toBe('高');
    });

    // 複数パターン間での相対的な優先順位検証
    // ビタミンA不足（スコア9）> カルシウム不足（スコア6）> タンパク質不足（スコア3）> 食物繊維超過（スコア1）
    expect(result[3].importanceScore).toBeGreaterThan(result[1].importanceScore);
    expect(result[1].importanceScore).toBeGreaterThan(result[0].importanceScore);
    expect(result[0].importanceScore).toBeGreaterThan(result[2].importanceScore);

    // 抵触回数と期間に基づいた優先順位が反映されていることを確認
    // 抵触回数が多く、期間が長いほどスコアが高い
    const scoreByConflictCount = result.map((p) => ({
      patternId: p.patternId,
      score: p.importanceScore,
      count: p.conflictCount,
      duration: p.conflictDurationDays,
    }));

    // パターン4（count: 8, duration: 14）のスコアが最も高い
    expect(scoreByConflictCount[3].score).toBeGreaterThan(scoreByConflictCount[0].score);
    expect(scoreByConflictCount[3].score).toBeGreaterThan(scoreByConflictCount[1].score);

    // 各パターンにオリジナルデータが保持されていることを確認
    expect(result[0]).toMatchObject({
      patternId: 'conflict_001',
      conflictContent: 'タンパク質不足',
    });
    expect(result[3]).toMatchObject({
      patternId: 'conflict_004',
      conflictContent: 'ビタミンA不足',
    });

    // 栄養基準値との乖離度がスコア算出に反映されていることを確認
    // ビタミンA不足（400/700 = 57%）がタンパク質不足（35/50 = 70%）より乖離が大きい
    expect(result[3].importanceScore).toBeGreaterThan(result[0].importanceScore);
  });
});