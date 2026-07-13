import { integrateSeasonalPatternsAndRules } from '../../src/logic/it-1-br-6-2-1-1';

describe('In-stock and pricing data integration interface implementation', () => {
  // SCEN-476
  test('should integrate new seasonal patterns, discount rate thresholds, and sales periods into priority rule specification', () => {
    // Setup: Prepare new seasonal pattern data from conference
    const new_seasonal_pattern = {
      season_id: 'SP_2024_Q2',
      season_name: 'spring_2024',
      start_date: '2024-03-21',
      end_date: '2024-06-20',
      seasonal_ingredients: ['asparagus', 'bamboo_shoot', 'strawberry', 'spinach'],
      priority_boost: 15
    };

    // Setup: Prepare new discount rate threshold data from conference
    const new_discount_threshold = {
      discount_id: 'DT_2024_Q2',
      category: 'fresh_vegetables',
      min_discount_rate: 10,
      max_discount_rate: 40,
      priority_boost: 12,
      applicable_from: '2024-03-21',
      applicable_to: '2024-06-20'
    };

    // Setup: Prepare new sales period data from conference
    const new_sales_period = {
      sales_period_id: 'SP_2024_CAMPAIGN_001',
      campaign_name: 'spring_vegetable_campaign',
      start_date: '2024-04-01',
      end_date: '2024-04-30',
      target_products: ['asparagus', 'bamboo_shoot', 'spinach'],
      discount_rate: 20,
      priority_boost: 18
    };

    // Setup: Existing priority rule specification
    const existing_rules = {
      rule_spec_id: 'SPEC_2024_Q1',
      created_at_iso: '2024-01-15T10:00:00Z',
      seasonal_patterns: [
        {
          season_id: 'SP_2024_Q1',
          season_name: 'winter_2024',
          start_date: '2023-12-21',
          end_date: '2024-03-20',
          seasonal_ingredients: ['daikon', 'carrot', 'cabbage'],
          priority_boost: 10
        }
      ],
      discount_thresholds: [
        {
          discount_id: 'DT_2024_Q1',
          category: 'root_vegetables',
          min_discount_rate: 5,
          max_discount_rate: 30,
          priority_boost: 8,
          applicable_from: '2024-01-01',
          applicable_to: '2024-03-31'
        }
      ],
      sales_periods: [
        {
          sales_period_id: 'SP_2024_NEW_YEAR',
          campaign_name: 'new_year_sale',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          target_products: ['daikon', 'carrot'],
          discount_rate: 15,
          priority_boost: 12
        }
      ],
      version: 1
    };

    // Execute: Integration of new seasonal patterns, discount thresholds, and sales periods
    const integration_input = {
      existing_rule_spec: existing_rules,
      new_seasonal_patterns: [new_seasonal_pattern],
      new_discount_thresholds: [new_discount_threshold],
      new_sales_periods: [new_sales_period]
    };

    const integrated_result = integrateSeasonalPatternsAndRules(integration_input);

    // Assert: Verify successful integration
    expect(integrated_result.success).toBe(true);
    expect(integrated_result.integration_status).toBe('completed');

    // Assert: Verify seasonal patterns were integrated
    expect(integrated_result.updated_rule_spec.seasonal_patterns).toHaveLength(2);
    expect(integrated_result.updated_rule_spec.seasonal_patterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          season_id: 'SP_2024_Q2',
          season_name: 'spring_2024',
          priority_boost: 15
        })
      ])
    );

    // Assert: Verify discount thresholds were integrated
    expect(integrated_result.updated_rule_spec.discount_thresholds).toHaveLength(2);
    expect(integrated_result.updated_rule_spec.discount_thresholds).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          discount_id: 'DT_2024_Q2',
          category: 'fresh_vegetables',
          min_discount_rate: 10,
          max_discount_rate: 40
        })
      ])
    );

    // Assert: Verify sales periods were integrated
    expect(integrated_result.updated_rule_spec.sales_periods).toHaveLength(2);
    expect(integrated_result.updated_rule_spec.sales_periods).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sales_period_id: 'SP_2024_CAMPAIGN_001',
          campaign_name: 'spring_vegetable_campaign',
          discount_rate: 20
        })
      ])
    );

    // Assert: Verify version was incremented
    expect(integrated_result.updated_rule_spec.version).toBe(2);

    // Assert: Verify no conflicts detected with existing rules
    expect(integrated_result.conflict_check.has_conflicts).toBe(false);
    expect(integrated_result.conflict_check.conflict_items).toHaveLength(0);

    // Assert: Verify the integrated rule specification is preserved
    expect(integrated_result.updated_rule_spec.rule_spec_id).toBe('SPEC_2024_Q1');

    // Assert: Verify timestamp was updated
    expect(integrated_result.updated_rule_spec.updated_at_iso).toBeDefined();
    expect(new Date(integrated_result.updated_rule_spec.updated_at_iso).getTime()).toBeGreaterThanOrEqual(
      new Date('2024-01-15T10:00:00Z').getTime()
    );

    // Assert: Verify all original seasonal patterns are retained
    expect(
      integrated_result.updated_rule_spec.seasonal_patterns.some(
        (p: any) => p.season_id === 'SP_2024_Q1'
      )
    ).toBe(true);

    // Assert: Verify priority boost values are correctly applied
    const spring_pattern = integrated_result.updated_rule_spec.seasonal_patterns.find(
      (p: any) => p.season_id === 'SP_2024_Q2'
    );
    expect(spring_pattern.priority_boost).toBe(15);

    // Assert: Verify discount rate thresholds are within valid range
    integrated_result.updated_rule_spec.discount_thresholds.forEach((threshold: any) => {
      expect(threshold.min_discount_rate).toBeGreaterThanOrEqual(0);
      expect(threshold.max_discount_rate).toBeLessThanOrEqual(100);
      expect(threshold.max_discount_rate).toBeGreaterThanOrEqual(threshold.min_discount_rate);
    });

    // Assert: Verify campaign dates don't overlap with other active campaigns
    const campaign_date_conflicts = integrated_result.conflict_check.campaign_date_overlaps;
    expect(campaign_date_conflicts).toHaveLength(0);

    // Assert: Verify sample cost calculation with new rules
    const sample_ingredient = 'asparagus';
    const sample_quantity = 500;
    const base_price = 100;
    const calc_result = integrated_result.sample_calculation_result;

    expect(calc_result.ingredient_name).toBe(sample_ingredient);
    expect(calc_result.base_unit_price).toBe(base_price);
    expect(calc_result.seasonal_boost_applied).toBe(true);
    expect(calc_result.final_priority_score).toBeGreaterThan(base_price);

    // Assert: Verify new rules are marked for system application
    expect(integrated_result.ready_for_deployment).toBe(true);
    expect(integrated_result.deployment_checklist).toEqual({
      rule_validation_passed: true,
      conflict_resolution_complete: true,
      version_increment_confirmed: true,
      backward_compatibility_verified: true
    });
  });
});