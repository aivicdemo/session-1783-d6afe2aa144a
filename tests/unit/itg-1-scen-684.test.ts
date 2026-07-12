import { defineUserSegment } from '../../src/logic/it-1-br-4-2-1';

describe('専業主夫層セグメント分類基準確定機能', () => {
  // SCEN-684: [edge] 年代境界値（18歳、65歳）でセグメント分類が正確に判定される
  test('should classify user segment correctly at age boundary 18 and 65', () => {
    const today = new Date('2024-01-15');

    // 18歳の誕生日（今日から18年前）
    const birth_date_18_years = new Date('2006-01-15');
    const segment_at_18 = defineUserSegment({
      birth_date: birth_date_18_years,
      occupation: 'dedicated_househusband',
      reference_date: today,
    });
    expect(segment_at_18).toBe('age_18_64');

    // 17歳11ヶ月59日の誕生日
    const birth_date_17_years_11_months_59_days = new Date('2006-01-16');
    const segment_at_17_11_59 = defineUserSegment({
      birth_date: birth_date_17_years_11_months_59_days,
      occupation: 'dedicated_househusband',
      reference_date: today,
    });
    expect(segment_at_17_11_59).toBe('age_under_18');
    expect(segment_at_17_11_59).not.toBe(segment_at_18);

    // 65歳の誕生日（今日から65年前）
    const birth_date_65_years = new Date('1959-01-15');
    const segment_at_65 = defineUserSegment({
      birth_date: birth_date_65_years,
      occupation: 'dedicated_househusband',
      reference_date: today,
    });
    expect(segment_at_65).toBe('age_65_plus');

    // 65歳1日の誕生日（今日から65年と1日前）
    const birth_date_65_years_1_day = new Date('1959-01-14');
    const segment_at_65_1_day = defineUserSegment({
      birth_date: birth_date_65_years_1_day,
      occupation: 'dedicated_househusband',
      reference_date: today,
    });
    expect(segment_at_65_1_day).toBe('age_65_plus');
    expect(segment_at_65_1_day).toBe(segment_at_65);

    // 64歳11ヶ月29日の誕生日（65歳未満）
    const birth_date_64_years_11_months_29_days = new Date('1959-01-16');
    const segment_at_64_11_29 = defineUserSegment({
      birth_date: birth_date_64_years_11_months_29_days,
      occupation: 'dedicated_househusband',
      reference_date: today,
    });
    expect(segment_at_64_11_29).toBe('age_18_64');
    expect(segment_at_64_11_29).not.toBe(segment_at_65);
  });
});