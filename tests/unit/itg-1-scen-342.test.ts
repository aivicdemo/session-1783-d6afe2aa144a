import { validateAndNormalizeInventory } from "../../src/logic/it-1-1-1";

describe("冷蔵庫在庫情報の正規化・バリデーション", () => {
  // SCEN-342: [edge] 冷蔵庫在庫情報の正規化・バリデーション - 昨日が賞味期限の食材が拒否される
  test("賞味期限が昨日以前の食材は拒否され、エラーメッセージが表示される", () => {
    const today = new Date("2024-01-15");
    const yesterday = new Date("2024-01-14");

    const input = {
      itemName: "トマト",
      quantity: 2,
      quantityUnit: "個",
      expirationDate: yesterday.toISOString().split("T")[0],
    };

    expect(() => validateAndNormalizeInventory(input, today)).toThrow(
      /賞味期限切れ/
    );
  });

  test("賞味期限が本日の食材は受け入れられる", () => {
    const today = new Date("2024-01-15");

    const input = {
      itemName: "トマト",
      quantity: 2,
      quantityUnit: "個",
      expirationDate: today.toISOString().split("T")[0],
    };

    const result = validateAndNormalizeInventory(input, today);

    expect(result).toEqual({
      itemName: "トマト",
      quantity: 2,
      quantityUnit: "個",
      expirationDate: "2024-01-15",
      isValid: true,
      normalizedItemName: "トマト",
    });
  });

  test("賞味期限が明日の食材は受け入れられる", () => {
    const today = new Date("2024-01-15");
    const tomorrow = new Date("2024-01-16");

    const input = {
      itemName: "トマト",
      quantity: 2,
      quantityUnit: "個",
      expirationDate: tomorrow.toISOString().split("T")[0],
    };

    const result = validateAndNormalizeInventory(input, today);

    expect(result).toEqual({
      itemName: "トマト",
      quantity: 2,
      quantityUnit: "個",
      expirationDate: "2024-01-16",
      isValid: true,
      normalizedItemName: "トマト",
    });
  });

  test("賞味期限が1週間以上先の食材は受け入れられる", () => {
    const today = new Date("2024-01-15");
    const sevenDaysLater = new Date("2024-01-22");

    const input = {
      itemName: "キャベツ",
      quantity: 1,
      quantityUnit: "個",
      expirationDate: sevenDaysLater.toISOString().split("T")[0],
    };

    const result = validateAndNormalizeInventory(input, today);

    expect(result).toEqual({
      itemName: "キャベツ",
      quantity: 1,
      quantityUnit: "個",
      expirationDate: "2024-01-22",
      isValid: true,
      normalizedItemName: "キャベツ",
    });
  });

  test("食材名が空文字列の場合はエラー", () => {
    const today = new Date("2024-01-15");
    const tomorrow = new Date("2024-01-16");

    const input = {
      itemName: "",
      quantity: 2,
      quantityUnit: "個",
      expirationDate: tomorrow.toISOString().split("T")[0],
    };

    expect(() => validateAndNormalizeInventory(input, today)).toThrow(
      /食材名/
    );
  });

  test("数量がゼロ以下の場合はエラー", () => {
    const today = new Date("2024-01-15");
    const tomorrow = new Date("2024-01-16");

    const input = {
      itemName: "トマト",
      quantity: 0,
      quantityUnit: "個",
      expirationDate: tomorrow.toISOString().split("T")[0],
    };

    expect(() => validateAndNormalizeInventory(input, today)).toThrow(/数量/);
  });

  test("数量が負の値の場合はエラー", () => {
    const today = new Date("2024-01-15");
    const tomorrow = new Date("2024-01-16");

    const input = {
      itemName: "トマト",
      quantity: -1,
      quantityUnit: "個",
      expirationDate: tomorrow.toISOString().split("T")[0],
    };

    expect(() => validateAndNormalizeInventory(input, today)).toThrow(/数量/);
  });

  test("賞味期限のフォーマットが不正な場合はエラー", () => {
    const today = new Date("2024-01-15");

    const input = {
      itemName: "トマト",
      quantity: 2,
      quantityUnit: "個",
      expirationDate: "2024/01/16",
    };

    expect(() => validateAndNormalizeInventory(input, today)).toThrow(
      /賞味期限/
    );
  });

  test("複数日前（3日前）の賞味期限は拒否される", () => {
    const today = new Date("2024-01-15");
    const threeDaysAgo = new Date("2024-01-12");

    const input = {
      itemName: "トマト",
      quantity: 2,
      quantityUnit: "個",
      expirationDate: threeDaysAgo.toISOString().split("T")[0],
    };

    expect(() => validateAndNormalizeInventory(input, today)).toThrow(
      /賞味期限切れ/
    );
  });

  test("食材名の先頭末尾の空白は正規化される", () => {
    const today = new Date("2024-01-15");
    const tomorrow = new Date("2024-01-16");

    const input = {
      itemName: "  トマト  ",
      quantity: 2,
      quantityUnit: "個",
      expirationDate: tomorrow.toISOString().split("T")[0],
    };

    const result = validateAndNormalizeInventory(input, today);

    expect(result.normalizedItemName).toBe("トマト");
    expect(result.isValid).toBe(true);
  });
});