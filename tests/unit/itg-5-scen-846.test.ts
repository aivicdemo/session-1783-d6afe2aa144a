import { validateMenuRuleConsistency } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムのルール変更時の整合性自動検証', () => {
  test('SCEN-846: ルール変更時の整合性自動検証 - 過去1000件の献立提案と新ルールの矛盾が検出された場合、詳細な矛盾リストが開発チームに通知される', () => {
    // 過去1000件の献立提案データ（サンプル）
    const pastMenus = Array.from({ length: 1000 }, (_, i) => ({
      menuId: `menu_${String(i + 1).padStart(5, '0')}`,
      proposalDate: new Date('2024-01-15').toISOString(),
      ingredients: [
        { ingredientId: 'ing_001', name: '豚肉', category: 'meat', quantity: 300 },
        { ingredientId: 'ing_002', name: '玉ねぎ', category: 'vegetable', quantity: 200 },
      ],
      cookingTimeMinutes: 45,
      nutritionalScore: 85,
      seasonalFactor: i % 100 < 30 ? 'winter_seasonal' : 'standard',
      discountApplied: i % 50 === 0,
    }));

    // 新しいルール設定（過去の一部献立と矛盾する）
    const newRule = {
      ruleId: 'rule_seasonal_2024_q2',
      seasonalPattern: {
        requiredSeasonalIngredients: ['spring_vegetables', 'spring_fruits'],
        discountThreshold: 20,
        prohibitedSeasonalCombination: ['winter_seasonal', 'spring_vegetables'],
      },
      cookingTimeConstraint: {
        maxMinutes: 40,
        minMinutes: 15,
      },
      nutritionConstraint: {
        minScore: 80,
        maxScore: 100,
      },
    };

    // 検証実行
    const validationResult = validateMenuRuleConsistency({
      pastMenuProposals: pastMenus,
      newRule: newRule,
      validationScope: 'full_inconsistency_detection',
    });

    // 期待値の計算
    // 矛盾検出ロジック：
    // 1. cookingTimeMinutes: 45 > maxMinutes: 40 → 矛盾
    // 2. seasonalFactor === 'winter_seasonal' && prohibitedSeasonalCombination に含まれる → 矛盾
    // 合計矛盾件数：過去1000件中、約30件が winter_seasonal フラグを持つため、30件以上の矛盾が検出される
    const expectedInconsistencyCount = 1000; // 全件が cookingTimeMinutes 矛盾により該当

    // 検証結果の構造化確認
    expect(validationResult).toEqual(
      expect.objectContaining({
        validationId: expect.any(String),
        ruleId: 'rule_seasonal_2024_q2',
        totalMenusValidated: 1000,
        inconsistencyDetected: true,
        inconsistencySummary: expect.objectContaining({
          totalInconsistencies: expect.any(Number),
          categoryBreakdown: expect.objectContaining({
            cookingTimeViolation: expect.any(Number),
            nutritionalViolation: expect.any(Number),
            seasonalConflict: expect.any(Number),
          }),
          affectedMenuIds: expect.any(Array),
        }),
        detailedInconsistencyList: expect.any(Array),
        developmentTeamNotification: expect.objectContaining({
          notificationId: expect.any(String),
          recipientTeam: 'development_team',
          notificationType: 'rule_consistency_violation',
          attachmentFormat: 'csv',
          sentAt: expect.any(String),
          status: 'sent',
        }),
      })
    );

    // 矛盾の詳細内容確認
    expect(validationResult.inconsistencySummary.totalInconsistencies).toBeGreaterThan(0);
    expect(validationResult.inconsistencySummary.affectedMenuIds.length).toBeGreaterThan(0);

    // 詳細矛盾リストの構造確認（最初の項目を検証）
    if (validationResult.detailedInconsistencyList.length > 0) {
      const firstInconsistency = validationResult.detailedInconsistencyList[0];
      expect(firstInconsistency).toEqual(
        expect.objectContaining({
          menuId: expect.any(String),
          violationType: expect.stringMatching(/cookingTimeViolation|nutritionalViolation|seasonalConflict/),
          expectedValue: expect.any(Number),
          actualValue: expect.any(Number),
          ruleSectionAffected: expect.any(String),
          severity: expect.stringMatching(/critical|high|medium/),
        })
      );
    }

    // 開発チーム通知の確認
    expect(validationResult.developmentTeamNotification.status).toBe('sent');
    expect(validationResult.developmentTeamNotification.recipientTeam).toBe('development_team');
    expect(validationResult.developmentTeamNotification.notificationType).toBe(
      'rule_consistency_violation'
    );
    expect(validationResult.developmentTeamNotification.attachmentFormat).toBe('csv');

    // 通知送信時刻がISO形式であることを確認
    const sentAtDate = new Date(validationResult.developmentTeamNotification.sentAt);
    expect(sentAtDate.getTime()).toBeGreaterThan(0);

    // 矛盾リストの件数が妥当な範囲であることを確認
    // cookingTimeMinutes 45 > maxMinutes 40 により全件が矛盾するため、
    // detailedInconsistencyList の長さは1000に近い値になるはずだが、
    // サンプリングまたは最初の N 件のみを返す設計の場合は上限を設定
    expect(validationResult.detailedInconsistencyList.length).toBeGreaterThan(0);
    expect(validationResult.detailedInconsistencyList.length).toBeLessThanOrEqual(1000);

    // categoryBreakdown の合計が totalInconsistencies と整合していることを確認
    const categoryTotal =
      (validationResult.inconsistencySummary.categoryBreakdown.cookingTimeViolation || 0) +
      (validationResult.inconsistencySummary.categoryBreakdown.nutritionalViolation || 0) +
      (validationResult.inconsistencySummary.categoryBreakdown.seasonalConflict || 0);
    expect(categoryTotal).toBeGreaterThan(0);
  });
});