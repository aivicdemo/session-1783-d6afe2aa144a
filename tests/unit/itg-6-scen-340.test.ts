import {
  analyzeUserSegmentPatterns,
} from "../../src/logic/it-1-br-8-2-1-1";

describe("ユーザーセグメント別利用パターン分析機能", () => {
  // SCEN-340
  test("複数ユーザーセグメントの利用パターンが同時に分析される", () => {
    const segmentPatternInputs = [
      {
        segmentId: "seg-001",
        segmentName: "年代20代_家族構成子供1名_食事制限あり",
        mealGenerationSuccessRate: 0.78,
        cookingTimeReductionDegree: 0.65,
        userSatisfactionScore: 7.4,
        featureUsageFrequency: {
          autoGeneration: 45,
          mealComparison: 32,
          ingredientSearch: 28,
          budgetTracking: 19,
        },
        dropoffRate: 0.12,
        sampleSize: 287,
      },
      {
        segmentId: "seg-002",
        segmentName: "年代30代_家族構成子供2名_食事制限なし",
        mealGenerationSuccessRate: 0.85,
        cookingTimeReductionDegree: 0.72,
        userSatisfactionScore: 8.1,
        featureUsageFrequency: {
          autoGeneration: 52,
          mealComparison: 41,
          ingredientSearch: 35,
          budgetTracking: 28,
        },
        dropoffRate: 0.08,
        sampleSize: 412,
      },
      {
        segmentId: "seg-003",
        segmentName: "年代40代_家族構成子供なし_食事制限あり",
        mealGenerationSuccessRate: 0.81,
        cookingTimeReductionDegree: 0.68,
        userSatisfactionScore: 7.8,
        featureUsageFrequency: {
          autoGeneration: 48,
          mealComparison: 37,
          ingredientSearch: 31,
          budgetTracking: 22,
        },
        dropoffRate: 0.1,
        sampleSize: 356,
      },
    ];

    const analysisRequest = {
      segmentPatternInputs: segmentPatternInputs,
      analysisStartDate: "2024-01-01T00:00:00Z",
      analysisEndDate: "2024-01-31T23:59:59Z",
      comparisonEnabled: true,
      minSampleSizeThreshold: 250,
    };

    const result = analyzeUserSegmentPatterns(analysisRequest);

    // 分析結果が返されることを検証
    expect(result).toBeDefined();

    // 分析対象セグメント数が3つであることを検証
    expect(result.analyzedSegmentCount).toBe(3);

    // 各セグメントの分析結果が存在することを検証
    expect(result.segmentAnalysisResults).toHaveLength(3);

    // セグメント1の分析結果を検証
    const segment1Result = result.segmentAnalysisResults[0];
    expect(segment1Result.segmentId).toBe("seg-001");
    expect(segment1Result.segmentName).toBe(
      "年代20代_家族構成子供1名_食事制限あり"
    );
    expect(segment1Result.mealGenerationSuccessRate).toBe(0.78);
    expect(segment1Result.cookingTimeReductionDegree).toBe(0.65);
    expect(segment1Result.userSatisfactionScore).toBe(7.4);
    expect(segment1Result.sampleSize).toBe(287);
    expect(segment1Result.analysisQualityScore).toBeGreaterThan(0.7);

    // セグメント2の分析結果を検証
    const segment2Result = result.segmentAnalysisResults[1];
    expect(segment2Result.segmentId).toBe("seg-002");
    expect(segment2Result.segmentName).toBe(
      "年代30代_家族構成子供2名_食事制限なし"
    );
    expect(segment2Result.mealGenerationSuccessRate).toBe(0.85);
    expect(segment2Result.cookingTimeReductionDegree).toBe(0.72);
    expect(segment2Result.userSatisfactionScore).toBe(8.1);
    expect(segment2Result.sampleSize).toBe(412);
    expect(segment2Result.analysisQualityScore).toBeGreaterThan(0.8);

    // セグメント3の分析結果を検証
    const segment3Result = result.segmentAnalysisResults[2];
    expect(segment3Result.segmentId).toBe("seg-003");
    expect(segment3Result.segmentName).toBe(
      "年代40代_家族構成子供なし_食事制限あり"
    );
    expect(segment3Result.mealGenerationSuccessRate).toBe(0.81);
    expect(segment3Result.cookingTimeReductionDegree).toBe(0.68);
    expect(segment3Result.userSatisfactionScore).toBe(7.8);
    expect(segment3Result.sampleSize).toBe(356);
    expect(segment3Result.analysisQualityScore).toBeGreaterThan(0.75);

    // 機能別使用頻度の分析結果を検証
    expect(segment1Result.featureUsageAnalysis).toBeDefined();
    expect(segment1Result.featureUsageAnalysis.topFeature).toBe(
      "autoGeneration"
    );
    expect(segment1Result.featureUsageAnalysis.topFeatureUsageCount).toBe(45);

    expect(segment2Result.featureUsageAnalysis).toBeDefined();
    expect(segment2Result.featureUsageAnalysis.topFeature).toBe(
      "autoGeneration"
    );
    expect(segment2Result.featureUsageAnalysis.topFeatureUsageCount).toBe(52);

    expect(segment3Result.featureUsageAnalysis).toBeDefined();
    expect(segment3Result.featureUsageAnalysis.topFeature).toBe(
      "autoGeneration"
    );
    expect(segment3Result.featureUsageAnalysis.topFeatureUsageCount).toBe(48);

    // セグメント間の比較データを検証
    expect(result.comparisonMetrics).toBeDefined();
    expect(result.comparisonMetrics.successRateComparison).toHaveLength(3);
    expect(result.comparisonMetrics.successRateComparison[0]).toEqual({
      segmentId: "seg-001",
      successRate: 0.78,
    });
    expect(result.comparisonMetrics.successRateComparison[1]).toEqual({
      segmentId: "seg-002",
      successRate: 0.85,
    });
    expect(result.comparisonMetrics.successRateComparison[2]).toEqual({
      segmentId: "seg-003",
      successRate: 0.81,
    });

    // 最大成功率セグメント（差別化効果が最大）を検証
    expect(result.comparisonMetrics.maxSuccessRateSegmentId).toBe("seg-002");
    expect(result.comparisonMetrics.maxSuccessRate).toBe(0.85);

    // 調理時間短縮度の比較データを検証
    expect(result.comparisonMetrics.cookingTimeReductionComparison).toHaveLength(
      3
    );
    expect(result.comparisonMetrics.cookingTimeReductionComparison[0]).toEqual({
      segmentId: "seg-001",
      reductionDegree: 0.65,
    });
    expect(result.comparisonMetrics.cookingTimeReductionComparison[1]).toEqual({
      segmentId: "seg-002",
      reductionDegree: 0.72,
    });
    expect(result.comparisonMetrics.cookingTimeReductionComparison[2]).toEqual({
      segmentId: "seg-003",
      reductionDegree: 0.68,
    });

    // ユーザー満足度スコアの比較データを検証
    expect(result.comparisonMetrics.satisfactionScoreComparison).toHaveLength(3);
    expect(result.comparisonMetrics.satisfactionScoreComparison[0]).toEqual({
      segmentId: "seg-001",
      satisfactionScore: 7.4,
    });
    expect(result.comparisonMetrics.satisfactionScoreComparison[1]).toEqual({
      segmentId: "seg-002",
      satisfactionScore: 8.1,
    });
    expect(result.comparisonMetrics.satisfactionScoreComparison[2]).toEqual({
      segmentId: "seg-003",
      satisfactionScore: 7.8,
    });

    // ドロップオフ率の比較データを検証
    expect(result.comparisonMetrics.dropoffRateComparison).toHaveLength(3);
    expect(result.comparisonMetrics.dropoffRateComparison[0]).toEqual({
      segmentId: "seg-001",
      dropoffRate: 0.12,
    });
    expect(result.comparisonMetrics.dropoffRateComparison[1]).toEqual({
      segmentId: "seg-002",
      dropoffRate: 0.08,
    });
    expect(result.comparisonMetrics.dropoffRateComparison[2]).toEqual({
      segmentId: "seg-003",
      dropoffRate: 0.1,
    });

    // 最小ドロップオフ率セグメント（改善優先度が高い）を検証
    expect(result.comparisonMetrics.minDropoffRateSegmentId).toBe("seg-002");
    expect(result.comparisonMetrics.minDropoffRate).toBe(0.08);

    // セグメント間の差別化優先度スコアを検証
    expect(result.differentiatonPriorityRanking).toBeDefined();
    expect(result.differentiatonPriorityRanking).toHaveLength(3);
    expect(result.differentiatonPriorityRanking[0].segmentId).toBe("seg-002");
    expect(result.differentiatonPriorityRanking[0].priorityScore).toBeGreaterThan(
      result.differentiatonPriorityRanking[1].priorityScore
    );
    expect(result.differentiatonPriorityRanking[1].segmentId).toBe("seg-003");
    expect(result.differentiatonPriorityRanking[2].segmentId).toBe("seg-001");

    // 分析処理の成功フラグを検証
    expect(result.analysisSuccessful).toBe(true);

    // 分析完了タイムスタンプを検証
    expect(result.analysisCompletedAt).toBeDefined();
    expect(new Date(result.analysisCompletedAt)).toBeInstanceOf(Date);

    // すべてのセグメントサンプルサイズが最小閾値以上であることを検証
    result.segmentAnalysisResults.forEach((segResult) => {
      expect(segResult.sampleSize).toBeGreaterThanOrEqual(250);
    });

    // 各セグメントの分析が独立していることを確認（セグメント間でデータが混在していないことを検証）
    const segment1Id = result.segmentAnalysisResults[0].segmentId;
    const segment2Id = result.segmentAnalysisResults[1].segmentId;
    const segment3Id = result.segmentAnalysisResults[2].segmentId;
    expect(segment1Id).not.toBe(segment2Id);
    expect(segment2Id).not.toBe(segment3Id);
    expect(segment1Id).not.toBe(segment3Id);

    // 比較メトリクスの整合性を検証
    expect(result.comparisonMetrics.successRateComparison.length).toBe(
      result.analyzedSegmentCount
    );
    expect(result.comparisonMetrics.cookingTimeReductionComparison.length).toBe(
      result.analyzedSegmentCount
    );
    expect(result.comparisonMetrics.satisfactionScoreComparison.length).toBe(
      result.analyzedSegmentCount
    );
    expect(result.comparisonMetrics.dropoffRateComparison.length).toBe(
      result.analyzedSegmentCount
    );

    // 全体分析統計情報を検証
    expect(result.overallAnalysisStats).toBeDefined();
    expect(result.overallAnalysisStats.averageSuccessRate).toBeCloseTo(
      (0.78 + 0.85 + 0.81) / 3,
      2
    );
    expect(result.overallAnalysisStats.averageCookingTimeReduction).toBeCloseTo(
      (0.65 + 0.72 + 0.68) / 3,
      2
    );
    expect(result.overallAnalysisStats.averageSatisfactionScore).toBeCloseTo(
      (7.4 + 8.1 + 7.8) / 3,
      1
    );
    expect(result.overallAnalysisStats.averageDropoffRate).toBeCloseTo(
      (0.12 + 0.08 + 0.1) / 3,
      2
    );

    // エラーが発生していないことを検証
    expect(result.errorOccurred).toBe(false);
    expect(result.errorMessage).toBeUndefined();
  });
});