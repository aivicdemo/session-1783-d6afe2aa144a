import { determinePriorityMatrixPlacement } from "../../src/logic/it-1-br-3-2-1";

describe("Purchase Record and Monthly Cost Reduction Analysis", () => {
  // SCEN-475
  test("should place external factor variable with impact_score 50 and implementation_difficulty 50 at exact center of priority matrix", () => {
    const variable_data = {
      variable_id: "ext_var_001",
      variable_name: "Weather Pattern Type A",
      impact_score: 50,
      implementation_difficulty_score: 50,
      correlation_coefficient: 0.72,
      trust_score: 85,
    };

    const matrix_config = {
      x_axis_min: 0,
      x_axis_max: 100,
      y_axis_min: 0,
      y_axis_max: 100,
      center_x: 50,
      center_y: 50,
    };

    const result = determinePriorityMatrixPlacement(variable_data, matrix_config);

    expect(result.position_x).toBe(50);
    expect(result.position_y).toBe(50);
    expect(result.quadrant_classification).toBe("center");
    expect(result.is_center_positioned).toBe(true);
    expect(result.distance_from_center).toBe(0);
  });

  test("should correctly classify center region variable when impact_score and implementation_difficulty_score are both 50", () => {
    const variable_data = {
      variable_id: "ext_var_002",
      variable_name: "Event Information Integration",
      impact_score: 50,
      implementation_difficulty_score: 50,
      correlation_coefficient: 0.68,
      trust_score: 80,
    };

    const matrix_config = {
      x_axis_min: 0,
      x_axis_max: 100,
      y_axis_min: 0,
      y_axis_max: 100,
      center_x: 50,
      center_y: 50,
    };

    const result = determinePriorityMatrixPlacement(variable_data, matrix_config);

    expect(result.quadrant_classification).toBe("center");
    expect(result.center_region_offset_x).toBe(0);
    expect(result.center_region_offset_y).toBe(0);
  });

  test("should verify relative position accuracy compared to variables with different priority scores", () => {
    const center_variable = {
      variable_id: "ext_var_center",
      variable_name: "Center Variable",
      impact_score: 50,
      implementation_difficulty_score: 50,
      correlation_coefficient: 0.75,
      trust_score: 85,
    };

    const high_impact_variable = {
      variable_id: "ext_var_high_impact",
      variable_name: "High Impact Variable",
      impact_score: 75,
      implementation_difficulty_score: 50,
      correlation_coefficient: 0.80,
      trust_score: 88,
    };

    const low_difficulty_variable = {
      variable_id: "ext_var_low_difficulty",
      variable_name: "Low Difficulty Variable",
      impact_score: 50,
      implementation_difficulty_score: 25,
      correlation_coefficient: 0.70,
      trust_score: 82,
    };

    const matrix_config = {
      x_axis_min: 0,
      x_axis_max: 100,
      y_axis_min: 0,
      y_axis_max: 100,
      center_x: 50,
      center_y: 50,
    };

    const center_result = determinePriorityMatrixPlacement(
      center_variable,
      matrix_config
    );
    const high_impact_result = determinePriorityMatrixPlacement(
      high_impact_variable,
      matrix_config
    );
    const low_difficulty_result = determinePriorityMatrixPlacement(
      low_difficulty_variable,
      matrix_config
    );

    expect(center_result.position_x).toBe(50);
    expect(center_result.position_y).toBe(50);

    expect(high_impact_result.position_x).toBe(75);
    expect(high_impact_result.position_y).toBe(50);

    expect(low_difficulty_result.position_x).toBe(50);
    expect(low_difficulty_result.position_y).toBe(25);

    expect(high_impact_result.position_x - center_result.position_x).toBe(25);
    expect(center_result.position_y - low_difficulty_result.position_y).toBe(25);
  });

  test("should validate visual position matches coordinate values for center-positioned variable", () => {
    const variable_data = {
      variable_id: "ext_var_003",
      variable_name: "Competitor Strategy Tracking",
      impact_score: 50,
      implementation_difficulty_score: 50,
      correlation_coefficient: 0.65,
      trust_score: 78,
    };

    const matrix_config = {
      x_axis_min: 0,
      x_axis_max: 100,
      y_axis_min: 0,
      y_axis_max: 100,
      center_x: 50,
      center_y: 50,
    };

    const result = determinePriorityMatrixPlacement(variable_data, matrix_config);

    expect(result.visual_x_pixel_position).toBe(
      (result.position_x / 100) * matrix_config.x_axis_max
    );
    expect(result.visual_y_pixel_position).toBe(
      (result.position_y / 100) * matrix_config.y_axis_max
    );
    expect(result.is_within_center_region).toBe(true);
  });

  test("should throw error when impact_score is outside valid range 0-100", () => {
    const invalid_variable = {
      variable_id: "ext_var_invalid",
      variable_name: "Invalid Variable",
      impact_score: 150,
      implementation_difficulty_score: 50,
      correlation_coefficient: 0.70,
      trust_score: 80,
    };

    const matrix_config = {
      x_axis_min: 0,
      x_axis_max: 100,
      y_axis_min: 0,
      y_axis_max: 100,
      center_x: 50,
      center_y: 50,
    };

    expect(() =>
      determinePriorityMatrixPlacement(invalid_variable, matrix_config)
    ).toThrow(/impact_score/);
  });

  test("should throw error when implementation_difficulty_score is outside valid range 0-100", () => {
    const invalid_variable = {
      variable_id: "ext_var_invalid",
      variable_name: "Invalid Variable",
      impact_score: 50,
      implementation_difficulty_score: -10,
      correlation_coefficient: 0.70,
      trust_score: 80,
    };

    const matrix_config = {
      x_axis_min: 0,
      x_axis_max: 100,
      y_axis_min: 0,
      y_axis_max: 100,
      center_x: 50,
      center_y: 50,
    };

    expect(() =>
      determinePriorityMatrixPlacement(invalid_variable, matrix_config)
    ).toThrow(/implementation_difficulty/);
  });
});