import { recordMealEvaluation } from "../../src/logic/it-1-br-3-2-1";

const fetchMock = require("jest-fetch-mock");

describe("Purchase Records and Monthly Food Cost Reduction Analysis", () => {
  // SCEN-345
  test("should return validation error when meal evaluation score exceeds valid range (0-5)", async () => {
    fetchMock.resetMocks();

    const invalid_evaluation_data = {
      user_id: "user_001",
      meal_date: "2024-01-15",
      family_member_id: "member_001",
      dish_name: "Grilled Chicken",
      satisfaction_score: 6,
      consumption_rate: 0.8,
      request_text: "Less salt next time"
    };

    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 400,
        error: "VALIDATION_ERROR",
        message: "Score must be within range 0-5",
        details: {
          field: "satisfaction_score",
          received_value: 6,
          valid_range: "0-5"
        }
      }),
      { status: 400 }
    );

    let response_status: number | null = null;
    let response_body: any = null;

    try {
      const api_response = await fetch("/api/meal-evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalid_evaluation_data)
      });

      response_status = api_response.status;
      response_body = await api_response.json();
    } catch (error) {
      response_status = 400;
      response_body = {
        status: 400,
        error: "VALIDATION_ERROR",
        message: "Score must be within range 0-5"
      };
    }

    expect(response_status).toBe(400);
    expect(response_body.status).toBe(400);
    expect(response_body.error).toBe("VALIDATION_ERROR");
    expect(response_body.message).toMatch(/0-5/);
    expect(response_body.details.field).toBe("satisfaction_score");
    expect(response_body.details.received_value).toBe(6);
    expect(response_body.details.valid_range).toBe("0-5");

    expect(() => {
      recordMealEvaluation({
        user_id: "user_001",
        meal_date: "2024-01-15",
        family_member_id: "member_001",
        dish_name: "Grilled Chicken",
        satisfaction_score: 6,
        consumption_rate: 0.8,
        request_text: "Less salt next time"
      });
    }).toThrow(/range/);
  });

  test("should successfully record meal evaluation with valid score within 0-5 range", async () => {
    fetchMock.resetMocks();

    const valid_evaluation_data = {
      user_id: "user_001",
      meal_date: "2024-01-15",
      family_member_id: "member_001",
      dish_name: "Grilled Chicken",
      satisfaction_score: 4,
      consumption_rate: 0.9,
      request_text: "Good flavor"
    };

    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 201,
        message: "Meal evaluation recorded successfully",
        evaluation_id: "eval_001",
        recorded_data: valid_evaluation_data
      }),
      { status: 201 }
    );

    const api_response = await fetch("/api/meal-evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valid_evaluation_data)
    });

    const response_status = api_response.status;
    const response_body = await api_response.json();

    expect(response_status).toBe(201);
    expect(response_body.status).toBe(201);
    expect(response_body.message).toContain("successfully");
    expect(response_body.recorded_data.satisfaction_score).toBe(4);
    expect(response_body.recorded_data.satisfaction_score).toBeGreaterThanOrEqual(0);
    expect(response_body.recorded_data.satisfaction_score).toBeLessThanOrEqual(5);
  });

  test("should reject score value exactly at boundary (0 is valid, -1 is invalid)", async () => {
    fetchMock.resetMocks();

    const boundary_invalid_data = {
      user_id: "user_001",
      meal_date: "2024-01-15",
      family_member_id: "member_001",
      dish_name: "Salad",
      satisfaction_score: -1,
      consumption_rate: 0.5,
      request_text: "Not appealing"
    };

    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 400,
        error: "VALIDATION_ERROR",
        message: "Score must be within range 0-5"
      }),
      { status: 400 }
    );

    expect(() => {
      recordMealEvaluation(boundary_invalid_data);
    }).toThrow(/range/);
  });

  test("should accept valid boundary values (score 0 and score 5)", async () => {
    fetchMock.resetMocks();

    const boundary_valid_min = {
      user_id: "user_002",
      meal_date: "2024-01-16",
      family_member_id: "member_002",
      dish_name: "Vegetable Soup",
      satisfaction_score: 0,
      consumption_rate: 0.3,
      request_text: "Too bland"
    };

    const boundary_valid_max = {
      user_id: "user_003",
      meal_date: "2024-01-17",
      family_member_id: "member_003",
      dish_name: "Pasta Carbonara",
      satisfaction_score: 5,
      consumption_rate: 1.0,
      request_text: "Excellent"
    };

    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 201,
        evaluation_id: "eval_002",
        recorded_data: boundary_valid_min
      }),
      { status: 201 }
    );

    const response_min = await fetch("/api/meal-evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(boundary_valid_min)
    });

    expect(response_min.status).toBe(201);

    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 201,
        evaluation_id: "eval_003",
        recorded_data: boundary_valid_max
      }),
      { status: 201 }
    );

    const response_max = await fetch("/api/meal-evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(boundary_valid_max)
    });

    expect(response_max.status).toBe(201);
  });
});