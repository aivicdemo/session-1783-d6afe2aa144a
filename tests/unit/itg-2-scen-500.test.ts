import { createImplementationPlan } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養基準ロジック改善提案の優先度付けと開発チーム提出 - 実装計画策定', () => {
  // SCEN-500: [error] 実装計画策定 - 無効な改善項目IDに対してエラーを返す
  test('無効な改善項目IDでエラーレスポンスが返される', async () => {
    const invalidImprovementItemIds = [999999, -1, 0];

    for (const invalidId of invalidImprovementItemIds) {
      expect(() =>
        createImplementationPlan({
          improvement_item_id: invalidId,
          estimated_implementation_days: 5,
          expected_effect_score: 85,
          kpi_contribution_percentage: 15,
          priority_rank: 'high',
          technical_feasibility: 'feasible',
          planned_sprint_start_date: '2024-02-01',
          planned_sprint_end_date: '2024-02-14',
          assigned_developer_count: 2,
          dependency_improvement_ids: [],
        })
      ).toThrow(/改善項目ID/);
    }
  });

  test('null や空文字列の改善項目IDでエラーが発生する', () => {
    expect(() =>
      createImplementationPlan({
        improvement_item_id: null as any,
        estimated_implementation_days: 5,
        expected_effect_score: 85,
        kpi_contribution_percentage: 15,
        priority_rank: 'high',
        technical_feasibility: 'feasible',
        planned_sprint_start_date: '2024-02-01',
        planned_sprint_end_date: '2024-02-14',
        assigned_developer_count: 2,
        dependency_improvement_ids: [],
      })
    ).toThrow(/改善項目ID/);

    expect(() =>
      createImplementationPlan({
        improvement_item_id: '' as any,
        estimated_implementation_days: 5,
        expected_effect_score: 85,
        kpi_contribution_percentage: 15,
        priority_rank: 'high',
        technical_feasibility: 'feasible',
        planned_sprint_start_date: '2024-02-01',
        planned_sprint_end_date: '2024-02-14',
        assigned_developer_count: 2,
        dependency_improvement_ids: [],
      })
    ).toThrow(/改善項目ID/);
  });

  test('有効な改善項目IDで実装計画が正常に作成される', () => {
    const result = createImplementationPlan({
      improvement_item_id: 1,
      estimated_implementation_days: 5,
      expected_effect_score: 85,
      kpi_contribution_percentage: 15,
      priority_rank: 'high',
      technical_feasibility: 'feasible',
      planned_sprint_start_date: '2024-02-01',
      planned_sprint_end_date: '2024-02-14',
      assigned_developer_count: 2,
      dependency_improvement_ids: [],
    });

    expect(result).toBeDefined();
    expect(result.improvement_item_id).toBe(1);
    expect(result.estimated_implementation_days).toBe(5);
    expect(result.expected_effect_score).toBe(85);
    expect(result.kpi_contribution_percentage).toBe(15);
    expect(result.priority_rank).toBe('high');
    expect(result.technical_feasibility).toBe('feasible');
    expect(result.planned_sprint_start_date).toBe('2024-02-01');
    expect(result.planned_sprint_end_date).toBe('2024-02-14');
    expect(result.assigned_developer_count).toBe(2);
    expect(result.dependency_improvement_ids).toEqual([]);
  });

  test('複数の依存関係を持つ有効な改善項目IDで計画が作成される', () => {
    const result = createImplementationPlan({
      improvement_item_id: 5,
      estimated_implementation_days: 10,
      expected_effect_score: 75,
      kpi_contribution_percentage: 20,
      priority_rank: 'medium',
      technical_feasibility: 'feasible',
      planned_sprint_start_date: '2024-03-01',
      planned_sprint_end_date: '2024-03-21',
      assigned_developer_count: 3,
      dependency_improvement_ids: [1, 2, 3],
    });

    expect(result).toBeDefined();
    expect(result.improvement_item_id).toBe(5);
    expect(result.estimated_implementation_days).toBe(10);
    expect(result.expected_effect_score).toBe(75);
    expect(result.kpi_contribution_percentage).toBe(20);
    expect(result.priority_rank).toBe('medium');
    expect(result.technical_feasibility).toBe('feasible');
    expect(result.dependency_improvement_ids).toEqual([1, 2, 3]);
  });
});