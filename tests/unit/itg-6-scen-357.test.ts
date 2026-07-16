import { defineSegmentationCriteria } from "../../src/logic/it-1-br-8-2-1-1";

describe("専業主夫層セグメント分類基準定義機能", () => {
  // SCEN-357: [error] 専業主夫層セグメント分類基準定義機能 - 3軸のいずれかが定義されない場合、エラーが発生する
  test("3軸のいずれかが定義されていない場合、エラーメッセージが発生する", () => {
    const criteriaWithMissingAxis = {
      axis1: {
        name: "家事負担度",
        levels: ["低", "中", "高"],
      },
      axis2: {
        name: "育児参加度",
        levels: ["低", "中", "高"],
      },
      axis3: undefined,
    };

    expect(() => defineSegmentationCriteria(criteriaWithMissingAxis)).toThrow(
      /差別化軸/
    );
  });

  test("3軸すべてが定義されている場合、セグメント分類基準が正常に保存される", () => {
    const validCriteria = {
      axis1: {
        name: "家事負担度",
        levels: ["低", "中", "高"],
      },
      axis2: {
        name: "育児参加度",
        levels: ["低", "中", "高"],
      },
      axis3: {
        name: "社会参加度",
        levels: ["低", "中", "高"],
      },
    };

    const result = defineSegmentationCriteria(validCriteria);

    expect(result).toEqual({
      status: "success",
      segmentationId: expect.any(String),
      axes: [
        {
          axisName: "家事負担度",
          levels: ["低", "中", "高"],
        },
        {
          axisName: "育児参加度",
          levels: ["低", "中", "高"],
        },
        {
          axisName: "社会参加度",
          levels: ["低", "中", "高"],
        },
      ],
    });
  });

  test("第1軸が定義されていない場合、エラーメッセージが発生する", () => {
    const criteriaWithMissingAxis1 = {
      axis1: undefined,
      axis2: {
        name: "育児参加度",
        levels: ["低", "中", "高"],
      },
      axis3: {
        name: "社会参加度",
        levels: ["低", "中", "高"],
      },
    };

    expect(() =>
      defineSegmentationCriteria(criteriaWithMissingAxis1)
    ).toThrow(/差別化軸/);
  });

  test("第2軸が定義されていない場合、エラーメッセージが発生する", () => {
    const criteriaWithMissingAxis2 = {
      axis1: {
        name: "家事負担度",
        levels: ["低", "中", "高"],
      },
      axis2: undefined,
      axis3: {
        name: "社会参加度",
        levels: ["低", "中", "高"],
      },
    };

    expect(() =>
      defineSegmentationCriteria(criteriaWithMissingAxis2)
    ).toThrow(/差別化軸/);
  });
});