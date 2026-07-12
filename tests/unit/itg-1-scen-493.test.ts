import { validateAlgorithmVersionDeployment } from "../../src/logic/it-1-1-1";

describe("段階的アルゴリズム展開と効果検証", () => {
  // SCEN-493
  test("検証期間が無効な場合、アルゴリズムバージョン配信がエラーとなる", () => {
    // 検証期間の開始日時に空文字列を入力するケース
    expect(() =>
      validateAlgorithmVersionDeployment({
        algorithmVersionId: "algo_v2_20240101",
        verificationStartDate: "",
        verificationEndDate: "2024-01-31T23:59:59Z",
        targetUserSegments: ["segment_1"],
      })
    ).toThrow(/検証期間/);

    // 検証期間の開始日時に null を入力するケース
    expect(() =>
      validateAlgorithmVersionDeployment({
        algorithmVersionId: "algo_v2_20240101",
        verificationStartDate: null as any,
        verificationEndDate: "2024-01-31T23:59:59Z",
        targetUserSegments: ["segment_1"],
      })
    ).toThrow(/検証期間/);

    // 検証期間の開始日時に無効な日付形式を入力するケース
    expect(() =>
      validateAlgorithmVersionDeployment({
        algorithmVersionId: "algo_v2_20240101",
        verificationStartDate: "2024/01/01 10:00:00",
        verificationEndDate: "2024-01-31T23:59:59Z",
        targetUserSegments: ["segment_1"],
      })
    ).toThrow(/検証期間/);

    // 検証期間の終了日時に空文字列を入力するケース
    expect(() =>
      validateAlgorithmVersionDeployment({
        algorithmVersionId: "algo_v2_20240101",
        verificationStartDate: "2024-01-01T00:00:00Z",
        verificationEndDate: "",
        targetUserSegments: ["segment_1"],
      })
    ).toThrow(/検証期間/);

    // 検証期間の終了日時に null を入力するケース
    expect(() =>
      validateAlgorithmVersionDeployment({
        algorithmVersionId: "algo_v2_20240101",
        verificationStartDate: "2024-01-01T00:00:00Z",
        verificationEndDate: null as any,
        targetUserSegments: ["segment_1"],
      })
    ).toThrow(/検証期間/);

    // 検証期間の終了日時に無効な日付形式を入力するケース
    expect(() =>
      validateAlgorithmVersionDeployment({
        algorithmVersionId: "algo_v2_20240101",
        verificationStartDate: "2024-01-01T00:00:00Z",
        verificationEndDate: "2024/01/31 23:59:59",
        targetUserSegments: ["segment_1"],
      })
    ).toThrow(/検証期間/);

    // 開始日時が終了日時より後の場合
    expect(() =>
      validateAlgorithmVersionDeployment({
        algorithmVersionId: "algo_v2_20240101",
        verificationStartDate: "2024-01-31T23:59:59Z",
        verificationEndDate: "2024-01-01T00:00:00Z",
        targetUserSegments: ["segment_1"],
      })
    ).toThrow(/検証期間/);

    // 正常系：有効な検証期間で配信成功
    const result = validateAlgorithmVersionDeployment({
      algorithmVersionId: "algo_v2_20240101",
      verificationStartDate: "2024-01-01T00:00:00Z",
      verificationEndDate: "2024-01-31T23:59:59Z",
      targetUserSegments: ["segment_1", "segment_2"],
    });

    expect(result).toEqual({
      isValid: true,
      algorithmVersionId: "algo_v2_20240101",
      verificationStartDate: "2024-01-01T00:00:00Z",
      verificationEndDate: "2024-01-31T23:59:59Z",
      targetUserSegments: ["segment_1", "segment_2"],
      deploymentStatus: "pending",
    });
  });
});