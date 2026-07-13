import { detectDietaryRestrictionViolations } from '../../src/logic/it-1-br-2-1-1-1';

describe('Past Dietary Restriction Violation Detection', () => {
  // SCEN-403: [normal] 過去献立抵触パターン自動検出機能 - 新規食事制限条件に違反する過去献立が複数存在する場合、全抵触パターンが一覧表示される
  test('should detect and display all past menu violations against new dietary restriction conditions', () => {
    // Precondition: User has logged in to nutrition management dashboard and multiple past menu records with nutrition data exist
    const new_dietary_restrictions = [
      {
        restriction_id: 'RES001',
        nutrient_name: '塩分',
        daily_limit_value: 5.0,
        unit: 'g',
        priority: 1,
      },
      {
        restriction_id: 'RES002',
        nutrient_name: 'たんぱく質',
        daily_limit_value: 40.0,
        unit: 'g',
        priority: 2,
      },
    ];

    // Past menu records with nutrition data to be checked
    const past_menu_records = [
      {
        menu_id: 'MENU001',
        menu_date: '2024-01-15',
        family_member_id: 'FM001',
        nutrition_data: [
          {
            nutrient_name: '塩分',
            actual_value: 7.5,
            unit: 'g',
          },
          {
            nutrient_name: 'たんぱく質',
            actual_value: 38.0,
            unit: 'g',
          },
        ],
      },
      {
        menu_id: 'MENU002',
        menu_date: '2024-01-16',
        family_member_id: 'FM001',
        nutrition_data: [
          {
            nutrient_name: '塩分',
            actual_value: 4.8,
            unit: 'g',
          },
          {
            nutrient_name: 'たんぱく質',
            actual_value: 42.5,
            unit: 'g',
          },
        ],
      },
      {
        menu_id: 'MENU003',
        menu_date: '2024-01-17',
        family_member_id: 'FM001',
        nutrition_data: [
          {
            nutrient_name: '塩分',
            actual_value: 6.2,
            unit: 'g',
          },
          {
            nutrient_name: 'たんぱく質',
            actual_value: 45.0,
            unit: 'g',
          },
        ],
      },
      {
        menu_id: 'MENU004',
        menu_date: '2024-01-18',
        family_member_id: 'FM001',
        nutrition_data: [
          {
            nutrient_name: '塩分',
            actual_value: 4.0,
            unit: 'g',
          },
          {
            nutrient_name: 'たんぱく質',
            actual_value: 39.0,
            unit: 'g',
          },
        ],
      },
    ];

    // Trigger: User sets new dietary restrictions and executes "past menu check" feature
    // Expected behavior: System detects all menu records that violate new restrictions
    const detection_result = detectDietaryRestrictionViolations({
      new_dietary_restrictions: new_dietary_restrictions,
      past_menu_records: past_menu_records,
      family_member_id: 'FM001',
    });

    // Outcome validation: All violation patterns should be detected without duplication
    // MENU001: violates 塩分 (7.5 > 5.0, excess: 2.5g) - Violation count 1
    // MENU002: violates たんぱく質 (42.5 > 40.0, excess: 2.5g) - Violation count 1
    // MENU003: violates 塩分 (6.2 > 5.0, excess: 1.2g) and たんぱく質 (45.0 > 40.0, excess: 5.0g) - Violation count 2
    // MENU004: no violations - Violation count 0
    // Total violation patterns: 4 (1 + 1 + 2 + 0)

    expect(detection_result.total_violation_count).toBe(4);
    expect(detection_result.violation_patterns).toHaveLength(3); // 3 menus with violations (MENU001, MENU002, MENU003)
    expect(detection_result.violation_patterns[0]).toEqual({
      menu_id: 'MENU001',
      menu_date: '2024-01-15',
      violations: [
        {
          restriction_id: 'RES001',
          nutrient_name: '塩分',
          daily_limit_value: 5.0,
          actual_value: 7.5,
          unit: 'g',
          excess_value: 2.5,
          severity_level: 'high',
          violation_index: 1,
        },
      ],
    });

    expect(detection_result.violation_patterns[1]).toEqual({
      menu_id: 'MENU002',
      menu_date: '2024-01-16',
      violations: [
        {
          restriction_id: 'RES002',
          nutrient_name: 'たんぱく質',
          daily_limit_value: 40.0,
          actual_value: 42.5,
          unit: 'g',
          excess_value: 2.5,
          severity_level: 'medium',
          violation_index: 1,
        },
      ],
    });

    expect(detection_result.violation_patterns[2]).toEqual({
      menu_id: 'MENU003',
      menu_date: '2024-01-17',
      violations: [
        {
          restriction_id: 'RES001',
          nutrient_name: '塩分',
          daily_limit_value: 5.0,
          actual_value: 6.2,
          unit: 'g',
          excess_value: 1.2,
          severity_level: 'medium',
          violation_index: 1,
        },
        {
          restriction_id: 'RES002',
          nutrient_name: 'たんぱく質',
          daily_limit_value: 40.0,
          actual_value: 45.0,
          unit: 'g',
          excess_value: 5.0,
          severity_level: 'high',
          violation_index: 2,
        },
      ],
    });

    // Verify no duplicates exist in results
    const menu_ids_in_result = detection_result.violation_patterns.map(
      (p) => p.menu_id
    );
    const unique_menu_ids = new Set(menu_ids_in_result);
    expect(unique_menu_ids.size).toBe(menu_ids_in_result.length);

    // Verify menu without violations is not included
    const violation_menu_ids = detection_result.violation_patterns.map(
      (p) => p.menu_id
    );
    expect(violation_menu_ids).not.toContain('MENU004');

    // Verify display summary information
    expect(detection_result.display_summary).toEqual({
      total_detected_count: 3,
      total_violation_instances: 4,
      restrictions_involved: 2,
      date_range: {
        earliest_violation_date: '2024-01-15',
        latest_violation_date: '2024-01-17',
      },
      severity_distribution: {
        high: 2,
        medium: 2,
        low: 0,
      },
    });
  });
});