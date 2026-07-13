import { generateNutritionImprovedProposalStructured } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案構造化フォーマット生成', () => {
  // SCEN-490: [normal] 改善提案構造化フォーマット生成 - 栄養士の改善提案を構造化フォーマットで正確に記録する
  test('should generate structured nutrition improvement proposal with all required fields', () => {
    const input = {
      proposalTitle: 'タンパク質摂取量増加の推奨',
      proposalContent: 'タンパク質摂取量を20%増加させることを推奨します',
      category: '栄養バランス',
      priorityLevel: '高',
      targetUserId: 'user_001',
      targetFamilyMemberId: 'family_member_001',
      evidenceDataId: 'evidence_data_001',
      nutritionistId: 'nutritionist_001',
      createdAt: new Date('2024-01-15T11:00:00Z'),
      status: '新規'
    };

    const result = generateNutritionImprovedProposalStructured(input);

    expect(result).toEqual({
      proposalId: expect.any(String),
      proposalTitle: 'タンパク質摂取量増加の推奨',
      proposalContent: 'タンパク質摂取量を20%増加させることを推奨します',
      category: '栄養バランス',
      priorityLevel: '高',
      targetUserId: 'user_001',
      targetFamilyMemberId: 'family_member_001',
      evidenceDataId: 'evidence_data_001',
      nutritionistId: 'nutritionist_001',
      createdAt: '2024-01-15T11:00:00Z',
      status: '新規',
      version: 1,
      isValid: true
    });

    expect(result.proposalId).toMatch(/^proposal_\d+$/);
    expect(result.version).toBe(1);
    expect(result.isValid).toBe(true);
  });

  test('should store structured proposal with correct timestamp format', () => {
    const input = {
      proposalTitle: 'ビタミンD補強の推奨',
      proposalContent: 'ビタミンD摂取量を毎日800IU増加させる',
      category: '栄養補強',
      priorityLevel: '中',
      targetUserId: 'user_002',
      targetFamilyMemberId: 'family_member_002',
      evidenceDataId: 'evidence_data_002',
      nutritionistId: 'nutritionist_002',
      createdAt: new Date('2024-02-20T14:30:00Z'),
      status: '新規'
    };

    const result = generateNutritionImprovedProposalStructured(input);

    expect(result.createdAt).toBe('2024-02-20T14:30:00Z');
    expect(result.proposalTitle).toBe('ビタミンD補強の推奨');
    expect(result.priorityLevel).toBe('中');
    expect(result.status).toBe('新規');
  });

  test('should validate proposal category is in predefined list', () => {
    const input = {
      proposalTitle: 'テスト提案',
      proposalContent: 'テスト内容',
      category: '栄養バランス',
      priorityLevel: '高',
      targetUserId: 'user_003',
      targetFamilyMemberId: 'family_member_003',
      evidenceDataId: 'evidence_data_003',
      nutritionistId: 'nutritionist_003',
      createdAt: new Date('2024-03-10T09:00:00Z'),
      status: '新規'
    };

    const result = generateNutritionImprovedProposalStructured(input);

    expect(['栄養バランス', '栄養補強', '食事制限対応', 'アレルギー対応']).toContain(
      result.category
    );
  });

  test('should validate priority level is in valid range', () => {
    const input = {
      proposalTitle: 'テスト提案',
      proposalContent: 'テスト内容',
      category: '栄養バランス',
      priorityLevel: '高',
      targetUserId: 'user_004',
      targetFamilyMemberId: 'family_member_004',
      evidenceDataId: 'evidence_data_004',
      nutritionistId: 'nutritionist_004',
      createdAt: new Date('2024-03-15T10:00:00Z'),
      status: '新規'
    };

    const result = generateNutritionImprovedProposalStructured(input);

    expect(['高', '中', '低']).toContain(result.priorityLevel);
  });

  test('should throw error when required proposalTitle is missing', () => {
    const input = {
      proposalTitle: '',
      proposalContent: 'テスト内容',
      category: '栄養バランス',
      priorityLevel: '高',
      targetUserId: 'user_005',
      targetFamilyMemberId: 'family_member_005',
      evidenceDataId: 'evidence_data_005',
      nutritionistId: 'nutritionist_005',
      createdAt: new Date('2024-03-20T11:00:00Z'),
      status: '新規'
    };

    expect(() => generateNutritionImprovedProposalStructured(input)).toThrow(/提案タイトル/);
  });

  test('should throw error when required proposalContent is missing', () => {
    const input = {
      proposalTitle: 'テスト提案',
      proposalContent: '',
      category: '栄養バランス',
      priorityLevel: '高',
      targetUserId: 'user_006',
      targetFamilyMemberId: 'family_member_006',
      evidenceDataId: 'evidence_data_006',
      nutritionistId: 'nutritionist_006',
      createdAt: new Date('2024-03-25T12:00:00Z'),
      status: '新規'
    };

    expect(() => generateNutritionImprovedProposalStructured(input)).toThrow(/提案内容/);
  });

  test('should throw error when category is invalid', () => {
    const input = {
      proposalTitle: 'テスト提案',
      proposalContent: 'テスト内容',
      category: '無効なカテゴリ',
      priorityLevel: '高',
      targetUserId: 'user_007',
      targetFamilyMemberId: 'family_member_007',
      evidenceDataId: 'evidence_data_007',
      nutritionistId: 'nutritionist_007',
      createdAt: new Date('2024-04-01T09:00:00Z'),
      status: '新規'
    };

    expect(() => generateNutritionImprovedProposalStructured(input)).toThrow(/カテゴリ/);
  });

  test('should throw error when priority level is invalid', () => {
    const input = {
      proposalTitle: 'テスト提案',
      proposalContent: 'テスト内容',
      category: '栄養バランス',
      priorityLevel: '超高',
      targetUserId: 'user_008',
      targetFamilyMemberId: 'family_member_008',
      evidenceDataId: 'evidence_data_008',
      nutritionistId: 'nutritionist_008',
      createdAt: new Date('2024-04-05T10:00:00Z'),
      status: '新規'
    };

    expect(() => generateNutritionImprovedProposalStructured(input)).toThrow(/優先度/);
  });

  test('should throw error when targetUserId is missing', () => {
    const input = {
      proposalTitle: 'テスト提案',
      proposalContent: 'テスト内容',
      category: '栄養バランス',
      priorityLevel: '高',
      targetUserId: '',
      targetFamilyMemberId: 'family_member_009',
      evidenceDataId: 'evidence_data_009',
      nutritionistId: 'nutritionist_009',
      createdAt: new Date('2024-04-10T11:00:00Z'),
      status: '新規'
    };

    expect(() => generateNutritionImprovedProposalStructured(input)).toThrow(/ユーザーID/);
  });

  test('should throw error when nutritionistId is missing', () => {
    const input = {
      proposalTitle: 'テスト提案',
      proposalContent: 'テスト内容',
      category: '栄養バランス',
      priorityLevel: '高',
      targetUserId: 'user_010',
      targetFamilyMemberId: 'family_member_010',
      evidenceDataId: 'evidence_data_010',
      nutritionistId: '',
      createdAt: new Date('2024-04-15T12:00:00Z'),
      status: '新規'
    };

    expect(() => generateNutritionImprovedProposalStructured(input)).toThrow(/栄養士ID/);
  });

  test('should store proposal with correct status value', () => {
    const input = {
      proposalTitle: '鉄分摂取量増加の推奨',
      proposalContent: '鉄分摂取量を毎日15mg増加させる',
      category: '栄養補強',
      priorityLevel: '高',
      targetUserId: 'user_011',
      targetFamilyMemberId: 'family_member_011',
      evidenceDataId: 'evidence_data_011',
      nutritionistId: 'nutritionist_011',
      createdAt: new Date('2024-04-20T13:00:00Z'),
      status: '新規'
    };

    const result = generateNutritionImprovedProposalStructured(input);

    expect(result.status).toBe('新規');
    expect(['新規', '承認待ち', '優先度付け完了', '却下', '保留']).toContain(result.status);
  });

  test('should generate unique proposal ID for each proposal', () => {
    const input1 = {
      proposalTitle: '提案1',
      proposalContent: '内容1',
      category: '栄養バランス',
      priorityLevel: '高',
      targetUserId: 'user_012',
      targetFamilyMemberId: 'family_member_012',
      evidenceDataId: 'evidence_data_012',
      nutritionistId: 'nutritionist_012',
      createdAt: new Date('2024-04-25T14:00:00Z'),
      status: '新規'
    };

    const input2 = {
      proposalTitle: '提案2',
      proposalContent: '内容2',
      category: '栄養補強',
      priorityLevel: '中',
      targetUserId: 'user_013',
      targetFamilyMemberId: 'family_member_013',
      evidenceDataId: 'evidence_data_013',
      nutritionistId: 'nutritionist_013',
      createdAt: new Date('2024-04-26T15:00:00Z'),
      status: '新規'
    };

    const result1 = generateNutritionImprovedProposalStructured(input1);
    const result2 = generateNutritionImprovedProposalStructured(input2);

    expect(result1.proposalId).not.toBe(result2.proposalId);
  });

  test('should maintain all evidence data reference', () => {
    const input = {
      proposalTitle: 'カルシウム摂取量の最適化',
      proposalContent: 'カルシウム摂取量を800mgに調整する',
      category: '栄養バランス',
      priorityLevel: '中',
      targetUserId: 'user_014',
      targetFamilyMemberId: 'family_member_014',
      evidenceDataId: 'evidence_data_evidence_001',
      nutritionistId: 'nutritionist_014',
      createdAt: new Date('2024-05-01T09:30:00Z'),
      status: '新規'
    };

    const result = generateNutritionImprovedProposalStructured(input);

    expect(result.evidenceDataId).toBe('evidence_data_evidence_001');
  });

  test('should format timestamp as ISO 8601 string', () => {
    const input = {
      proposalTitle: 'マグネシウム補強の推奨',
      proposalContent: 'マグネシウム摂取量を毎日400mg増加させる',
      category: '栄養補強',
      priorityLevel: '低',
      targetUserId: 'user_015',
      targetFamilyMemberId: 'family_member_015',
      evidenceDataId: 'evidence_data_015',
      nutritionistId: 'nutritionist_015',
      createdAt: new Date('2024-05-05T16:45:30Z'),
      status: '新規'
    };

    const result = generateNutritionImprovedProposalStructured(input);

    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(result.createdAt).toBe('2024-05-05T16:45:30Z');
  });

  test('should set version to 1 for newly created proposal', () => {
    const input = {
      proposalTitle: '亜鉛補強の推奨',
      proposalContent: '亜鉛摂取量を毎日11mg推奨する',
      category: '栄養補強',
      priorityLevel: '高',
      targetUserId: 'user_016',
      targetFamilyMemberId: 'family_member_016',
      evidenceDataId: 'evidence_data_016',
      nutritionistId: 'nutritionist_016',
      createdAt: new Date('2024-05-10T10:00:00Z'),
      status: '新規'
    };

    const result = generateNutritionImprovedProposalStructured(input);

    expect(result.version).toBe(1);
  });

  test('should validate proposal and set isValid flag', () => {
    const input = {
      proposalTitle: '有効な提案',
      proposalContent: '有効な提案内容',
      category: '食事制限対応',
      priorityLevel: '中',
      targetUserId: 'user_017',
      targetFamilyMemberId: 'family_member_017',
      evidenceDataId: 'evidence_data_017',
      nutritionistId: 'nutritionist_017',
      createdAt: new Date('2024-05-15T11:00:00Z'),
      status: '新規'
    };

    const result = generateNutritionImprovedProposalStructured(input);

    expect(result.isValid).toBe(true);
  });

  test('should preserve all input fields in output structure', () => {
    const input = {
      proposalTitle: 'アレルギー対応提案',
      proposalContent: 'ピーナッツアレルギーに対応した献立提案',
      category: 'アレルギー対応',
      priorityLevel: '高',
      targetUserId: 'user_018',
      targetFamilyMemberId: 'family_member_018',
      evidenceDataId: 'evidence_data_018',
      nutritionistId: 'nutritionist_018',
      createdAt: new Date('2024-05-20T12:00:00Z'),
      status: '新規'
    };

    const result = generateNutritionImprovedProposalStructured(input);

    expect(result).toHaveProperty('proposalId');
    expect(result).toHaveProperty('proposalTitle');
    expect(result).toHaveProperty('proposalContent');
    expect(result).toHaveProperty('category');
    expect(result).toHaveProperty('priorityLevel');
    expect(result).toHaveProperty('targetUserId');
    expect(result).toHaveProperty('targetFamilyMemberId');
    expect(result).toHaveProperty('evidenceDataId');
    expect(result).toHaveProperty('nutritionistId');
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('isValid');
  });
});