import { recalculatePriorityMatrix } from '../../src/logic/it-8-1-1-1';

describe('優先度マトリクス再計算機能', () => {
  // SCEN-350
  test('市場環境変化が検出されたとき、優先度マトリクスが再計算され差別化軸が更新される', () => {
    // 初期状態の優先度マトリクス
    const initialPainFactors = [
      {
        painFactorId: 'pf_001',
        name: '食材制限対応',
        occurrenceFrequency: 45,
        impactDegree: 75,
        priorityScore: 3375,
        priorityRank: 1,
      },
      {
        painFactorId: 'pf_002',
        name: '調理時間短縮',
        occurrenceFrequency: 38,
        impactDegree: 68,
        priorityScore: 2584,
        priorityRank: 2,
      },
      {
        painFactorId: 'pf_003',
        name: '予算制約対応',
        occurrenceFrequency: 32,
        impactDegree: 62,
        priorityScore: 1984,
        priorityRank: 3,
      },
    ];

    const initialDifferentiationAxis = [
      {
        axisId: 'da_001',
        name: '多様な食材制限対応',
        competitorGapScore: 45,
        userImpactScore: 78,
        implementationDifficulty: 6,
        marketRelevanceScore: 89,
      },
      {
        axisId: 'da_002',
        name: 'AI調理時間最適化',
        competitorGapScore: 28,
        userImpactScore: 65,
        implementationDifficulty: 7,
        marketRelevanceScore: 72,
      },
    ];

    // 市場環境変化データ
    const marketEnvironmentChange = {
      changeDetectionTimestamp: '2024-02-15T10:30:00Z',
      competitorNewProductInfo: {
        competitorId: 'comp_001',
        productName: '家族向けAI献立アプリ',
        launchDate: '2024-02-10',
        featureList: [
          '8種類食材制限対応',
          '15分以内調理自動フィルタ',
          '月次予算管理',
          'SNS連携レシピ共有',
        ],
      },
      customerNeedsShift: {
        increasedDemandFactors: [
          {
            factorName: '時短調理要求',
            shiftMagnitude: 35,
            affectedUserSegmentPercentage: 62,
          },
          {
            factorName: 'SNS連携・シェア機能',
            shiftMagnitude: 28,
            affectedUserSegmentPercentage: 48,
          },
        ],
        declinedDemandFactors: [
          {
            factorName: 'シンプルUI',
            declineMagnitude: 15,
            affectedUserSegmentPercentage: 22,
          },
        ],
      },
      externalMarketIndicators: {
        marketTrendIndex: 85,
        seasonalAdjustmentFactor: 1.15,
        macroeconomicFactorIndex: 0.92,
      },
    };

    // 優先度マトリクス再計算実行
    const recalculationResult = recalculatePriorityMatrix(
      initialPainFactors,
      initialDifferentiationAxis,
      marketEnvironmentChange
    );

    // 再計算後の優先度マトリクス検証
    expect(recalculationResult.recalculatedPainFactors).toBeDefined();
    expect(recalculationResult.recalculatedPainFactors.length).toBe(3);

    // 市場環境変化に基づいた優先度の変動を検証
    // 調理時間短縮の需要が +35% 増加したため、priorityScore が上昇
    const recalculatedCookingTimeItem = recalculationResult.recalculatedPainFactors.find(
      (item: any) => item.painFactorId === 'pf_002'
    );
    expect(recalculatedCookingTimeItem).toBeDefined();
    // 計算根拠: 調理時間短縮の新 priorityScore
    // = (38 + 38 * 0.35) * (68 + 68 * 0.12) (需要増 35%, 影響度調整 12%)
    // = (38 + 13.3) * (68 + 8.16)
    // = 51.3 * 76.16
    // ≈ 3909
    expect(recalculatedCookingTimeItem.priorityScore).toBe(3909);
    expect(recalculatedCookingTimeItem.priorityRank).toBe(1);

    // 食材制限対応は競合での対応が進んでいるため優先度がやや低下
    const recalculatedFoodRestrictionItem = recalculationResult.recalculatedPainFactors.find(
      (item: any) => item.painFactorId === 'pf_001'
    );
    expect(recalculatedFoodRestrictionItem).toBeDefined();
    // 計算根拠: 食材制限対応の新 priorityScore
    // = (45 - 45 * 0.08) * (75 - 75 * 0.05) (市場ニーズ相対低下 8%, 影響度軽減 5%)
    // = (45 - 3.6) * (75 - 3.75)
    // = 41.4 * 71.25
    // ≈ 2950
    expect(recalculatedFoodRestrictionItem.priorityScore).toBe(2950);
    expect(recalculatedFoodRestrictionItem.priorityRank).toBe(2);

    // 予算制約は市場環境変化の直接影響が小さいため優先度はやや上昇
    const recalculatedBudgetItem = recalculationResult.recalculatedPainFactors.find(
      (item: any) => item.painFactorId === 'pf_003'
    );
    expect(recalculatedBudgetItem).toBeDefined();
    // 計算根拠: 予算制約対応の新 priorityScore
    // = (32 + 32 * 0.12) * (62 + 62 * 0.08) (マクロ経済係数 0.92 による調整で弱い需要増)
    // = (32 + 3.84) * (62 + 4.96)
    // = 35.84 * 66.96
    // ≈ 2399
    expect(recalculatedBudgetItem.priorityScore).toBe(2399);
    expect(recalculatedBudgetItem.priorityRank).toBe(3);

    // 差別化軸の再計算検証
    expect(recalculationResult.recalculatedDifferentiationAxis).toBeDefined();
    expect(recalculationResult.recalculatedDifferentiationAxis.length).toBe(2);

    // 調理時間最適化の差別化軸スコアが上昇
    const recalculatedCookingTimeAxis = recalculationResult.recalculatedDifferentiationAxis.find(
      (item: any) => item.axisId === 'da_002'
    );
    expect(recalculatedCookingTimeAxis).toBeDefined();
    // 計算根拠: 競合ギャップスコア新値
    // = 28 + (35 * 0.6) (需要増 35% を 60% 反映)
    // = 28 + 21
    // = 49
    expect(recalculatedCookingTimeAxis.competitorGapScore).toBe(49);
    // ユーザー影響度スコア新値
    // = 65 + (48 * 0.35) (シェア機能需要増の一部を反映)
    // = 65 + 16.8
    // ≈ 82
    expect(recalculatedCookingTimeAxis.userImpactScore).toBe(82);
    // 市場関連性スコア新値
    // = (72 * 1.15) * 0.92 (季節調整 1.15, マクロ経済係数 0.92 を適用)
    // = 82.8 * 0.92
    // ≈ 76
    expect(recalculatedCookingTimeAxis.marketRelevanceScore).toBe(76);

    // 食材制限対応の差別化軸スコアはやや低下
    const recalculatedFoodRestrictionAxis = recalculationResult.recalculatedDifferentiationAxis.find(
      (item: any) => item.axisId === 'da_001'
    );
    expect(recalculatedFoodRestrictionAxis).toBeDefined();
    // 計算根拠: 競合ギャップスコア新値
    // = 45 - (15 * 0.8) (競合が 8 種類対応で既に競争力がある、シンプルUI低下 15% の影響を軽減)
    // = 45 - 12
    // = 33
    expect(recalculatedFoodRestrictionAxis.competitorGapScore).toBe(33);
    // ユーザー影響度スコア新値
    // = 78 - (22 * 0.25) (シンプルUI需要低下 22% を 25% 反映)
    // = 78 - 5.5
    // ≈ 73
    expect(recalculatedFoodRestrictionAxis.userImpactScore).toBe(73);
    // 市場関連性スコア新値
    // = (89 * 1.15) * 0.92
    // = 102.35 * 0.92
    // ≈ 94
    expect(recalculatedFoodRestrictionAxis.marketRelevanceScore).toBe(94);

    // 全体の再計算メタデータ検証
    expect(recalculationResult.recalculationTimestamp).toBeDefined();
    expect(recalculationResult.marketChangeDetected).toBe(true);
    expect(recalculationResult.priorityShiftMagnitude).toBeGreaterThan(0);
    // 優先度シフト大きさ = 再計算前後の priorityRank 総変動幅
    // 初期: pf_001=1, pf_002=2, pf_003=3
    // 再計算: pf_002=1, pf_001=2, pf_003=3
    // シフト大きさ: |1-2| + |2-1| + |3-3| = 1 + 1 + 0 = 2
    expect(recalculationResult.priorityShiftMagnitude).toBe(2);

    // 変化前後での一貫性検証
    expect(recalculationResult.initialPainFactorCount).toBe(3);
    expect(recalculationResult.recalculatedPainFactorCount).toBe(3);
    expect(recalculationResult.differentiationAxisChangeCount).toBeGreaterThan(0);
    expect(recalculationResult.differentiationAxisChangeCount).toBeLessThanOrEqual(2);

    // 市場環境要因の反映確認
    expect(recalculationResult.appliedMarketFactors).toBeDefined();
    expect(recalculationResult.appliedMarketFactors).toContain('competitorNewProductInfo');
    expect(recalculationResult.appliedMarketFactors).toContain('customerNeedsShift');
    expect(recalculationResult.appliedMarketFactors).toContain('externalMarketIndicators');
  });
});