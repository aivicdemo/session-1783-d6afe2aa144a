import { validateAndExtractQualityPassedData } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-710: [error] 品質検証済みデータ抽出機能 - 品質検証不合格のデータが混在する場合に差別化軸判定処理がエラーで遮断される
  test("品質検証不合格データが混在する場合、差別化軸判定処理はエラーで遮断される", () => {
    const mixedDataset = [
      {
        id: "eval-001",
        userId: "user-123",
        mealId: "meal-2024-01-15-1",
        satisfactionScore: 5,
        completionRate: 100,
        qualityVerificationStatus: "PASSED",
        qualityVerificationDate: "2024-01-15T20:00:00Z",
        verificationNotes: "Valid data"
      },
      {
        id: "eval-002",
        userId: "user-123",
        mealId: "meal-2024-01-15-2",
        satisfactionScore: 3,
        completionRate: 80,
        qualityVerificationStatus: "FAILED",
        qualityVerificationDate: "2024-01-15T20:30:00Z",
        verificationNotes: "Outlier detected: satisfaction score outside expected range"
      },
      {
        id: "eval-003",
        userId: "user-123",
        mealId: "meal-2024-01-15-3",
        satisfactionScore: 4,
        completionRate: 90,
        qualityVerificationStatus: "PASSED",
        qualityVerificationDate: "2024-01-15T21:00:00Z",
        verificationNotes: "Valid data"
      }
    ];

    const errorHandler = jest.fn((error: Error) => {
      return {
        errorCode: "QUALITY_VALIDATION_FAILED",
        errorMessage: error.message,
        affectedRecordCount: 1,
        timestamp: "2024-01-15T21:30:00Z"
      };
    });

    const result = () =>
      validateAndExtractQualityPassedData(mixedDataset, errorHandler);

    expect(result).toThrow(/品質検証/);

    expect(errorHandler).toHaveBeenCalled();
    const callArgs = errorHandler.mock.calls[0][0];
    expect(callArgs).toEqual(
      expect.objectContaining({
        message: expect.stringMatching(/品質検証|不合格/)
      })
    );
  });
});