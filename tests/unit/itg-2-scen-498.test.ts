import { evaluateImplementationFeasibility } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-498: [normal] 実装計画策定 - 改善項目の実装可否とスケジュールを判定する
  test('should evaluate implementation feasibility and generate schedule for viable improvement items', () => {
    // Precondition: 改善項目の詳細情報（内容、優先度、必要リソース等）が入力されている
    const improvementItem = {
      id: 'IMP-001',
      title: 'カルシウム摂取目標の基準値見直し',
      description: '栄養基準ロジックのカルシウム摂取推奨値を現行値から 20% 増加させる',
      priorityScore: 8.5,
      businessValue: 9,
      technicalDifficulty: 3,
      userImpact: 8,
      requiredResourceCount: 2,
      estimatedDays: 5,
      dependencies: ['IMP-002'],
      implementationDeadline: '2024-02-29',
    };

    const existingSchedule = [
      {
        itemId: 'IMP-002',
        startDate: '2024-02-05',
        endDate: '2024-02-15',
      },
      {
        itemId: 'IMP-003',
        startDate: '2024-02-20',
        endDate: '2024-02-25',
      },
    ];

    const resourceAvailability = {
      availableResourceCount: 3,
      allocationFromDate: '2024-02-01',
      allocationUntilDate: '2024-03-31',
    };

    // Trigger: 実装可否判定機能を実行する
    const result = evaluateImplementationFeasibility({
      improvementItem,
      existingSchedule,
      resourceAvailability,
    });

    // Outcome: 実装可能性が判定され、実装可能な場合はスケジュールが生成される
    // expectedResult から計算した具体値
    // - 技術難度 (3) と必要リソース (2) の制約検証: 利用可能リソース (3) >= 必要リソース (2) → 可能
    // - 依存関係 (IMP-002: 2024-02-15 終了) を考慮した開始日: 2024-02-16
    // - 実装期間 5 日 → 終了日: 2024-02-20
    // - 実装期限 (2024-02-29) との比較: 2024-02-20 <= 2024-02-29 → 可能

    expect(result.isFeasible).toBe(true);
    expect(result.feasibilityReason).toMatch(/リソース充足|依存関係|期限内/);

    expect(result.schedule).toBeDefined();
    expect(result.schedule.startDate).toBe('2024-02-16');
    expect(result.schedule.endDate).toBe('2024-02-20');
    expect(result.schedule.milestoneDates).toEqual(['2024-02-18']);
    expect(result.schedule.isConflictFree).toBe(true);

    // 技術的実現性スコア: (10 - technicalDifficulty) / 10 = (10 - 3) / 10 = 0.7 = 70%
    expect(result.technicalFeasibilityScore).toBe(70);

    // コスト評価: requiredResourceCount (2) * estimatedDays (5) = 10 人日
    expect(result.estimatedEffort).toBe(10);
  });

  test('should handle infeasible improvement items with technical constraints', () => {
    const improvementItem = {
      id: 'IMP-004',
      title: '複雑な機械学習モデルの導入',
      description: '需要予測に深層学習を導入する',
      priorityScore: 7.2,
      businessValue: 7,
      technicalDifficulty: 9,
      userImpact: 6,
      requiredResourceCount: 5,
      estimatedDays: 20,
      dependencies: [],
      implementationDeadline: '2024-02-15',
    };

    const existingSchedule = [
      {
        itemId: 'IMP-003',
        startDate: '2024-02-01',
        endDate: '2024-02-10',
      },
    ];

    const resourceAvailability = {
      availableResourceCount: 2,
      allocationFromDate: '2024-02-01',
      allocationUntilDate: '2024-03-31',
    };

    // Trigger: 実装可否判定を実行する
    const result = evaluateImplementationFeasibility({
      improvementItem,
      existingSchedule,
      resourceAvailability,
    });

    // Outcome: 実装不可と判定され、理由が表示される
    // - 必要リソース (5) > 利用可能リソース (2) → リソース不足
    // - 必要期間 (20日) > 期限までの日数 (14日) → 期限内実装不可

    expect(result.isFeasible).toBe(false);
    expect(result.feasibilityReason).toMatch(/リソース不足|期限超過|難度高|制約/);

    expect(result.schedule).toBeNull();

    // 技術的実現性スコア: (10 - 9) / 10 = 0.1 = 10%
    expect(result.technicalFeasibilityScore).toBe(10);

    // 制約要因を列挙
    expect(result.constraints).toContain('insufficient_resources');
    expect(result.constraints).toContain('deadline_conflict');
  });

  test('should validate dependency chain and detect circular dependencies', () => {
    const improvementItem = {
      id: 'IMP-005',
      title: 'アレルギー情報管理機能の拡張',
      description: 'アレルギー履歴テーブルを新規追加',
      priorityScore: 6.8,
      businessValue: 7,
      technicalDifficulty: 4,
      userImpact: 7,
      requiredResourceCount: 2,
      estimatedDays: 8,
      dependencies: ['IMP-006', 'IMP-007'],
      implementationDeadline: '2024-03-15',
    };

    const existingSchedule = [
      {
        itemId: 'IMP-006',
        startDate: '2024-02-20',
        endDate: '2024-03-01',
      },
      {
        itemId: 'IMP-007',
        startDate: '2024-02-25',
        endDate: '2024-03-05',
      },
    ];

    const resourceAvailability = {
      availableResourceCount: 3,
      allocationFromDate: '2024-02-01',
      allocationUntilDate: '2024-03-31',
    };

    const result = evaluateImplementationFeasibility({
      improvementItem,
      existingSchedule,
      resourceAvailability,
    });

    // Outcome: 依存関係を検証し、実装可能なスケジュールが生成される
    // - 最遅の依存項目 (IMP-007) 終了: 2024-03-05
    // - 開始日: 2024-03-06
    // - 実装期間 8日 → 終了日: 2024-03-13
    // - 期限 (2024-03-15) との比較: 2024-03-13 <= 2024-03-15 → 可能

    expect(result.isFeasible).toBe(true);
    expect(result.schedule.startDate).toBe('2024-03-06');
    expect(result.schedule.endDate).toBe('2024-03-13');
    expect(result.dependencyValidation.isValid).toBe(true);
    expect(result.dependencyValidation.hasCircularDependency).toBe(false);
    expect(result.dependencyValidation.resolvedDependencyOrder).toEqual(['IMP-006', 'IMP-007', 'IMP-005']);
  });

  test('should detect conflict with existing project schedule', () => {
    const improvementItem = {
      id: 'IMP-008',
      title: '栄養目標管理ロジックの改善',
      description: '月次/四半期ごとの栄養基準ロジック検証プロセスを最適化',
      priorityScore: 7.5,
      businessValue: 8,
      technicalDifficulty: 5,
      userImpact: 7,
      requiredResourceCount: 1,
      estimatedDays: 6,
      dependencies: [],
      implementationDeadline: '2024-02-28',
    };

    const existingSchedule = [
      {
        itemId: 'IMP-009',
        startDate: '2024-02-15',
        endDate: '2024-02-28',
      },
    ];

    const resourceAvailability = {
      availableResourceCount: 1,
      allocationFromDate: '2024-02-01',
      allocationUntilDate: '2024-02-28',
    };

    // Trigger: 既存スケジュールとの競合を検証する
    const result = evaluateImplementationFeasibility({
      improvementItem,
      existingSchedule,
      resourceAvailability,
    });

    // Outcome: スケジュール競合が検出される
    // - 利用可能リソース: 1名
    // - 既存項目 (IMP-009) が 2024-02-15 ～ 2024-02-28 に稼働中
    // - 新規項目の実装期間: 6日
    // - 期限内での実装スケジュール確保不可 → 実装不可

    expect(result.isFeasible).toBe(false);
    expect(result.feasibilityReason).toMatch(/スケジュール競合|リソース競合|期限/);
    expect(result.schedule).toBeNull();
    expect(result.constraints).toContain('schedule_conflict');
  });

  test('should calculate implementation feasibility with marginal resource allocation', () => {
    const improvementItem = {
      id: 'IMP-010',
      title: '献立生成アルゴリズムの微調整',
      description: 'アルゴリズムのパラメータチューニング',
      priorityScore: 5.5,
      businessValue: 5,
      technicalDifficulty: 2,
      userImpact: 4,
      requiredResourceCount: 1,
      estimatedDays: 3,
      dependencies: [],
      implementationDeadline: '2024-02-29',
    };

    const existingSchedule = [
      {
        itemId: 'IMP-011',
        startDate: '2024-02-20',
        endDate: '2024-02-25',
      },
    ];

    const resourceAvailability = {
      availableResourceCount: 2,
      allocationFromDate: '2024-02-01',
      allocationUntilDate: '2024-02-29',
    };

    const result = evaluateImplementationFeasibility({
      improvementItem,
      existingSchedule,
      resourceAvailability,
    });

    // Outcome: リソースが十分で、スケジュール競合がない場合は実装可能と判定
    expect(result.isFeasible).toBe(true);
    expect(result.schedule).toBeDefined();

    // 技術的実現性スコア: (10 - 2) / 10 = 0.8 = 80%
    expect(result.technicalFeasibilityScore).toBe(80);

    // 推定工数: 1 * 3 = 3 人日
    expect(result.estimatedEffort).toBe(3);

    // スケジュールは期限内に収まる
    expect(new Date(result.schedule.endDate) <= new Date(improvementItem.implementationDeadline)).toBe(true);
  });

  test('should throw error when improvement item missing required fields', () => {
    const incompleteItem = {
      id: 'IMP-012',
      title: 'テスト改善項目',
      // priorityScore, businessValue等が不足
      technicalDifficulty: 3,
      requiredResourceCount: 2,
      estimatedDays: 5,
    };

    const existingSchedule = [];
    const resourceAvailability = {
      availableResourceCount: 3,
      allocationFromDate: '2024-02-01',
      allocationUntilDate: '2024-03-31',
    };

    expect(() =>
      evaluateImplementationFeasibility({
        improvementItem: incompleteItem as any,
        existingSchedule,
        resourceAvailability,
      })
    ).toThrow(/必須項目|パラメータ|入力値/);
  });

  test('should throw error when resource availability is invalid', () => {
    const improvementItem = {
      id: 'IMP-013',
      title: '食費管理機能の強化',
      description: '月次食費予算管理の改善',
      priorityScore: 7.0,
      businessValue: 7,
      technicalDifficulty: 3,
      userImpact: 6,
      requiredResourceCount: 2,
      estimatedDays: 5,
      dependencies: [],
      implementationDeadline: '2024-03-15',
    };

    const existingSchedule = [];
    const invalidResourceAvailability = {
      availableResourceCount: -1,
      allocationFromDate: '2024-02-01',
      allocationUntilDate: '2024-03-31',
    };

    expect(() =>
      evaluateImplementationFeasibility({
        improvementItem,
        existingSchedule,
        resourceAvailability: invalidResourceAvailability,
      })
    ).toThrow(/リソース数|有効性|制約/);
  });

  test('should prioritize implementation items based on feasibility and value', () => {
    const improvementItems = [
      {
        id: 'IMP-014',
        title: 'アイテムA',
        description: 'テスト用改善項目',
        priorityScore: 8.5,
        businessValue: 9,
        technicalDifficulty: 2,
        userImpact: 8,
        requiredResourceCount: 1,
        estimatedDays: 3,
        dependencies: [],
        implementationDeadline: '2024-02-29',
      },
      {
        id: 'IMP-015',
        title: 'アイテムB',
        description: 'テスト用改善項目',
        priorityScore: 6.0,
        businessValue: 6,
        technicalDifficulty: 8,
        userImpact: 5,
        requiredResourceCount: 4,
        estimatedDays: 15,
        dependencies: [],
        implementationDeadline: '2024-02-29',
      },
    ];

    const existingSchedule = [];
    const resourceAvailability = {
      availableResourceCount: 3,
      allocationFromDate: '2024-02-01',
      allocationUntilDate: '2024-03-31',
    };

    const results = improvementItems.map((item) =>
      evaluateImplementationFeasibility({
        improvementItem: item,
        existingSchedule,
        resourceAvailability,
      })
    );

    // Outcome: 実装可能な項目が優先される
    const feasibleResults = results.filter((r) => r.isFeasible);
    expect(feasibleResults.length).toBe(1);
    expect(feasibleResults[0].improvementItemId).toBe('IMP-014');

    // 不可能な項目はスケジュールが生成されない
    const infeasibleResult = results.find((r) => !r.isFeasible);
    expect(infeasibleResult).toBeDefined();
    expect(infeasibleResult.schedule).toBeNull();
  });
});