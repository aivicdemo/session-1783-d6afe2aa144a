import { generateMealPlanRequest } from '../../src/logic/it-1-1-1';

describe('献立生成要求処理 - ログイン済みユーザーの手動ボタン押下', () => {
  // SCEN-328
  test('献立生成要求がログイン済みユーザーから送信され、家族の制約条件が正常に読み込まれる', () => {
    const userId = 'user_12345';
    const familyMembers = [
      {
        family_member_id: 'fm_001',
        name: 'Father',
        age: 45,
        allergies: ['えび', 'かに'],
        dietary_restrictions: ['脂質制限'],
      },
      {
        family_member_id: 'fm_002',
        name: 'Child',
        age: 8,
        allergies: ['ピーナッツ'],
        dietary_restrictions: [],
      },
    ];

    const mealPlanRequest = {
      user_id: userId,
      request_type: 'manual',
      timestamp: '2024-01-15T09:30:00Z',
      family_members: familyMembers,
    };

    const result = generateMealPlanRequest(mealPlanRequest);

    expect(result.status_code).toBe(200);
    expect(result.request_id).toBeDefined();
    expect(typeof result.request_id).toBe('string');
    expect(result.request_id.length).toBeGreaterThan(0);

    expect(result.user_id).toBe(userId);
    expect(result.request_type).toBe('manual');

    expect(result.constraints_loaded).toBe(true);
    expect(result.family_count).toBe(2);

    expect(result.constraints).toEqual({
      all_allergies: ['えび', 'かに', 'ピーナッツ'],
      all_dietary_restrictions: ['脂質制限'],
      family_member_count: 2,
    });

    expect(result.error_message).toBeNull();
    expect(result.loading_completed).toBe(true);
  });

  test('献立生成要求時にユーザーIDが不正な場合、エラーが発生する', () => {
    const invalidRequest = {
      user_id: '',
      request_type: 'manual',
      timestamp: '2024-01-15T09:30:00Z',
      family_members: [],
    };

    expect(() => generateMealPlanRequest(invalidRequest)).toThrow(/ユーザーID/);
  });

  test('献立生成要求時に家族情報が取得できない場合、エラーが発生する', () => {
    const requestWithoutFamily = {
      user_id: 'user_12345',
      request_type: 'manual',
      timestamp: '2024-01-15T09:30:00Z',
      family_members: null,
    };

    expect(() => generateMealPlanRequest(requestWithoutFamily)).toThrow(/家族情報/);
  });

  test('献立生成要求に複数の制約条件が含まれている場合、すべての制約条件が正常に読み込まれる', () => {
    const userId = 'user_67890';
    const familyMembers = [
      {
        family_member_id: 'fm_101',
        name: 'Parent A',
        age: 40,
        allergies: ['そば', '卵'],
        dietary_restrictions: ['カロリー制限', '塩分制限'],
      },
      {
        family_member_id: 'fm_102',
        name: 'Parent B',
        age: 42,
        allergies: ['牛乳'],
        dietary_restrictions: ['コレステロール制限'],
      },
      {
        family_member_id: 'fm_103',
        name: 'Child A',
        age: 10,
        allergies: [],
        dietary_restrictions: [],
      },
      {
        family_member_id: 'fm_104',
        name: 'Child B',
        age: 6,
        allergies: ['小麦'],
        dietary_restrictions: [],
      },
    ];

    const mealPlanRequest = {
      user_id: userId,
      request_type: 'manual',
      timestamp: '2024-01-15T10:00:00Z',
      family_members: familyMembers,
    };

    const result = generateMealPlanRequest(mealPlanRequest);

    expect(result.status_code).toBe(200);
    expect(result.constraints_loaded).toBe(true);
    expect(result.family_count).toBe(4);

    expect(result.constraints.all_allergies).toContain('そば');
    expect(result.constraints.all_allergies).toContain('卵');
    expect(result.constraints.all_allergies).toContain('牛乳');
    expect(result.constraints.all_allergies).toContain('小麦');
    expect(result.constraints.all_allergies.length).toBe(4);

    expect(result.constraints.all_dietary_restrictions).toContain('カロリー制限');
    expect(result.constraints.all_dietary_restrictions).toContain('塩分制限');
    expect(result.constraints.all_dietary_restrictions).toContain('コレステロール制限');
    expect(result.constraints.all_dietary_restrictions.length).toBe(3);

    expect(result.error_message).toBeNull();
    expect(result.loading_completed).toBe(true);
  });

  test('献立生成要求がサーバーに正常に送信されたことを確認する', () => {
    const userId = 'user_54321';
    const familyMembers = [
      {
        family_member_id: 'fm_201',
        name: 'Main User',
        age: 35,
        allergies: ['魚'],
        dietary_restrictions: ['ベジタリアン'],
      },
    ];

    const mealPlanRequest = {
      user_id: userId,
      request_type: 'manual',
      timestamp: '2024-01-15T11:00:00Z',
      family_members: familyMembers,
    };

    const result = generateMealPlanRequest(mealPlanRequest);

    expect(result.status_code).toBe(200);
    expect(result.server_transmission_confirmed).toBe(true);
    expect(result.request_timestamp).toBe('2024-01-15T11:00:00Z');
    expect(result.error_message).toBeNull();
  });
});