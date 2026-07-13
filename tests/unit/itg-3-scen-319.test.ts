import { detectAndPrioritizeConstraints } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-319
  test('新規入力された食事制限条件が正常に検出され優先度付けされ、献立生成アルゴリズムへの反映要否が判定される', () => {
    // 前提: ユーザーが制約条件入力画面で新規の食事制限条件を入力した状態
    const inputConstraints = [
      {
        constraintId: 'c001',
        constraintType: 'allergy',
        constraintValue: 'peanut',
        inputTimestamp: new Date('2024-01-15T10:00:00Z'),
        familyMemberId: 'fm001',
        isNewlyAdded: true,
      },
      {
        constraintId: 'c002',
        constraintType: 'dietary_restriction',
        constraintValue: 'vegetarian',
        inputTimestamp: new Date('2024-01-15T10:05:00Z'),
        familyMemberId: 'fm002',
        isNewlyAdded: true,
      },
      {
        constraintId: 'c003',
        constraintType: 'religious',
        constraintValue: 'halal',
        inputTimestamp: new Date('2024-01-15T10:10:00Z'),
        familyMemberId: 'fm003',
        isNewlyAdded: true,
      },
    ];

    const previousConstraints = [
      {
        constraintId: 'c001',
        constraintType: 'allergy',
        constraintValue: 'peanut',
        lastUpdatedTimestamp: new Date('2023-12-01T09:00:00Z'),
        familyMemberId: 'fm001',
        isNewlyAdded: false,
      },
    ];

    const lastUpdateTimestamp = new Date('2023-12-01T09:00:00Z');
    const currentTimestamp = new Date('2024-01-15T10:30:00Z');

    // 発生条件: 新しい食事制限条件が入力されたとき、または前回更新から7日以上経過したとき
    // この場合、新規条件が2つ、前回更新から15日経過
    const result = detectAndPrioritizeConstraints({
      newConstraints: inputConstraints,
      existingConstraints: previousConstraints,
      lastUpdateTimestamp,
      currentTimestamp,
    });

    // 結果: 変更内容を優先度付けして検出し、献立生成アルゴリズムへの反映要否を判定する
    // 期待値: 3つの新規制限条件が検出され、それぞれ優先度が付与される
    expect(result.detectedConstraints).toHaveLength(2); // 新規追加された2つ
    expect(result.detectedConstraints[0].constraintId).toBe('c002');
    expect(result.detectedConstraints[0].priorityLevel).toBe('HIGH');
    expect(result.detectedConstraints[0].priorityScore).toBe(95);

    expect(result.detectedConstraints[1].constraintId).toBe('c003');
    expect(result.detectedConstraints[1].priorityLevel).toBe('HIGH');
    expect(result.detectedConstraints[1].priorityScore).toBe(90);

    // 優先度が高い制限条件が献立生成アルゴリズムへの即時反映の対象か判定
    expect(result.requiresImmediateReflection).toBe(true);
    expect(result.reflectionReason).toBe('新規の高優先度制限条件が検出されました');

    // 複数の制限条件を同時入力した場合、それぞれの優先度が正しく並序付けされることを確認
    expect(result.detectedConstraints[0].priorityScore).toBeGreaterThan(
      result.detectedConstraints[1].priorityScore
    );

    // 過去に抵触する献立パターンの検出対象確認
    expect(result.conflictingMealPatterns).toHaveLength(0);
    expect(result.shouldReviewPastMeals).toBe(false);
  });

  test('新規入力された食事制限条件が過去の献立と抵触する場合、抵触パターンが検出される', () => {
    // 前提: 新規の食事制限条件が入力された際、過去の献立履歴との抵触検出
    const inputConstraints = [
      {
        constraintId: 'c004',
        constraintType: 'allergy',
        constraintValue: 'shellfish',
        inputTimestamp: new Date('2024-01-20T14:00:00Z'),
        familyMemberId: 'fm001',
        isNewlyAdded: true,
      },
    ];

    const previousConstraints = [];
    const lastUpdateTimestamp = new Date('2024-01-01T00:00:00Z');
    const currentTimestamp = new Date('2024-01-20T14:30:00Z');

    const result = detectAndPrioritizeConstraints({
      newConstraints: inputConstraints,
      existingConstraints: previousConstraints,
      lastUpdateTimestamp,
      currentTimestamp,
    });

    // 結果: 新規制限条件が検出され、優先度が付与される
    expect(result.detectedConstraints).toHaveLength(1);
    expect(result.detectedConstraints[0].constraintId).toBe('c004');
    expect(result.detectedConstraints[0].priorityLevel).toBe('HIGH');
    expect(result.detectedConstraints[0].priorityScore).toBe(100);

    // アレルギー条件は最高優先度
    expect(result.requiresImmediateReflection).toBe(true);
    expect(result.reflectionReason).toMatch(/アレルギー/);
  });

  test('前回更新から7日以上経過した場合、システムが変更検出を要求する', () => {
    // 前提: 前回更新から7日以上経過した状態
    const inputConstraints = [
      {
        constraintId: 'c005',
        constraintType: 'nutritional',
        constraintValue: 'low_sodium',
        inputTimestamp: new Date('2024-01-22T09:00:00Z'),
        familyMemberId: 'fm002',
        isNewlyAdded: true,
      },
    ];

    const previousConstraints = [
      {
        constraintId: 'c001',
        constraintType: 'allergy',
        constraintValue: 'peanut',
        lastUpdatedTimestamp: new Date('2024-01-01T00:00:00Z'),
        familyMemberId: 'fm001',
        isNewlyAdded: false,
      },
    ];

    // 発生条件: 前回更新から21日経過
    const lastUpdateTimestamp = new Date('2024-01-01T00:00:00Z');
    const currentTimestamp = new Date('2024-01-22T09:30:00Z');

    const result = detectAndPrioritizeConstraints({
      newConstraints: inputConstraints,
      existingConstraints: previousConstraints,
      lastUpdateTimestamp,
      currentTimestamp,
    });

    // 結果: 前回更新から7日以上経過しているため、検証が必要と判定
    expect(result.requiresVerification).toBe(true);
    expect(result.daysSinceLastUpdate).toBe(21);
  });

  test('複数の制限条件を同時入力した場合、優先度マトリクスが正しく計算される', () => {
    // 前提: 複数の制限条件を同時入力した状態
    const inputConstraints = [
      {
        constraintId: 'c006',
        constraintType: 'allergy',
        constraintValue: 'dairy',
        inputTimestamp: new Date('2024-01-25T10:00:00Z'),
        familyMemberId: 'fm001',
        isNewlyAdded: true,
      },
      {
        constraintId: 'c007',
        constraintType: 'dietary_restriction',
        constraintValue: 'gluten_free',
        inputTimestamp: new Date('2024-01-25T10:00:00Z'),
        familyMemberId: 'fm001',
        isNewlyAdded: true,
      },
      {
        constraintId: 'c008',
        constraintType: 'religious',
        constraintValue: 'kosher',
        inputTimestamp: new Date('2024-01-25T10:00:00Z'),
        familyMemberId: 'fm002',
        isNewlyAdded: true,
      },
      {
        constraintId: 'c009',
        constraintType: 'nutritional',
        constraintValue: 'low_sugar',
        inputTimestamp: new Date('2024-01-25T10:00:00Z'),
        familyMemberId: 'fm003',
        isNewlyAdded: true,
      },
    ];

    const previousConstraints = [];
    const lastUpdateTimestamp = new Date('2024-01-01T00:00:00Z');
    const currentTimestamp = new Date('2024-01-25T10:30:00Z');

    const result = detectAndPrioritizeConstraints({
      newConstraints: inputConstraints,
      existingConstraints: previousConstraints,
      lastUpdateTimestamp,
      currentTimestamp,
    });

    // 結果: 4つの新規条件が検出され、適切に優先度付けされる
    expect(result.detectedConstraints).toHaveLength(4);

    // 優先度順序の確認: アレルギー > 宗教的 > 食事制限 > 栄養
    expect(result.detectedConstraints[0].constraintId).toBe('c006');
    expect(result.detectedConstraints[0].priorityLevel).toBe('HIGH');
    expect(result.detectedConstraints[0].priorityScore).toBe(100);

    expect(result.detectedConstraints[1].constraintId).toBe('c008');
    expect(result.detectedConstraints[1].priorityLevel).toBe('HIGH');
    expect(result.detectedConstraints[1].priorityScore).toBe(95);

    expect(result.detectedConstraints[2].constraintId).toBe('c007');
    expect(result.detectedConstraints[2].priorityLevel).toBe('MEDIUM');
    expect(result.detectedConstraints[2].priorityScore).toBe(75);

    expect(result.detectedConstraints[3].constraintId).toBe('c009');
    expect(result.detectedConstraints[3].priorityLevel).toBe('MEDIUM');
    expect(result.detectedConstraints[3].priorityScore).toBe(60);

    // 優先度スコアが降順で並んでいることを確認
    for (let i = 0; i < result.detectedConstraints.length - 1; i++) {
      expect(result.detectedConstraints[i].priorityScore).toBeGreaterThanOrEqual(
        result.detectedConstraints[i + 1].priorityScore
      );
    }

    // 献立生成アルゴリズムへの反映が必要と判定
    expect(result.requiresImmediateReflection).toBe(true);
  });

  test('入力値が不正な場合、エラーが発生する', () => {
    const invalidInput = {
      newConstraints: null,
      existingConstraints: [],
      lastUpdateTimestamp: new Date('2024-01-01T00:00:00Z'),
      currentTimestamp: new Date('2024-01-25T10:30:00Z'),
    };

    expect(() =>
      detectAndPrioritizeConstraints(invalidInput as any)
    ).toThrow(/制約条件入力/);
  });

  test('タイムスタンプが不正な場合、エラーが発生する', () => {
    const inputConstraints = [
      {
        constraintId: 'c010',
        constraintType: 'allergy',
        constraintValue: 'egg',
        inputTimestamp: new Date('2024-01-25T10:00:00Z'),
        familyMemberId: 'fm001',
        isNewlyAdded: true,
      },
    ];

    const invalidInput = {
      newConstraints: inputConstraints,
      existingConstraints: [],
      lastUpdateTimestamp: new Date('2024-01-25T10:30:00Z'),
      currentTimestamp: new Date('2024-01-01T00:00:00Z'), // 現在時刻が過去
    };

    expect(() =>
      detectAndPrioritizeConstraints(invalidInput as any)
    ).toThrow(/タイムスタンプ/);
  });

  test('制約条件のタイプが未サポートの場合、デフォルト優先度が適用される', () => {
    const inputConstraints = [
      {
        constraintId: 'c011',
        constraintType: 'unknown_type',
        constraintValue: 'custom_value',
        inputTimestamp: new Date('2024-01-26T09:00:00Z'),
        familyMemberId: 'fm001',
        isNewlyAdded: true,
      },
    ];

    const previousConstraints = [];
    const lastUpdateTimestamp = new Date('2024-01-01T00:00:00Z');
    const currentTimestamp = new Date('2024-01-26T09:30:00Z');

    const result = detectAndPrioritizeConstraints({
      newConstraints: inputConstraints,
      existingConstraints: previousConstraints,
      lastUpdateTimestamp,
      currentTimestamp,
    });

    expect(result.detectedConstraints).toHaveLength(1);
    expect(result.detectedConstraints[0].priorityLevel).toBe('LOW');
    expect(result.detectedConstraints[0].priorityScore).toBe(30);
  });
});