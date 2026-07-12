import { defineUserSegmentClassificationCriteria } from '../../src/logic/it-1-br-4-2-1';

describe('専業主夫層セグメント分類基準確定機能', () => {
  // SCEN-682
  test('年代・家族構成・食事制限条件の3軸でセグメント分類基準が正常に確定される', () => {
    const ageGroup = '30s';
    const familyComposition = 'spouse_and_two_children';
    const dietaryRestrictions = ['egg_allergy', 'dairy_allergy'];

    const result = defineUserSegmentClassificationCriteria({
      ageGroup,
      familyComposition,
      dietaryRestrictions,
    });

    expect(result).toEqual({
      segmentId: expect.any(String),
      ageGroup: '30s',
      familyComposition: 'spouse_and_two_children',
      familySize: 4,
      dietaryRestrictions: ['egg_allergy', 'dairy_allergy'],
      createdAt: expect.any(String),
      status: 'confirmed',
    });

    expect(result.ageGroup).toBe('30s');
    expect(result.familyComposition).toBe('spouse_and_two_children');
    expect(result.familySize).toBe(4);
    expect(result.dietaryRestrictions).toHaveLength(2);
    expect(result.dietaryRestrictions).toContain('egg_allergy');
    expect(result.dietaryRestrictions).toContain('dairy_allergy');
    expect(result.status).toBe('confirmed');
    expect(result.segmentId).toMatch(/^SEG-\d{10}$/);
  });
});