import { describe, test, expect } from '@jest/globals';
import {
  evaluateNutritionStandardValidity,
} from '../../src/logic/it-1-br-2-1-1-1';

describe('SCEN-513: 栄養基準設定の有効性判定と改善項目の可視化', () => {
  test('栄養基準設定の有効性が判定され、改善が必要な栄養項目が優先度順に可視化される', () => {
    // ===== 入力データの準備 =====
    // ユーザー: 家族構成により栄養基準が設定済み
    // 実績摂取データ: 1週間の食事記録から集計された栄養素別摂取量
    // 基準値: 栄養士により設定された推奨値

    const nutritionStandardInput = {
      userId: 'user_001',
      familyMemberId: 'fam_001',
      evaluationPeriod: {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      },
      standardValues: {
        protein: { recommendedMin: 50, recommendedMax: 70, unit: 'g' },
        carbohydrate: { recommendedMin: 250, recommendedMax: 350, unit: 'g' },
        fat: { recommendedMin: 50, recommendedMax: 80, unit: 'g' },
        calcium: { recommendedMin: 600, recommendedMax: 800, unit: 'mg' },
        iron: { recommendedMin: 8, recommendedMax: 12, unit: 'mg' },
        vitaminA: { recommendedMin: 700, recommendedMax: 900, unit: 'μg' },
        vitaminC: { recommendedMin: 100, recommendedMax: 150, unit: 'mg' },
      },
      actualIntakeData: {
        protein: 45,
        carbohydrate: 280,
        fat: 55,
        calcium: 450,
        iron: 6,
        vitaminA: 600,
        vitaminC: 120,
      },
    };

    // ===== 有効性判定と改善項目抽出 =====
    const result = evaluateNutritionStandardValidity(nutritionStandardInput);

    // ===== 有効性判定の検証 =====
    // 全体有効性スコア: 改善が必要な項目が複数存在するため、有効性が低い
    // 計算式: 基準を満たす項目数 / 総項目数 × 100
    // 満たす項目: carbohydrate (280 ∈ [250, 350]), fat (55 ∈ [50, 80]), vitaminC (120 ∈ [100, 150])
    // 満たさない項目: protein (45 < 50), calcium (450 < 600), iron (6 < 8), vitaminA (600 < 700)
    // 有効性スコア = 3 / 7 × 100 = 42.86
    expect(result.validityScore).toBe(42.86);
    expect(result.isValid).toBe(false);

    // ===== 改善項目リストの検証 =====
    // 改善が必要な項目: protein, calcium, iron, vitaminA
    expect(result.improvementItems).toHaveLength(4);

    // ===== 優先度付けの検証 =====
    // 優先度計算: |実績 - 推奨値中央| / 推奨値中央 × 100 + 栄養学的重要度スコア
    // protein: |45 - 60| / 60 × 100 = 25.00 + 重要度40 = 65.00
    // calcium: |450 - 700| / 700 × 100 = 35.71 + 重要度35 = 70.71
    // iron: |6 - 10| / 10 × 100 = 40.00 + 重要度45 = 85.00
    // vitaminA: |600 - 800| / 800 × 100 = 25.00 + 重要度30 = 55.00
    // 優先度順: iron (85.00) > calcium (70.71) > protein (65.00) > vitaminA (55.00)

    expect(result.improvementItems[0]).toEqual({
      nutrientName: 'iron',
      currentValue: 6,
      recommendedMin: 8,
      recommendedMax: 12,
      unit: 'mg',
      priorityScore: 85.0,
      priorityRank: '高',
      improvementGap: 4,
      improvementRate: 66.67,
      recommendation: '鉄分を含む食材（レバー、赤身肉、ほうれん草）を増やしてください',
    });

    expect(result.improvementItems[1]).toEqual({
      nutrientName: 'calcium',
      currentValue: 450,
      recommendedMin: 600,
      recommendedMax: 800,
      unit: 'mg',
      priorityScore: 70.71,
      priorityRank: '高',
      improvementGap: 150,
      improvementRate: 33.33,
      recommendation: '乳製品・豆類を食事に加えてカルシウム摂取を増やしてください',
    });

    expect(result.improvementItems[2]).toEqual({
      nutrientName: 'protein',
      currentValue: 45,
      recommendedMin: 50,
      recommendedMax: 70,
      unit: 'g',
      priorityScore: 65.0,
      priorityRank: '中',
      improvementGap: 5,
      improvementRate: 11.11,
      recommendation: 'タンパク質を多く含む食品（肉、魚、卵、豆類）の摂取量を増やしてください',
    });

    expect(result.improvementItems[3]).toEqual({
      nutrientName: 'vitaminA',
      currentValue: 600,
      recommendedMin: 700,
      recommendedMax: 900,
      unit: 'μg',
      priorityScore: 55.0,
      priorityRank: '中',
      improvementGap: 100,
      improvementRate: 16.67,
      recommendation: 'ニンジン・かぼちゃなどの緑黄色野菜を意識的に取り入れてください',
    });

    // ===== 良好項目の検証 =====
    expect(result.adequateItems).toHaveLength(3);
    expect(result.adequateItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nutrientName: 'carbohydrate',
          currentValue: 280,
          status: '達成',
        }),
        expect.objectContaining({
          nutrientName: 'fat',
          currentValue: 55,
          status: '達成',
        }),
        expect.objectContaining({
          nutrientName: 'vitaminC',
          currentValue: 120,
          status: '達成',
        }),
      ])
    );

    // ===== ダッシュボードウィジェットデータの検証 =====
    expect(result.dashboardWidget).toEqual({
      displayPeriod: '2024-01-01 ～ 2024-01-07',
      overallValidityScore: 42.86,
      validityStatus: '改善が必要',
      improvementItemsCount: 4,
      topThreeImprovementItems: [
        expect.objectContaining({
          nutrientName: 'iron',
          priorityRank: '高',
        }),
        expect.objectContaining({
          nutrientName: 'calcium',
          priorityRank: '高',
        }),
        expect.objectContaining({
          nutrientName: 'protein',
          priorityRank: '中',
        }),
      ],
      lastUpdated: expect.any(String),
    });

    // ===== 改善推奨内容の検証 =====
    expect(result.overallRecommendation).toBe(
      '現在の栄養基準設定は改善が必要です。特に鉄分、カルシウム、タンパク質の摂取不足が目立ちます。これらの栄養素を含む食材を意識的に食事に取り入れることをお勧めします。'
    );

    // ===== 改善実行に向けたアクションプランの検証 =====
    expect(result.actionPlan).toHaveLength(4);
    expect(result.actionPlan[0]).toEqual({
      priority: 1,
      nutrient: 'iron',
      action: '週3回以上、レバーまたは赤身肉を主菜として組み込む',
      expectedImpact: '月間で鉄分摂取を +28mg 改善予想',
      timelineWeeks: 2,
    });

    // ===== 入力値の検証（エラーケース）=====
    // 推奨値が不正な場合（最小値 >= 最大値）
    const invalidStandardInput = {
      userId: 'user_001',
      familyMemberId: 'fam_001',
      evaluationPeriod: {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      },
      standardValues: {
        protein: { recommendedMin: 70, recommendedMax: 50, unit: 'g' }, // 無効
      },
      actualIntakeData: {
        protein: 60,
      },
    };

    expect(() => evaluateNutritionStandardValidity(invalidStandardInput)).toThrow(
      /推奨値/
    );

    // ===== 評価期間が不正な場合（開始日 > 終了日）=====
    const invalidPeriodInput = {
      userId: 'user_001',
      familyMemberId: 'fam_001',
      evaluationPeriod: {
        startDate: '2024-01-07',
        endDate: '2024-01-01', // 無効
      },
      standardValues: {
        protein: { recommendedMin: 50, recommendedMax: 70, unit: 'g' },
      },
      actualIntakeData: {
        protein: 60,
      },
    };

    expect(() => evaluateNutritionStandardValidity(invalidPeriodInput)).toThrow(
      /評価期間/
    );

    // ===== 実績データが不在の場合 =====
    const missingActualDataInput = {
      userId: 'user_001',
      familyMemberId: 'fam_001',
      evaluationPeriod: {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      },
      standardValues: {
        protein: { recommendedMin: 50, recommendedMax: 70, unit: 'g' },
        calcium: { recommendedMin: 600, recommendedMax: 800, unit: 'mg' },
      },
      actualIntakeData: {
        protein: 60,
        // calcium の実績値が不在
      },
    };

    expect(() => evaluateNutritionStandardValidity(missingActualDataInput)).toThrow(
      /実績データ/
    );
  });
});