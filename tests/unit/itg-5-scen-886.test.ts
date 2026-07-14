import { categorizeMenuRejectionReason } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類", () => {
  // SCEN-886
  test("空文字列または無効な理由データが入力された場合にエラーと判定される", () => {
    // 空文字列のケース
    expect(() => categorizeMenuRejectionReason("")).toThrow(/理由/);

    // null のケース
    expect(() => categorizeMenuRejectionReason(null as any)).toThrow(/理由/);

    // undefined のケース
    expect(() => categorizeMenuRejectionReason(undefined as any)).toThrow(/理由/);

    // 空白のみのケース
    expect(() => categorizeMenuRejectionReason("   ")).toThrow(/理由/);

    // タブのみのケース
    expect(() => categorizeMenuRejectionReason("\t\t")).toThrow(/理由/);

    // 改行のみのケース
    expect(() => categorizeMenuRejectionReason("\n")).toThrow(/理由/);
  });
});