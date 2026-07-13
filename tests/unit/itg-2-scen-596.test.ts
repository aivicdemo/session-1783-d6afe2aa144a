import { classifyMenuRejectionReason } from '../../src/logic/it-1-br-2-1-1-1';

describe('献立却下修正理由の自動分類', () => {
  // SCEN-596
  test('献立却下・修正理由を4つの事前定義カテゴリに自動分類できる', () => {
    // 栄養バランス不適切な却下理由
    const nutritionImbalanceRejection = {
      reasonText: 'タンパク質が不足している献立だったので却下した',
      submittedAt: new Date('2024-01-15T11:00:00Z'),
      userId: 'user_001',
      menuId: 'menu_001'
    };

    const nutritionResult = classifyMenuRejectionReason(nutritionImbalanceRejection);
    expect(nutritionResult.category).toBe('栄養バランス不適切');
    expect(nutritionResult.confidence).toBeGreaterThanOrEqual(0.8);
    expect(nutritionResult.reasonText).toBe('タンパク質が不足している献立だったので却下した');

    // 家族好み未反映な却下理由
    const familyPreferenceRejection = {
      reasonText: '子どもが嫌いな野菜ばかりだったので修正を依頼した',
      submittedAt: new Date('2024-01-15T12:00:00Z'),
      userId: 'user_001',
      menuId: 'menu_002'
    };

    const preferenceResult = classifyMenuRejectionReason(familyPreferenceRejection);
    expect(preferenceResult.category).toBe('家族好み未反映');
    expect(preferenceResult.confidence).toBeGreaterThanOrEqual(0.8);
    expect(preferenceResult.reasonText).toBe('子どもが嫌いな野菜ばかりだったので修正を依頼した');

    // 調理時間超過な却下理由
    const cookingTimeRejection = {
      reasonText: '献立の調理時間が120分を超えていたため却下した',
      submittedAt: new Date('2024-01-15T13:00:00Z'),
      userId: 'user_001',
      menuId: 'menu_003'
    };

    const cookingTimeResult = classifyMenuRejectionReason(cookingTimeRejection);
    expect(cookingTimeResult.category).toBe('調理時間超過');
    expect(cookingTimeResult.confidence).toBeGreaterThanOrEqual(0.8);
    expect(cookingTimeResult.reasonText).toBe('献立の調理時間が120分を超えていたため却下した');

    // 食材制限漏れな却下理由
    const allergenOmissionRejection = {
      reasonText: '息子が卵アレルギーなのに卵が含まれる料理が入っていた',
      submittedAt: new Date('2024-01-15T14:00:00Z'),
      userId: 'user_001',
      menuId: 'menu_004'
    };

    const allergenResult = classifyMenuRejectionReason(allergenOmissionRejection);
    expect(allergenResult.category).toBe('食材制限漏れ');
    expect(allergenResult.confidence).toBeGreaterThanOrEqual(0.8);
    expect(allergenResult.reasonText).toBe('息子が卵アレルギーなのに卵が含まれる料理が入っていた');

    // 複数カテゴリ分類結果の一覧表示確認
    const allClassifications = [
      nutritionResult,
      preferenceResult,
      cookingTimeResult,
      allergenResult
    ];

    const categoryCount = {
      '栄養バランス不適切': 0,
      '家族好み未反映': 0,
      '調理時間超過': 0,
      '食材制限漏れ': 0
    };

    allClassifications.forEach(classification => {
      categoryCount[classification.category]++;
    });

    expect(categoryCount['栄養バランス不適切']).toBe(1);
    expect(categoryCount['家族好み未反映']).toBe(1);
    expect(categoryCount['調理時間超過']).toBe(1);
    expect(categoryCount['食材制限漏れ']).toBe(1);
  });
});