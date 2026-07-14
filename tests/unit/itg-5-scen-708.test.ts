import { describe, it, expect, beforeEach } from '@jest/globals';
import { integrateAndDeduplicateImprovementIssues } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-708
  it('改善課題統合・重複排除機能 - 影響範囲データが不完全な改善課題が混在する場合、不完全なデータの課題が適切に処理される', () => {
    // 完全なデータを持つ改善課題3件を準備
    const completeIssues = [
      {
        issue_id: 'ISS-001',
        title: '栄養バランス改善',
        impact_scope: {
          nutrition_items: ['カルシウム', 'タンパク質'],
          user_segments: ['20代_単身', '30代_子2名'],
          food_restriction_types: ['ベジタリアン'],
        },
        data_completeness_flag: true,
      },
      {
        issue_id: 'ISS-002',
        title: '調理時間最適化',
        impact_scope: {
          nutrition_items: ['全栄養素'],
          user_segments: ['40代以上_大家族'],
          food_restriction_types: ['アレルギー対応'],
        },
        data_completeness_flag: true,
      },
      {
        issue_id: 'ISS-003',
        title: '家族好み反映',
        impact_scope: {
          nutrition_items: ['その他'],
          user_segments: ['30代_子1名'],
          food_restriction_types: ['制限なし'],
        },
        data_completeness_flag: true,
      },
    ];

    // 影響範囲データが不完全な改善課題5件を準備
    const incompleteIssues = [
      {
        issue_id: 'ISS-004',
        title: '予算制約反映',
        impact_scope: {
          nutrition_items: null,
          user_segments: ['20代_単身'],
          food_restriction_types: ['ベジタリアン'],
        },
        data_completeness_flag: false,
      },
      {
        issue_id: 'ISS-005',
        title: '食材在庫確認',
        impact_scope: {
          nutrition_items: [],
          user_segments: undefined,
          food_restriction_types: ['アレルギー対応'],
        },
        data_completeness_flag: false,
      },
      {
        issue_id: 'ISS-006',
        title: '献立多様化',
        impact_scope: {
          nutrition_items: ['ビタミンC'],
          user_segments: [],
          food_restriction_types: null,
        },
        data_completeness_flag: false,
      },
      {
        issue_id: 'ISS-007',
        title: '季節対応',
        impact_scope: null as any,
        data_completeness_flag: false,
      },
      {
        issue_id: 'ISS-008',
        title: '割引情報連携',
        impact_scope: {
          nutrition_items: undefined,
          user_segments: undefined,
          food_restriction_types: undefined,
        },
        data_completeness_flag: false,
      },
    ];

    // 完全なデータと不完全なデータが混在した改善課題群を入力
    const mixed_issues = [...completeIssues, ...incompleteIssues];

    // 処理を実行
    const result = integrateAndDeduplicateImprovementIssues(mixed_issues);

    // (1) システムがエラーをスローしない（try-catchで確認）
    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    // (2) 不完全なデータを持つ課題が明確にマーク・フラグ付けされている
    const processedIncomplete = result.processed_issues.filter(
      (issue: any) => issue.data_completeness_flag === false,
    );
    expect(processedIncomplete.length).toBe(5);
    processedIncomplete.forEach((issue: any) => {
      expect(issue.incomplete_data_marker).toBe(true);
      expect(issue.incomplete_fields).toBeDefined();
      expect(Array.isArray(issue.incomplete_fields)).toBe(true);
      expect(issue.incomplete_fields.length).toBeGreaterThan(0);
    });

    // (3) 完全なデータを持つ課題との区別が明確である
    const processedComplete = result.processed_issues.filter(
      (issue: any) => issue.data_completeness_flag === true,
    );
    expect(processedComplete.length).toBe(3);
    processedComplete.forEach((issue: any) => {
      expect(issue.incomplete_data_marker).toBe(false);
      expect(issue.incomplete_fields).toEqual([]);
    });

    // (4) 処理ログに不完全データの詳細情報が記録されている
    expect(result.processing_log).toBeDefined();
    expect(Array.isArray(result.processing_log)).toBe(true);
    const incompleteDataLogs = result.processing_log.filter(
      (log: any) =>
        log.issue_id &&
        ['ISS-004', 'ISS-005', 'ISS-006', 'ISS-007', 'ISS-008'].includes(
          log.issue_id,
        ),
    );
    expect(incompleteDataLogs.length).toBe(5);
    incompleteDataLogs.forEach((log: any) => {
      expect(log.status).toBe('processed_with_incomplete_data');
      expect(log.missing_fields).toBeDefined();
      expect(Array.isArray(log.missing_fields)).toBe(true);
      expect(log.timestamp).toBeDefined();
    });

    // (5) 統合・重複排除処理の完全性が維持されている
    expect(result.total_input_count).toBe(8);
    expect(result.deduplicated_count).toBe(8); // 8件すべてがユニーク
    expect(result.merged_count).toBe(0); // 重複がないため統合なし
    expect(result.processed_issues.length).toBe(8);

    // 不完全データの詳細検証
    const iss004 = result.processed_issues.find(
      (issue: any) => issue.issue_id === 'ISS-004',
    );
    expect(iss004.incomplete_fields).toContain('nutrition_items');

    const iss005 = result.processed_issues.find(
      (issue: any) => issue.issue_id === 'ISS-005',
    );
    expect(iss005.incomplete_fields).toContain('user_segments');

    const iss006 = result.processed_issues.find(
      (issue: any) => issue.issue_id === 'ISS-006',
    );
    expect(iss006.incomplete_fields).toContain('food_restriction_types');

    const iss007 = result.processed_issues.find(
      (issue: any) => issue.issue_id === 'ISS-007',
    );
    expect(iss007.incomplete_fields).toContain('impact_scope');

    const iss008 = result.processed_issues.find(
      (issue: any) => issue.issue_id === 'ISS-008',
    );
    expect(iss008.incomplete_fields.length).toBe(3);

    // メタデータの検証
    expect(result.metadata).toBeDefined();
    expect(result.metadata.complete_data_count).toBe(3);
    expect(result.metadata.incomplete_data_count).toBe(5);
    expect(result.metadata.incomplete_data_ratio).toBe(0.625);
    expect(result.metadata.processing_timestamp).toBeDefined();
  });
});