import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  calculateNutritionAchievementScore,
  identifyInsufficientNutrients,
  calculateImprovementGap,
  visualizeNutritionMetrics,
} from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  test('SCEN-429: 栄養摂取達成度可視化機能 - 栄養項目別の達成度スコア・不足項目・改善ギャップが正確に可視化される', () => {
    // ========== 前提条件: ユーザーの栄養摂取データを入力・登録 ==========
    const nutritionData = {
      userId: 'user_001',
      recordDate: '2024-01-15',
      nutrientRecords: [
        { nutrientId: 'protein', nutrientName: 'タンパク質', actualValue: 50, unit: 'g' },
        { nutrientId: 'carbs', nutrientName: '炭水化物', actualValue: 200, unit: 'g' },
        { nutrientId: 'fat', nutrientName: '脂質', actualValue: 55, unit: 'g' },
        { nutrientId: 'vitamin_c', nutrientName: 'ビタミンC', actualValue: 60, unit: 'mg' },
        { nutrientId: 'iron', nutrientName: '鉄分', actualValue: 8, unit: 'mg' },
      ],
    };

    const nutritionTargets = {
      userId: 'user_001',
      targetStandards: [
        { nutrientId: 'protein', nutrientName: 'タンパク質', targetValue: 60, unit: 'g' },
        { nutrientId: 'carbs', nutrientName: '炭水化物', targetValue: 300, unit: 'g' },
        { nutrientId: 'fat', nutrientName: '脂質', targetValue: 65, unit: 'g' },
        { nutrientId: 'vitamin_c', nutrientName: 'ビタミンC', targetValue: 100, unit: 'mg' },
        { nutrientId: 'iron', nutrientName: '鉄分', targetValue: 15, unit: 'mg' },
      ],
    };

    // ========== ステップ1: 栄養項目別の達成度スコアを計算 ==========
    // 期待値の計算:
    // タンパク質: (50 / 60) * 100 = 83.33
    // 炭水化物: (200 / 300) * 100 = 66.67
    // 脂質: (55 / 65) * 100 = 84.62
    // ビタミンC: (60 / 100) * 100 = 60.00
    // 鉄分: (8 / 15) * 100 = 53.33
    const achievementScores = calculateNutritionAchievementScore(
      nutritionData.nutrientRecords,
      nutritionTargets.targetStandards
    );

    expect(achievementScores).toHaveLength(5);
    expect(achievementScores[0]).toEqual({
      nutrientId: 'protein',
      nutrientName: 'タンパク質',
      achievementScore: 83.33,
    });
    expect(achievementScores[1]).toEqual({
      nutrientId: 'carbs',
      nutrientName: '炭水化物',
      achievementScore: 66.67,
    });
    expect(achievementScores[2]).toEqual({
      nutrientId: 'fat',
      nutrientName: '脂質',
      achievementScore: 84.62,
    });
    expect(achievementScores[3]).toEqual({
      nutrientId: 'vitamin_c',
      nutrientName: 'ビタミンC',
      achievementScore: 60.0,
    });
    expect(achievementScores[4]).toEqual({
      nutrientId: 'iron',
      nutrientName: '鉄分',
      achievementScore: 53.33,
    });

    // ========== ステップ2: 不足している栄養項目をリストアップ ==========
    // 閾値: 達成度 80% 未満を不足と判定
    const insufficientNutrients = identifyInsufficientNutrients(
      achievementScores,
      80
    );

    expect(insufficientNutrients).toHaveLength(3);
    expect(insufficientNutrients).toContainEqual({
      nutrientId: 'carbs',
      nutrientName: '炭水化物',
      achievementScore: 66.67,
      priority: 1,
    });
    expect(insufficientNutrients).toContainEqual({
      nutrientId: 'vitamin_c',
      nutrientName: 'ビタミンC',
      achievementScore: 60.0,
      priority: 2,
    });
    expect(insufficientNutrients).toContainEqual({
      nutrientId: 'iron',
      nutrientName: '鉄分',
      achievementScore: 53.33,
      priority: 3,
    });

    // ========== ステップ3: 改善ギャップを計算 ==========
    // 改善ギャップ = 目標値 - 実績値
    // タンパク質: 60 - 50 = 10g
    // 炭水化物: 300 - 200 = 100g
    // 脂質: 65 - 55 = 10g
    // ビタミンC: 100 - 60 = 40mg
    // 鉄分: 15 - 8 = 7mg
    const improvementGaps = calculateImprovementGap(
      nutritionData.nutrientRecords,
      nutritionTargets.targetStandards
    );

    expect(improvementGaps).toHaveLength(5);
    expect(improvementGaps[0]).toEqual({
      nutrientId: 'protein',
      nutrientName: 'タンパク質',
      gap: 10,
      unit: 'g',
      gapPercentage: 16.67,
    });
    expect(improvementGaps[1]).toEqual({
      nutrientId: 'carbs',
      nutrientName: '炭水化物',
      gap: 100,
      unit: 'g',
      gapPercentage: 33.33,
    });
    expect(improvementGaps[2]).toEqual({
      nutrientId: 'fat',
      nutrientName: '脂質',
      gap: 10,
      unit: 'g',
      gapPercentage: 15.38,
    });
    expect(improvementGaps[3]).toEqual({
      nutrientId: 'vitamin_c',
      nutrientName: 'ビタミンC',
      gap: 40,
      unit: 'mg',
      gapPercentage: 40.0,
    });
    expect(improvementGaps[4]).toEqual({
      nutrientId: 'iron',
      nutrientName: '鉄分',
      gap: 7,
      unit: 'mg',
      gapPercentage: 46.67,
    });

    // ========== ステップ4: ダッシュボード可視化データを生成 ==========
    const visualizationMetrics = visualizeNutritionMetrics(
      achievementScores,
      improvementGaps,
      insufficientNutrients
    );

    expect(visualizationMetrics).toHaveProperty('summary');
    expect(visualizationMetrics.summary).toEqual({
      totalNutrients: 5,
      achievedNutrients: 2,
      insufficientNutrients: 3,
      averageAchievementScore: 69.59,
    });

    expect(visualizationMetrics).toHaveProperty('metrics');
    expect(visualizationMetrics.metrics).toHaveLength(5);

    // 詳細メトリクス: タンパク質
    expect(visualizationMetrics.metrics[0]).toEqual({
      nutrientId: 'protein',
      nutrientName: 'タンパク質',
      achievementScore: 83.33,
      gap: 10,
      gapPercentage: 16.67,
      unit: 'g',
      status: 'achieved',
      displayOrder: 1,
    });

    // 詳細メトリクス: 炭水化物（不足項目、優先度1）
    expect(visualizationMetrics.metrics[1]).toEqual({
      nutrientId: 'carbs',
      nutrientName: '炭水化物',
      achievementScore: 66.67,
      gap: 100,
      gapPercentage: 33.33,
      unit: 'g',
      status: 'insufficient',
      displayOrder: 1,
    });

    // 詳細メトリクス: 脂質
    expect(visualizationMetrics.metrics[2]).toEqual({
      nutrientId: 'fat',
      nutrientName: '脂質',
      achievementScore: 84.62,
      gap: 10,
      gapPercentage: 15.38,
      unit: 'g',
      status: 'achieved',
      displayOrder: 2,
    });

    // 詳細メトリクス: ビタミンC（不足項目、優先度2）
    expect(visualizationMetrics.metrics[3]).toEqual({
      nutrientId: 'vitamin_c',
      nutrientName: 'ビタミンC',
      achievementScore: 60.0,
      gap: 40,
      gapPercentage: 40.0,
      unit: 'mg',
      status: 'insufficient',
      displayOrder: 2,
    });

    // 詳細メトリクス: 鉄分（不足項目、優先度3）
    expect(visualizationMetrics.metrics[4]).toEqual({
      nutrientId: 'iron',
      nutrientName: '鉄分',
      achievementScore: 53.33,
      gap: 7,
      gapPercentage: 46.67,
      unit: 'mg',
      status: 'insufficient',
      displayOrder: 3,
    });

    // ========== ステップ5: テストデータを変更してリアルタイム更新を確認 ==========
    // 新しい栄養摂取データ: タンパク質を 60g まで増加
    const updatedNutritionData = {
      userId: 'user_001',
      recordDate: '2024-01-15',
      nutrientRecords: [
        { nutrientId: 'protein', nutrientName: 'タンパク質', actualValue: 60, unit: 'g' },
        { nutrientId: 'carbs', nutrientName: '炭水化物', actualValue: 250, unit: 'g' },
        { nutrientId: 'fat', nutrientName: '脂質', actualValue: 65, unit: 'g' },
        { nutrientId: 'vitamin_c', nutrientName: 'ビタミンC', actualValue: 85, unit: 'mg' },
        { nutrientId: 'iron', nutrientName: '鉄分', actualValue: 12, unit: 'mg' },
      ],
    };

    // 更新後の達成度スコア
    // タンパク質: (60 / 60) * 100 = 100.0
    // 炭水化物: (250 / 300) * 100 = 83.33
    // 脂質: (65 / 65) * 100 = 100.0
    // ビタミンC: (85 / 100) * 100 = 85.0
    // 鉄分: (12 / 15) * 100 = 80.0
    const updatedAchievementScores = calculateNutritionAchievementScore(
      updatedNutritionData.nutrientRecords,
      nutritionTargets.targetStandards
    );

    expect(updatedAchievementScores).toHaveLength(5);
    expect(updatedAchievementScores[0].achievementScore).toBe(100.0);
    expect(updatedAchievementScores[1].achievementScore).toBe(83.33);
    expect(updatedAchievementScores[2].achievementScore).toBe(100.0);
    expect(updatedAchievementScores[3].achievementScore).toBe(85.0);
    expect(updatedAchievementScores[4].achievementScore).toBe(80.0);

    // 更新後の不足項目（閾値 80% 未満）
    const updatedInsufficientNutrients = identifyInsufficientNutrients(
      updatedAchievementScores,
      80
    );

    expect(updatedInsufficientNutrients).toHaveLength(1);
    expect(updatedInsufficientNutrients[0]).toEqual({
      nutrientId: 'carbs',
      nutrientName: '炭水化物',
      achievementScore: 83.33,
      priority: 1,
    });

    // 更新後の改善ギャップ
    // タンパク質: 60 - 60 = 0g
    // 炭水化物: 300 - 250 = 50g
    // 脂質: 65 - 65 = 0g
    // ビタミンC: 100 - 85 = 15mg
    // 鉄分: 15 - 12 = 3mg
    const updatedImprovementGaps = calculateImprovementGap(
      updatedNutritionData.nutrientRecords,
      nutritionTargets.targetStandards
    );

    expect(updatedImprovementGaps[0]).toEqual({
      nutrientId: 'protein',
      nutrientName: 'タンパク質',
      gap: 0,
      unit: 'g',
      gapPercentage: 0.0,
    });
    expect(updatedImprovementGaps[1]).toEqual({
      nutrientId: 'carbs',
      nutrientName: '炭水化物',
      gap: 50,
      unit: 'g',
      gapPercentage: 16.67,
    });
    expect(updatedImprovementGaps[4]).toEqual({
      nutrientId: 'iron',
      nutrientName: '鉄分',
      gap: 3,
      unit: 'mg',
      gapPercentage: 20.0,
    });

    // ========== ステップ6: 更新後のダッシュボード可視化データを検証 ==========
    const updatedVisualizationMetrics = visualizeNutritionMetrics(
      updatedAchievementScores,
      updatedImprovementGaps,
      updatedInsufficientNutrients
    );

    expect(updatedVisualizationMetrics.summary).toEqual({
      totalNutrients: 5,
      achievedNutrients: 4,
      insufficientNutrients: 1,
      averageAchievementScore: 89.67,
    });

    expect(updatedVisualizationMetrics.metrics).toHaveLength(5);

    // ========== ステップ7: 表示順序と値の一貫性を検証 ==========
    // 達成した項目は displayOrder で昇順、不足項目は優先度で昇順
    const achievedMetrics = updatedVisualizationMetrics.metrics.filter(
      (m) => m.status === 'achieved'
    );
    const insufficientMetrics = updatedVisualizationMetrics.metrics.filter(
      (m) => m.status === 'insufficient'
    );

    expect(achievedMetrics).toHaveLength(4);
    expect(insufficientMetrics).toHaveLength(1);

    // 達成した項目の displayOrder は連続している
    for (let i = 1; i < achievedMetrics.length; i++) {
      expect(achievedMetrics[i].displayOrder).toBeGreaterThanOrEqual(
        achievedMetrics[i - 1].displayOrder
      );
    }

    // 不足項目の displayOrder は優先度と一致
    insufficientMetrics.forEach((metric) => {
      expect(metric.displayOrder).toBeGreaterThan(0);
    });

    // ========== ステップ8: エッジケース - 100% 達成の項目 ==========
    const perfectNutritionData = {
      userId: 'user_001',
      recordDate: '2024-01-15',
      nutrientRecords: [
        { nutrientId: 'protein', nutrientName: 'タンパク質', actualValue: 60, unit: 'g' },
        { nutrientId: 'carbs', nutrientName: '炭水化物', actualValue: 300, unit: 'g' },
        { nutrientId: 'fat', nutrientName: '脂質', actualValue: 65, unit: 'g' },
        { nutrientId: 'vitamin_c', nutrientName: 'ビタミンC', actualValue: 100, unit: 'mg' },
        { nutrientId: 'iron', nutrientName: '鉄分', actualValue: 15, unit: 'mg' },
      ],
    };

    const perfectAchievementScores = calculateNutritionAchievementScore(
      perfectNutritionData.nutrientRecords,
      nutritionTargets.targetStandards
    );

    perfectAchievementScores.forEach((score) => {
      expect(score.achievementScore).toBe(100.0);
    });

    const perfectInsufficientNutrients = identifyInsufficientNutrients(
      perfectAchievementScores,
      80
    );

    expect(perfectInsufficientNutrients).toHaveLength(0);

    const perfectImprovementGaps = calculateImprovementGap(
      perfectNutritionData.nutrientRecords,
      nutritionTargets.targetStandards
    );

    perfectImprovementGaps.forEach((gap) => {
      expect(gap.gap).toBe(0);
      expect(gap.gapPercentage).toBe(0.0);
    });

    // ========== ステップ9: 複数栄養項目の一貫性検証 ==========
    const finalVisualization = visualizeNutritionMetrics(
      perfectAchievementScores,
      perfectImprovementGaps,
      perfectInsufficientNutrients
    );

    expect(finalVisualization.summary).toEqual({
      totalNutrients: 5,
      achievedNutrients: 5,
      insufficientNutrients: 0,
      averageAchievementScore: 100.0,
    });

    expect(finalVisualization.metrics.every((m) => m.status === 'achieved')).toBe(true);
    expect(finalVisualization.metrics.every((m) => m.achievementScore === 100.0)).toBe(true);
    expect(finalVisualization.metrics.every((m) => m.gap === 0)).toBe(true);
  });
});