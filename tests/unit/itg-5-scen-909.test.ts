import { linkFailurePatternsToImprovementProposals, getImprovementProposalWithEvidence, getFailurePatternWithProposal, generateTraceabilityReport } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案 - 失敗パターンから改善提案への分類と紐付け', () => {
  // SCEN-909: [normal] 失敗パターンから改善提案への分類と紐付け
  test('改善提案に対して根拠となる失敗パターンデータが正しく紐付けられ、トレーサビリティが確保される', () => {
    // 手順1: テストデータとして複数の失敗パターン（エラーコード、エラー内容、発生日時）を準備する
    const failurePatterns = [
      {
        id: 'fp-001',
        code: 'ERR_NUTRITION_IMBALANCE',
        message: '栄養バランス不適切',
        occurrenceDate: new Date('2024-01-08T10:30:00Z'),
        category: '栄養',
        frequency: 5,
        userId: 'user-123',
      },
      {
        id: 'fp-002',
        code: 'ERR_PREFERENCE_MISMATCH',
        message: '家族好み未反映',
        occurrenceDate: new Date('2024-01-09T14:15:00Z'),
        category: '好み',
        frequency: 8,
        userId: 'user-123',
      },
      {
        id: 'fp-003',
        code: 'ERR_COOKING_TIME_EXCEED',
        message: '調理時間超過',
        occurrenceDate: new Date('2024-01-10T09:00:00Z'),
        category: '調理時間',
        frequency: 3,
        userId: 'user-123',
      },
      {
        id: 'fp-004',
        code: 'ERR_DIETARY_RESTRICTION_MISS',
        message: '食材制限漏れ',
        occurrenceDate: new Date('2024-01-11T11:45:00Z'),
        category: '食材制限',
        frequency: 2,
        userId: 'user-123',
      },
    ];

    // 手順2: 各失敗パターンに対応する改善提案を作成する
    const improvementProposals = [
      {
        id: 'ip-001',
        type: 'アルゴリズム修正',
        title: '栄養基準ロジック改善',
        description: '栄養バランス計算の精度向上',
        kpiContribution: 25,
        implementationDifficulty: 3,
        userImpact: 4,
        targetFailurePatternIds: ['fp-001'],
        priority: 1,
        createdDate: new Date('2024-01-12T08:00:00Z'),
        createdBy: 'pm-456',
      },
      {
        id: 'ip-002',
        type: 'パラメータ調整',
        title: '家族嗜好学習パラメータ調整',
        description: '家族の食事評価データからの嗜好学習精度を向上',
        kpiContribution: 30,
        implementationDifficulty: 2,
        userImpact: 5,
        targetFailurePatternIds: ['fp-002'],
        priority: 1,
        createdDate: new Date('2024-01-12T09:30:00Z'),
        createdBy: 'pm-456',
      },
      {
        id: 'ip-003',
        type: 'アルゴリズム修正',
        title: '調理時間制約の厳格化',
        description: '調理時間制約をアルゴリズム生成時に最優先で考慮',
        kpiContribution: 15,
        implementationDifficulty: 2,
        userImpact: 3,
        targetFailurePatternIds: ['fp-003'],
        priority: 2,
        createdDate: new Date('2024-01-12T10:15:00Z'),
        createdBy: 'pm-456',
      },
      {
        id: 'ip-004',
        type: '新機能',
        title: '食材制限チェック機能の強化',
        description: '献立生成前に食材制限を多重チェック',
        kpiContribution: 20,
        implementationDifficulty: 4,
        userImpact: 4,
        targetFailurePatternIds: ['fp-004'],
        priority: 2,
        createdDate: new Date('2024-01-12T11:00:00Z'),
        createdBy: 'pm-456',
      },
    ];

    // 手順3: 失敗パターンと改善提案の紐付け処理を実行する
    const linkResult = linkFailurePatternsToImprovementProposals({
      failurePatterns,
      improvementProposals,
      linkTimestamp: new Date('2024-01-12T15:00:00Z'),
      linkedBy: 'dev-789',
    });

    // 検証: 紐付けが正常に完了したか
    expect(linkResult).toEqual(
      expect.objectContaining({
        success: true,
        totalLinksCreated: 4,
        failurePatternsProcessed: 4,
        improvementProposalsProcessed: 4,
      })
    );

    // 手順4: 紐付けられた改善提案から根拠となる失敗パターンデータを取得する
    const retrievedProposal = getImprovementProposalWithEvidence({
      proposalId: 'ip-001',
      includeEvidence: true,
    });

    // 手順5: 取得した失敗パターンデータが元データと完全に一致することを検証する
    expect(retrievedProposal).toEqual(
      expect.objectContaining({
        id: 'ip-001',
        type: 'アルゴリズム修正',
        title: '栄養基準ロジック改善',
        description: '栄養バランス計算の精度向上',
        kpiContribution: 25,
        implementationDifficulty: 3,
        userImpact: 4,
        priority: 1,
        linkedEvidence: expect.arrayContaining([
          expect.objectContaining({
            failurePatternId: 'fp-001',
            code: 'ERR_NUTRITION_IMBALANCE',
            message: '栄養バランス不適切',
            category: '栄養',
            frequency: 5,
          }),
        ]),
      })
    );

    // 手順6: 改善提案ごとに複数の失敗パターンが紐付けられている場合、すべての根拠データが正しく取得されることを確認する
    const multiPatternProposal = getImprovementProposalWithEvidence({
      proposalId: 'ip-002',
      includeEvidence: true,
    });

    expect(multiPatternProposal.linkedEvidence).toBeDefined();
    expect(multiPatternProposal.linkedEvidence.length).toBeGreaterThanOrEqual(1);
    expect(multiPatternProposal.linkedEvidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          failurePatternId: 'fp-002',
          code: 'ERR_PREFERENCE_MISMATCH',
          message: '家族好み未反映',
          category: '好み',
        }),
      ])
    );

    // 手順7: 紐付けの双方向性を検証し、失敗パターン側からも対応する改善提案へアクセスできることを確認する
    const failurePatternView = getFailurePatternWithProposal({
      failurePatternId: 'fp-001',
      includeLinkedProposals: true,
    });

    expect(failurePatternView).toEqual(
      expect.objectContaining({
        id: 'fp-001',
        code: 'ERR_NUTRITION_IMBALANCE',
        message: '栄養バランス不適切',
        category: '栄養',
        frequency: 5,
        linkedProposals: expect.arrayContaining([
          expect.objectContaining({
            proposalId: 'ip-001',
            title: '栄養基準ロジック改善',
            type: 'アルゴリズム修正',
            priority: 1,
          }),
        ]),
      })
    );

    // 手順8: トレーサビリティレポート機能を実行し、失敗パターン→改善提案の対応関係が正確に表示されることを確認する
    const traceabilityReport = generateTraceabilityReport({
      reportType: 'failure_to_proposal_mapping',
      startDate: new Date('2024-01-08T00:00:00Z'),
      endDate: new Date('2024-01-12T23:59:59Z'),
      userId: 'user-123',
    });

    expect(traceabilityReport).toEqual(
      expect.objectContaining({
        reportId: expect.any(String),
        reportType: 'failure_to_proposal_mapping',
        generatedDate: expect.any(String),
        mappingRecords: expect.arrayContaining([
          expect.objectContaining({
            failurePatternId: 'fp-001',
            failureCode: 'ERR_NUTRITION_IMBALANCE',
            failureCategory: '栄養',
            linkedProposalIds: ['ip-001'],
            proposalTypes: ['アルゴリズム修正'],
            linkTimestamp: expect.any(String),
            linkedBy: 'dev-789',
          }),
          expect.objectContaining({
            failurePatternId: 'fp-002',
            failureCode: 'ERR_PREFERENCE_MISMATCH',
            failureCategory: '好み',
            linkedProposalIds: ['ip-002'],
            proposalTypes: ['パラメータ調整'],
            linkTimestamp: expect.any(String),
            linkedBy: 'dev-789',
          }),
          expect.objectContaining({
            failurePatternId: 'fp-003',
            failureCode: 'ERR_COOKING_TIME_EXCEED',
            failureCategory: '調理時間',
            linkedProposalIds: ['ip-003'],
            proposalTypes: ['アルゴリズム修正'],
            linkTimestamp: expect.any(String),
            linkedBy: 'dev-789',
          }),
          expect.objectContaining({
            failurePatternId: 'fp-004',
            failureCode: 'ERR_DIETARY_RESTRICTION_MISS',
            failureCategory: '食材制限',
            linkedProposalIds: ['ip-004'],
            proposalTypes: ['新機能'],
            linkTimestamp: expect.any(String),
            linkedBy: 'dev-789',
          }),
        ]),
        totalMappings: 4,
        traceabilityStatus: '完全',
      })
    );

    // 手順9: 紐付け関連の権限や履歴情報が正しく記録されていることを検証する
    expect(traceabilityReport.mappingRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          failurePatternId: expect.any(String),
          linkedProposalIds: expect.any(Array),
          linkTimestamp: expect.any(String),
          linkedBy: 'dev-789',
          linkChangeHistory: expect.arrayContaining([
            expect.objectContaining({
              action: 'link_created',
              timestamp: expect.any(String),
              actor: 'dev-789',
            }),
          ]),
        }),
      ])
    );

    // 最終検証: トレーサビリティが完全に確保されていることを確認
    expect(traceabilityReport.traceabilityStatus).toBe('完全');
    expect(traceabilityReport.totalMappings).toBe(4);

    // 各改善提案に対して少なくとも1つの失敗パターンが紐付けられていることを確認
    improvementProposals.forEach((proposal) => {
      const proposalRecords = traceabilityReport.mappingRecords.filter((record) =>
        record.linkedProposalIds.includes(proposal.id)
      );
      expect(proposalRecords.length).toBeGreaterThanOrEqual(1);
    });

    // 各失敗パターンに対して少なくとも1つの改善提案が紐付けられていることを確認
    failurePatterns.forEach((pattern) => {
      const patternRecords = traceabilityReport.mappingRecords.filter(
        (record) => record.failurePatternId === pattern.id
      );
      expect(patternRecords.length).toBeGreaterThanOrEqual(1);
    });
  });
});