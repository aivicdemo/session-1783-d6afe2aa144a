import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { sendImprovementProposalNotification } from '../../src/logic/it-1-br-8-2-1-1';

const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('改善提案通知機能 - メンバー情報検証エラーハンドリング', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-272
  test('不正なメンバー情報を渡した場合、適切なエラーをスローし、外部API呼び出しなし', () => {
    const validProposal = {
      proposalId: 'PROP-001',
      title: '栄養バランス改善ロジック',
      description: 'カロリー計算精度向上',
      businessValue: 8,
      technicalDifficulty: 6,
      userImpact: 7,
      priorityScore: 42,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      createdBy: 'nutritionist-001'
    };

    const invalidMemberWithNull = {
      memberId: null,
      memberName: 'Developer A',
      memberEmail: 'dev-a@company.com',
      role: 'backend'
    };

    expect(() =>
      sendImprovementProposalNotification(validProposal, invalidMemberWithNull)
    ).toThrow(/メンバー情報/);

    expect(fetchMock).not.toHaveFetched();
  });

  test('メンバーIDがundefinedの場合、エラーをスロー', () => {
    const validProposal = {
      proposalId: 'PROP-002',
      title: '食材制限ロジック強化',
      description: 'アレルギー検出精度向上',
      businessValue: 9,
      technicalDifficulty: 5,
      userImpact: 8,
      priorityScore: 44,
      createdAt: new Date('2024-01-15T11:00:00Z'),
      createdBy: 'nutritionist-002'
    };

    const invalidMemberWithUndefined = {
      memberId: undefined,
      memberName: 'Developer B',
      memberEmail: 'dev-b@company.com',
      role: 'frontend'
    };

    expect(() =>
      sendImprovementProposalNotification(validProposal, invalidMemberWithUndefined)
    ).toThrow(/メンバー情報/);

    expect(fetchMock).not.toHaveFetched();
  });

  test('メンバーIDが空文字列の場合、エラーをスロー', () => {
    const validProposal = {
      proposalId: 'PROP-003',
      title: '献立生成アルゴリズム改善',
      description: '成功率向上施策',
      businessValue: 7,
      technicalDifficulty: 7,
      userImpact: 9,
      priorityScore: 47,
      createdAt: new Date('2024-01-15T12:00:00Z'),
      createdBy: 'nutritionist-003'
    };

    const invalidMemberWithEmptyId = {
      memberId: '',
      memberName: 'Developer C',
      memberEmail: 'dev-c@company.com',
      role: 'qa'
    };

    expect(() =>
      sendImprovementProposalNotification(validProposal, invalidMemberWithEmptyId)
    ).toThrow(/メンバー情報/);

    expect(fetchMock).not.toHaveFetched();
  });

  test('メールアドレス形式が無効な場合、エラーをスロー', () => {
    const validProposal = {
      proposalId: 'PROP-004',
      title: '予算管理機能強化',
      description: '食費予測精度向上',
      businessValue: 6,
      technicalDifficulty: 4,
      userImpact: 6,
      priorityScore: 36,
      createdAt: new Date('2024-01-15T13:00:00Z'),
      createdBy: 'nutritionist-004'
    };

    const invalidMemberWithBadEmail = {
      memberId: 'MEM-004',
      memberName: 'Developer D',
      memberEmail: 'invalid-email-format',
      role: 'devops'
    };

    expect(() =>
      sendImprovementProposalNotification(validProposal, invalidMemberWithBadEmail)
    ).toThrow(/メンバー情報/);

    expect(fetchMock).not.toHaveFetched();
  });

  test('メンバー名がnullの場合、エラーをスロー', () => {
    const validProposal = {
      proposalId: 'PROP-005',
      title: '在庫最適化ロジック',
      description: '廃棄率削減',
      businessValue: 8,
      technicalDifficulty: 6,
      userImpact: 7,
      priorityScore: 42,
      createdAt: new Date('2024-01-15T14:00:00Z'),
      createdBy: 'nutritionist-005'
    };

    const invalidMemberWithNullName = {
      memberId: 'MEM-005',
      memberName: null,
      memberEmail: 'dev-e@company.com',
      role: 'backend'
    };

    expect(() =>
      sendImprovementProposalNotification(validProposal, invalidMemberWithNullName)
    ).toThrow(/メンバー情報/);

    expect(fetchMock).not.toHaveFetched();
  });

  test('メールアドレスが空文字列の場合、エラーをスロー', () => {
    const validProposal = {
      proposalId: 'PROP-006',
      title: 'UI/UX改善',
      description: '操作性向上',
      businessValue: 5,
      technicalDifficulty: 3,
      userImpact: 8,
      priorityScore: 32,
      createdAt: new Date('2024-01-15T15:00:00Z'),
      createdBy: 'nutritionist-006'
    };

    const invalidMemberWithEmptyEmail = {
      memberId: 'MEM-006',
      memberName: 'Developer F',
      memberEmail: '',
      role: 'frontend'
    };

    expect(() =>
      sendImprovementProposalNotification(validProposal, invalidMemberWithEmptyEmail)
    ).toThrow(/メンバー情報/);

    expect(fetchMock).not.toHaveFetched();
  });

  test('roleが不正な値の場合、エラーをスロー', () => {
    const validProposal = {
      proposalId: 'PROP-007',
      title: 'パフォーマンス最適化',
      description: 'レスポンス時間短縮',
      businessValue: 6,
      technicalDifficulty: 8,
      userImpact: 5,
      priorityScore: 38,
      createdAt: new Date('2024-01-15T16:00:00Z'),
      createdBy: 'nutritionist-007'
    };

    const invalidMemberWithBadRole = {
      memberId: 'MEM-007',
      memberName: 'Developer G',
      memberEmail: 'dev-g@company.com',
      role: 'invalid_role'
    };

    expect(() =>
      sendImprovementProposalNotification(validProposal, invalidMemberWithBadRole)
    ).toThrow(/メンバー情報/);

    expect(fetchMock).not.toHaveFetched();
  });

  test('複数フィールドが無効な場合、メンバー情報エラーをスロー', () => {
    const validProposal = {
      proposalId: 'PROP-008',
      title: 'セキュリティ強化',
      description: 'データ暗号化',
      businessValue: 9,
      technicalDifficulty: 8,
      userImpact: 9,
      priorityScore: 52,
      createdAt: new Date('2024-01-15T17:00:00Z'),
      createdBy: 'nutritionist-008'
    };

    const invalidMemberWithMultipleIssues = {
      memberId: '',
      memberName: null,
      memberEmail: 'bad-email',
      role: null
    };

    expect(() =>
      sendImprovementProposalNotification(
        validProposal,
        invalidMemberWithMultipleIssues
      )
    ).toThrow(/メンバー情報/);

    expect(fetchMock).not.toHaveFetched();
  });
});