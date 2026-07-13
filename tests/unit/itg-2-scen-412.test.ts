import { detectConstraintConflict } from "../../src/logic/it-1-br-2-1-1-1";

describe("制限条件抵触検出と献立反映統合機能", () => {
  // SCEN-412
  test("レビュー承認待ちの状態で追加の制限条件が入力された場合、競合エラーを検出して既存レビュー内容を維持", () => {
    const existingConstraints = {
      calorieLimit: 2000,
      sodiumLimit: 6,
      reviewStatus: "pending_approval",
      reviewTimestamp: new Date("2024-01-15T10:00:00Z"),
    };

    const newConstraintInput = {
      proteinMin: 50,
      inputTimestamp: new Date("2024-01-15T11:30:00Z"),
    };

    const result = detectConstraintConflict(
      existingConstraints,
      newConstraintInput
    );

    expect(result.hasConflict).toBe(true);
    expect(result.conflictType).toBe("pending_review_state");
    expect(result.errorMessage).toMatch(/レビュー承認待ち/);
    expect(result.errorMessage).toMatch(/追加の制限条件の変更はできません/);
    expect(result.errorMessage).toMatch(/レビュー完了後/);
    expect(result.newInputSaved).toBe(false);
    expect(result.maintainedReviewContent).toEqual({
      calorieLimit: 2000,
      sodiumLimit: 6,
      reviewStatus: "pending_approval",
      reviewTimestamp: new Date("2024-01-15T10:00:00Z"),
    });
    expect(result.recommendedAction).toBe(
      "cancel_review_or_wait_approval"
    );
  });

  test("レビュー完了後に追加制限条件が入力された場合、競合エラーは発生せず正常に保存される", () => {
    const existingConstraints = {
      calorieLimit: 2000,
      sodiumLimit: 6,
      reviewStatus: "approved",
      reviewTimestamp: new Date("2024-01-14T10:00:00Z"),
    };

    const newConstraintInput = {
      proteinMin: 50,
      inputTimestamp: new Date("2024-01-15T11:30:00Z"),
    };

    const result = detectConstraintConflict(
      existingConstraints,
      newConstraintInput
    );

    expect(result.hasConflict).toBe(false);
    expect(result.newInputSaved).toBe(true);
    expect(result.mergedConstraints).toEqual({
      calorieLimit: 2000,
      sodiumLimit: 6,
      proteinMin: 50,
      reviewStatus: "approved",
      reviewTimestamp: new Date("2024-01-14T10:00:00Z"),
    });
  });

  test("レビュー却下状態で追加制限条件が入力された場合、競合エラーは発生せず新規入力が保存される", () => {
    const existingConstraints = {
      calorieLimit: 2000,
      sodiumLimit: 6,
      reviewStatus: "rejected",
      reviewTimestamp: new Date("2024-01-14T10:00:00Z"),
    };

    const newConstraintInput = {
      proteinMin: 50,
      inputTimestamp: new Date("2024-01-15T11:30:00Z"),
    };

    const result = detectConstraintConflict(
      existingConstraints,
      newConstraintInput
    );

    expect(result.hasConflict).toBe(false);
    expect(result.newInputSaved).toBe(true);
  });

  test("複数の追加制限条件が同時に入力され、レビュー待機状態の場合、すべての新規入力に対して競合エラーを返す", () => {
    const existingConstraints = {
      calorieLimit: 2000,
      sodiumLimit: 6,
      reviewStatus: "pending_approval",
      reviewTimestamp: new Date("2024-01-15T10:00:00Z"),
    };

    const newConstraintInput = {
      proteinMin: 50,
      fatMax: 70,
      fiberMin: 25,
      inputTimestamp: new Date("2024-01-15T11:30:00Z"),
    };

    const result = detectConstraintConflict(
      existingConstraints,
      newConstraintInput
    );

    expect(result.hasConflict).toBe(true);
    expect(result.conflictType).toBe("pending_review_state");
    expect(result.newInputSaved).toBe(false);
    expect(result.rejectedConstraintCount).toBe(3);
  });

  test("レビュー待機中に既存制限条件の変更が試みられた場合、競合エラーを検出", () => {
    const existingConstraints = {
      calorieLimit: 2000,
      sodiumLimit: 6,
      reviewStatus: "pending_approval",
      reviewTimestamp: new Date("2024-01-15T10:00:00Z"),
    };

    const newConstraintInput = {
      calorieLimit: 1800,
      inputTimestamp: new Date("2024-01-15T11:30:00Z"),
    };

    const result = detectConstraintConflict(
      existingConstraints,
      newConstraintInput
    );

    expect(result.hasConflict).toBe(true);
    expect(result.conflictType).toBe("pending_review_state");
    expect(result.errorMessage).toMatch(/レビュー承認待ち/);
    expect(result.newInputSaved).toBe(false);
  });
});