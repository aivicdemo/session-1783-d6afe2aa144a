import { analyzeSegmentUsagePattern } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別利用パターン分析ダッシュボード', () => {
  // SCEN-279
  test('特定セグメントに属するユーザーが0人の場合、適切なエラーメッセージが表示され分析処理が正常に失敗する', () => {
    const segmentCondition = {
      ageRange: '30-40',
      region: 'tokyo',
      familyComposition: 'family_with_children',
      hasAllergyRestriction: true,
    };

    const analysisInput = {
      segment: segmentCondition,
      analysisStartDate: '2024-01-01',
      analysisEndDate: '2024-03-31',
      userList: [],
    };

    expect(() => analyzeSegmentUsagePattern(analysisInput)).toThrow(
      /分析対象のユーザーが存在しません/
    );
  });
});