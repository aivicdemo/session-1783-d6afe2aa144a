import { validateNutritionistImprovementProposal } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士による改善案検証評価 - 検証基準未定義時のバリデーション', () => {
  // SCEN-582
  test('検証基準が未定義の場合にバリデーションエラーが発生し、入力済みデータが保持される', () => {
    const improvementProposalWithoutCriteria = {
      proposalId: 'PROP-20240115-001',
      proposalName: '塩分摂取量の基準値改善',
      proposalDescription: '高血圧予防のため1日あたりの塩分摂取目標を6g以下に設定する改善提案',
      nutritionistId: 'NUT-20240001',
      affectedNutritionItems: ['ナトリウム'],
      affectedUserSegments: ['40代以上'],
      affectedDietaryRestrictionTypes: ['高血圧'],
      proposalPriority: 8,
      businessValue: 7,
      technicalDifficulty: 4,
      userImpactScore: 9,
      totalPriorityScore: 8.0,
      verificationCriteria: undefined,
      expectedEffectDescription: '高血圧予防効果の向上により、ユーザー満足度が5%向上',
      implementationEstimate: 8,
      kpiContribution: '栄養基準達成率向上: +3%',
      submittedAt: new Date('2024-01-15T10:30:00Z'),
    };

    expect(() => validateNutritionistImprovementProposal(improvementProposalWithoutCriteria))
      .toThrow(/検証基準/);
  });

  test('検証基準がnullの場合もバリデーションエラーが発生する', () => {
    const improvementProposalWithNullCriteria = {
      proposalId: 'PROP-20240115-002',
      proposalName: 'タンパク質摂取量の基準値改善',
      proposalDescription: '筋力維持のためタンパク質摂取目標を調整',
      nutritionistId: 'NUT-20240002',
      affectedNutritionItems: ['タンパク質'],
      affectedUserSegments: ['高齢者'],
      affectedDietaryRestrictionTypes: [],
      proposalPriority: 7,
      businessValue: 6,
      technicalDifficulty: 3,
      userImpactScore: 8,
      totalPriorityScore: 7.0,
      verificationCriteria: null,
      expectedEffectDescription: '筋力維持効果により、栄養基準達成率向上',
      implementationEstimate: 6,
      kpiContribution: '栄養基準達成率向上: +2%',
      submittedAt: new Date('2024-01-15T11:00:00Z'),
    };

    expect(() => validateNutritionistImprovementProposal(improvementProposalWithNullCriteria))
      .toThrow(/検証基準/);
  });

  test('検証基準が空文字列の場合もバリデーションエラーが発生する', () => {
    const improvementProposalWithEmptyCriteria = {
      proposalId: 'PROP-20240115-003',
      proposalName: 'カルシウム摂取量の基準値改善',
      proposalDescription: '骨健康維持のためカルシウム摂取目標を改善',
      nutritionistId: 'NUT-20240003',
      affectedNutritionItems: ['カルシウム'],
      affectedUserSegments: ['女性'],
      affectedDietaryRestrictionTypes: [],
      proposalPriority: 6,
      businessValue: 5,
      technicalDifficulty: 2,
      userImpactScore: 7,
      totalPriorityScore: 6.0,
      verificationCriteria: '',
      expectedEffectDescription: '骨密度維持効果により、健康度向上',
      implementationEstimate: 5,
      kpiContribution: '栄養基準達成率向上: +1.5%',
      submittedAt: new Date('2024-01-15T11:30:00Z'),
    };

    expect(() => validateNutritionistImprovementProposal(improvementProposalWithEmptyCriteria))
      .toThrow(/検証基準/);
  });

  test('検証基準が正常に定義されている場合は成功し、入力データが返される', () => {
    const validImprovementProposal = {
      proposalId: 'PROP-20240115-004',
      proposalName: '鉄分摂取量の基準値改善',
      proposalDescription: '貧血予防のため鉄分摂取目標を改善する提案',
      nutritionistId: 'NUT-20240004',
      affectedNutritionItems: ['鉄'],
      affectedUserSegments: ['女性、若年層'],
      affectedDietaryRestrictionTypes: [],
      proposalPriority: 8,
      businessValue: 7,
      technicalDifficulty: 3,
      userImpactScore: 8,
      totalPriorityScore: 8.0,
      verificationCriteria: '毎月の栄養摂取データ集計時に達成度を測定し、改善前後で比較。達成率が3%以上向上することを基準とする。',
      expectedEffectDescription: '貧血予防効果により、ユーザー健康度が向上',
      implementationEstimate: 7,
      kpiContribution: '栄養基準達成率向上: +2.5%',
      submittedAt: new Date('2024-01-15T12:00:00Z'),
    };

    const result = validateNutritionistImprovementProposal(validImprovementProposal);

    expect(result).toEqual({
      isValid: true,
      proposalId: 'PROP-20240115-004',
      proposalName: '鉄分摂取量の基準値改善',
      proposalDescription: '貧血予防のため鉄分摂取目標を改善する提案',
      nutritionistId: 'NUT-20240004',
      affectedNutritionItems: ['鉄'],
      affectedUserSegments: ['女性、若年層'],
      affectedDietaryRestrictionTypes: [],
      proposalPriority: 8,
      businessValue: 7,
      technicalDifficulty: 3,
      userImpactScore: 8,
      totalPriorityScore: 8.0,
      verificationCriteria: '毎月の栄養摂取データ集計時に達成度を測定し、改善前後で比較。達成率が3%以上向上することを基準とする。',
      expectedEffectDescription: '貧血予防効果により、ユーザー健康度が向上',
      implementationEstimate: 7,
      kpiContribution: '栄養基準達成率向上: +2.5%',
      submittedAt: new Date('2024-01-15T12:00:00Z'),
      validatedAt: expect.any(Date),
    });
  });

  test('複数の改善提案を同時に検証する場合、検証基準が未定義のものだけがエラーになる', () => {
    const proposal1_valid = {
      proposalId: 'PROP-20240115-005',
      proposalName: 'ビタミンD摂取量改善',
      proposalDescription: 'ビタミンD摂取目標を改善する提案',
      nutritionistId: 'NUT-20240005',
      affectedNutritionItems: ['ビタミンD'],
      affectedUserSegments: ['全年代'],
      affectedDietaryRestrictionTypes: [],
      proposalPriority: 7,
      businessValue: 6,
      technicalDifficulty: 2,
      userImpactScore: 7,
      totalPriorityScore: 7.0,
      verificationCriteria: '月次栄養摂取データで達成度を測定し、改善率2%以上を基準とする。',
      expectedEffectDescription: 'ビタミンD不足改善による健康度向上',
      implementationEstimate: 4,
      kpiContribution: '栄養基準達成率向上: +1.8%',
      submittedAt: new Date('2024-01-15T12:30:00Z'),
    };

    const proposal2_invalid = {
      proposalId: 'PROP-20240115-006',
      proposalName: 'マグネシウム摂取量改善',
      proposalDescription: 'マグネシウム摂取目標を改善する提案',
      nutritionistId: 'NUT-20240005',
      affectedNutritionItems: ['マグネシウム'],
      affectedUserSegments: ['全年代'],
      affectedDietaryRestrictionTypes: [],
      proposalPriority: 6,
      businessValue: 5,
      technicalDifficulty: 2,
      userImpactScore: 6,
      totalPriorityScore: 6.0,
      verificationCriteria: undefined,
      expectedEffectDescription: 'マグネシウム不足改善による健康度向上',
      implementationEstimate: 3,
      kpiContribution: '栄養基準達成率向上: +1.2%',
      submittedAt: new Date('2024-01-15T13:00:00Z'),
    };

    expect(validateNutritionistImprovementProposal(proposal1_valid)).toMatchObject({
      isValid: true,
      proposalId: 'PROP-20240115-005',
    });

    expect(() => validateNutritionistImprovementProposal(proposal2_invalid))
      .toThrow(/検証基準/);
  });

  test('検証基準が定義されている場合、他の必須フィールドが未定義でもバリデーションエラーが検証基準に関連するものではない', () => {
    const proposalWithMissingOtherField = {
      proposalId: 'PROP-20240115-007',
      proposalName: '',
      proposalDescription: '亜鉛摂取目標を改善する提案',
      nutritionistId: 'NUT-20240006',
      affectedNutritionItems: ['亜鉛'],
      affectedUserSegments: ['全年代'],
      affectedDietaryRestrictionTypes: [],
      proposalPriority: 6,
      businessValue: 5,
      technicalDifficulty: 2,
      userImpactScore: 6,
      totalPriorityScore: 6.0,
      verificationCriteria: '月次データで測定、改善率1.5%以上が基準',
      expectedEffectDescription: '亜鉛不足改善による免疫力向上',
      implementationEstimate: 3,
      kpiContribution: '栄養基準達成率向上: +1%',
      submittedAt: new Date('2024-01-15T13:30:00Z'),
    };

    expect(() => validateNutritionistImprovementProposal(proposalWithMissingOtherField))
      .toThrow(/提案名/);
  });

  test('検証基準として複雑な条件式が定義されている場合も正常に検証される', () => {
    const proposalWithComplexCriteria = {
      proposalId: 'PROP-20240115-008',
      proposalName: '複合栄養基準の改善',
      proposalDescription: '複数栄養素の相互作用を考慮した基準改善提案',
      nutritionistId: 'NUT-20240007',
      affectedNutritionItems: ['カルシウム', 'ビタミンD', 'マグネシウム'],
      affectedUserSegments: ['高齢者、女性'],
      affectedDietaryRestrictionTypes: [],
      proposalPriority: 9,
      businessValue: 8,
      technicalDifficulty: 5,
      userImpactScore: 9,
      totalPriorityScore: 9.0,
      verificationCriteria: '栄養素間の吸収比率（カルシウム:マグネシウム = 2:1、ビタミンD供給量 ≥ 600IU）を満たし、月次達成度が前月比で3%以上向上することを基準とする。',
      expectedEffectDescription: '骨密度維持と栄養吸収効率が向上',
      implementationEstimate: 10,
      kpiContribution: '栄養基準達成率向上: +4%',
      submittedAt: new Date('2024-01-15T14:00:00Z'),
    };

    const result = validateNutritionistImprovementProposal(proposalWithComplexCriteria);

    expect(result.isValid).toBe(true);
    expect(result.verificationCriteria).toContain('カルシウム:マグネシウム = 2:1');
    expect(result.proposalId).toBe('PROP-20240115-008');
  });
});