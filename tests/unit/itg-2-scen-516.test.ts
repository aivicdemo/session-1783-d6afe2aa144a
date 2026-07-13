import { dedupAndMergeImprovementIssues } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善課題リストの重複排除と統合', () => {
  test('SCEN-516: 重複する改善課題が排除され、関連課題が統合された一意なリストが生成される', () => {
    // 前提: 栄養士が改善課題リストを作成し、重複と関連課題が混在している状態
    const inputIssueList = [
      {
        id: 'ISSUE-001',
        title: 'タンパク質摂取量の目標値設定',
        description: 'ユーザーの朝食時のタンパク質摂取が目標値を下回っている',
        affectedNutrientItems: ['protein'],
        affectedUserSegments: ['stay_at_home_parent'],
        affectedRestrictTypes: ['none'],
        impactScore: 8,
        technicalDifficulty: 3,
        userImpact: 7,
      },
      {
        id: 'ISSUE-002',
        title: 'タンパク質摂取量の目標値設定',
        description: 'ユーザーの朝食時のタンパク質摂取が目標値を下回っている',
        affectedNutrientItems: ['protein'],
        affectedUserSegments: ['stay_at_home_parent'],
        affectedRestrictTypes: ['none'],
        impactScore: 8,
        technicalDifficulty: 3,
        userImpact: 7,
      },
      {
        id: 'ISSUE-003',
        title: 'タンパク質摂取量の改善',
        description: '朝食のタンパク質含有量が不足している問題を改善',
        affectedNutrientItems: ['protein'],
        affectedUserSegments: ['stay_at_home_parent'],
        affectedRestrictTypes: ['none'],
        impactScore: 8,
        technicalDifficulty: 3,
        userImpact: 7,
      },
      {
        id: 'ISSUE-004',
        title: 'ビタミンB群摂取量の目標値設定',
        description: 'ユーザーの昼食時のビタミンB群摂取が不足している',
        affectedNutrientItems: ['vitamin_b1', 'vitamin_b2', 'vitamin_b6'],
        affectedUserSegments: ['stay_at_home_parent', 'working_parent'],
        affectedRestrictTypes: ['gluten_free'],
        impactScore: 6,
        technicalDifficulty: 4,
        userImpact: 5,
      },
      {
        id: 'ISSUE-005',
        title: 'ビタミンB群摂取量の目標値設定',
        description: 'ユーザーの昼食時のビタミンB群摂取が不足している',
        affectedNutrientItems: ['vitamin_b1', 'vitamin_b2', 'vitamin_b6'],
        affectedUserSegments: ['stay_at_home_parent', 'working_parent'],
        affectedRestrictTypes: ['gluten_free'],
        impactScore: 6,
        technicalDifficulty: 4,
        userImpact: 5,
      },
      {
        id: 'ISSUE-006',
        title: 'カルシウム摂取量の改善',
        description: 'カルシウム摂取が推奨値に達していない',
        affectedNutrientItems: ['calcium'],
        affectedUserSegments: ['stay_at_home_parent'],
        affectedRestrictTypes: ['dairy_free'],
        impactScore: 7,
        technicalDifficulty: 2,
        userImpact: 6,
      },
    ];

    // 実行: 重複排除と統合処理を実行する
    const result = dedupAndMergeImprovementIssues(inputIssueList);

    // 検証1: 返り値が配列であること
    expect(Array.isArray(result)).toBe(true);

    // 検証2: 重複が完全に排除されていること
    // 入力6件 → ISSUE-001/002/003は同一課題 → ISSUE-004/005は同一課題 → ISSUE-006は単独
    // 期待: 3件の統合課題
    expect(result.length).toBe(3);

    // 検証3: 各改善課題が一意であること（IDの重複がないこと）
    const resultIds = result.map((issue) => issue.id);
    const uniqueIds = new Set(resultIds);
    expect(uniqueIds.size).toBe(result.length);

    // 検証4: 統合後の改善課題の詳細情報が正確に保持されていることを検証
    // タンパク質関連の統合課題（ISSUE-001, 002, 003 をマージ）
    const proteinIssue = result.find((issue) =>
      issue.affectedNutrientItems.includes('protein'),
    );
    expect(proteinIssue).toBeDefined();
    expect(proteinIssue?.affectedNutrientItems).toEqual(['protein']);
    expect(proteinIssue?.affectedUserSegments).toContain('stay_at_home_parent');
    expect(proteinIssue?.impactScore).toBe(8);
    expect(proteinIssue?.technicalDifficulty).toBe(3);
    expect(proteinIssue?.userImpact).toBe(7);

    // ビタミンB群関連の統合課題（ISSUE-004, 005 をマージ）
    const vitaminBIssue = result.find((issue) =>
      issue.affectedNutrientItems.includes('vitamin_b1'),
    );
    expect(vitaminBIssue).toBeDefined();
    expect(vitaminBIssue?.affectedNutrientItems).toContain('vitamin_b1');
    expect(vitaminBIssue?.affectedNutrientItems).toContain('vitamin_b2');
    expect(vitaminBIssue?.affectedNutrientItems).toContain('vitamin_b6');
    expect(vitaminBIssue?.affectedUserSegments).toContain('stay_at_home_parent');
    expect(vitaminBIssue?.affectedUserSegments).toContain('working_parent');
    expect(vitaminBIssue?.impactScore).toBe(6);
    expect(vitaminBIssue?.technicalDifficulty).toBe(4);
    expect(vitaminBIssue?.userImpact).toBe(5);

    // カルシウム関連の統合課題（ISSUE-006 は単独のため変更なし）
    const calciumIssue = result.find((issue) =>
      issue.affectedNutrientItems.includes('calcium'),
    );
    expect(calciumIssue).toBeDefined();
    expect(calciumIssue?.id).toBe('ISSUE-006');
    expect(calciumIssue?.affectedNutrientItems).toEqual(['calcium']);
    expect(calciumIssue?.impactScore).toBe(7);
    expect(calciumIssue?.technicalDifficulty).toBe(2);
    expect(calciumIssue?.userImpact).toBe(6);

    // 検証5: affectedUserSegments と affectedRestrictTypes が適切にマージされていること
    // タンパク質課題は全て'stay_at_home_parent'のみなので そのまま保持
    expect(proteinIssue?.affectedUserSegments).toEqual(['stay_at_home_parent']);
    expect(proteinIssue?.affectedRestrictTypes).toEqual(['none']);

    // ビタミンB群課題は複数のセグメントと制限タイプを保持
    expect(vitaminBIssue?.affectedUserSegments.sort()).toEqual(
      ['stay_at_home_parent', 'working_parent'].sort(),
    );
    expect(vitaminBIssue?.affectedRestrictTypes).toEqual(['gluten_free']);

    // 検証6: 重複排除後のリストに元の入力情報が失われていないこと
    const allNutrients = new Set<string>();
    result.forEach((issue) => {
      issue.affectedNutrientItems.forEach((nutrient) => {
        allNutrients.add(nutrient);
      });
    });
    expect(allNutrients.size).toBe(4); // protein, vitamin_b1, vitamin_b2, vitamin_b6, calcium は5個だが、ビタミン3つは1つの課題
    expect(allNutrients).toContain('protein');
    expect(allNutrients).toContain('vitamin_b1');
    expect(allNutrients).toContain('calcium');
  });
});