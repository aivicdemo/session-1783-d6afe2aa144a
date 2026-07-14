import { validateMenuConstraints } from '../../src/logic/it-7-2-1';

describe('献立確定・制約条件検証機能', () => {
  // SCEN-549
  test('家族成員のアレルギー食材が献立に含まれている場合、確定不可と判定される', () => {
    const familyMember = {
      family_member_id: 'fm-001',
      name: '長男',
      age: 8,
      allergies: [
        {
          allergen_id: 'alg-peanut',
          allergen_name: 'ピーナッツ',
          severity: 'high',
        },
      ],
    };

    const menu = {
      menu_id: 'menu-001',
      menu_name: '週間献立案',
      menu_items: [
        {
          menu_item_id: 'item-001',
          dish_name: 'ピーナッツバター和え',
          ingredients: [
            {
              ingredient_id: 'ing-peanut',
              ingredient_name: 'ピーナッツ',
            },
            {
              ingredient_id: 'ing-carrot',
              ingredient_name: 'にんじん',
            },
          ],
        },
        {
          menu_item_id: 'item-002',
          dish_name: 'ほうれん草の胡麻和え',
          ingredients: [
            {
              ingredient_id: 'ing-spinach',
              ingredient_name: 'ほうれん草',
            },
            {
              ingredient_id: 'ing-sesame',
              ingredient_name: '胡麻',
            },
          ],
        },
      ],
    };

    const validationInput = {
      menu: menu,
      family_members: [familyMember],
      constraints: {
        check_allergies: true,
        check_cooking_time: false,
        check_budget: false,
        check_nutrition: false,
      },
    };

    expect(() => validateMenuConstraints(validationInput)).toThrow(/ピーナッツ/);
  });
});