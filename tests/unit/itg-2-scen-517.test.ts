import { mergeAndDeduplicateImprovementIssues } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-517
  test('改善課題リストの重複排除と統合 - 統合対象の課題が見つからない場合、空リストが返却されエラーが発生する', () => {
    const improvementIssues = [
      {
        issueId: 'ISS001',
        title: 'タンパク質摂取量の推奨値調整',
        category: '栄養項目',
        affectedUserSegments: ['高年齢層'],
        affectedFoodRestrictionTypes: ['制限なし'],
        description: '高年齢層のタンパク質推奨値を現行値から20%引き上げる',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        createdBy: 'nutritionist_001'
      },
      {
        issueId: 'ISS002',
        title: 'ビタミンD不足対策',
        category: '栄養項目',
        affectedUserSegments: ['全セグメント'],
        affectedFoodRestrictionTypes: ['ビーガン'],
        description: 'ビーガン対応献立でのビタミンD補強食材を追加',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        createdBy: 'nutritionist_001'
      },
      {
        issueId: 'ISS003',
        title: 'タンパク質摂取量の推奨値調整',
        category: '栄養項目',
        affectedUserSegments: ['高年齢層'],
        affectedFoodRestrictionTypes: ['制限なし'],
        description: '高年齢層のタンパク質推奨値を現行値から20%引き上げる',
        createdAt: new Date('2024-01-15T11:00:00Z'),
        createdBy: 'nutritionist_002'
      }
    ];

    const targetIssueIdsToMerge = ['ISS001', 'ISS003'];
    const nonExistentIssueId = 'ISS999';

    // 正常系: 存在する課題IDで重複排除・統合を実行
    const mergedResultValid = mergeAndDeduplicateImprovementIssues(
      improvementIssues,
      targetIssueIdsToMerge
    );

    expect(mergedResultValid).toEqual({
      success: true,
      mergedIssue: {
        issueId: 'ISS001',
        title: 'タンパク質摂取量の推奨値調整',
        category: '栄養項目',
        affectedUserSegments: ['高年齢層'],
        affectedFoodRestrictionTypes: ['制限なし'],
        description: '高年齢層のタンパク質推奨値を現行値から20%引き上げる',
        relatedIssueIds: ['ISS003'],
        mergedCount: 2,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        createdBy: 'nutritionist_001'
      },
      removedDuplicateIds: ['ISS003'],
      remainingIssues: [
        {
          issueId: 'ISS002',
          title: 'ビタミンD不足対策',
          category: '栄養項目',
          affectedUserSegments: ['全セグメント'],
          affectedFoodRestrictionTypes: ['ビーガン'],
          description: 'ビーガン対応献立でのビタミンD補強食材を追加',
          createdAt: new Date('2024-01-15T10:30:00Z'),
          createdBy: 'nutritionist_001'
        }
      ]
    });

    // 異常系: 存在しない課題IDで統合を試みた場合
    const mergedResultInvalid = mergeAndDeduplicateImprovementIssues(
      improvementIssues,
      [nonExistentIssueId]
    );

    expect(mergedResultInvalid).toEqual({
      success: false,
      error: {
        code: 'ISSUE_NOT_FOUND',
        message: '指定された課題IDが見つかりません',
        notFoundIssueIds: ['ISS999']
      },
      mergedIssue: null,
      removedDuplicateIds: [],
      remainingIssues: improvementIssues
    });

    // 異常系: 複数指定した課題ID中に一部存在しないものがある場合
    const partialNotFoundIds = ['ISS001', 'ISS999'];
    const mergedResultPartial = mergeAndDeduplicateImprovementIssues(
      improvementIssues,
      partialNotFoundIds
    );

    expect(mergedResultPartial).toEqual({
      success: false,
      error: {
        code: 'PARTIAL_ISSUE_NOT_FOUND',
        message: '指定された課題IDの一部が見つかりません',
        notFoundIssueIds: ['ISS999'],
        foundIssueIds: ['ISS001']
      },
      mergedIssue: null,
      removedDuplicateIds: [],
      remainingIssues: improvementIssues
    });

    // 異常系: 空の統合対象リストを指定した場合
    const mergedResultEmpty = mergeAndDeduplicateImprovementIssues(
      improvementIssues,
      []
    );

    expect(mergedResultEmpty).toEqual({
      success: false,
      error: {
        code: 'EMPTY_MERGE_LIST',
        message: '統合対象の課題IDが指定されていません'
      },
      mergedIssue: null,
      removedDuplicateIds: [],
      remainingIssues: improvementIssues
    });

    // エラー時のスロー検証: 入力が null の場合
    expect(() => {
      mergeAndDeduplicateImprovementIssues(null as any, ['ISS001']);
    }).toThrow(/入力データ/);

    // エラー時のスロー検証: 課題ID配列が null の場合
    expect(() => {
      mergeAndDeduplicateImprovementIssues(improvementIssues, null as any);
    }).toThrow(/課題ID/);
  });
});