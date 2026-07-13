import { analyzeExcessSpendingFactors } from "../../src/logic/it-1-br-6-2-1-1";

describe("食材流通業者・スーパーの在庫・価格データ連携インターフェース", () => {
  // SCEN-355: [error] 月次食費超過要因の分解・分析機能 - 購入記録または価格データが不完全な場合、超過要因分析が実行されずエラーが返される
  test("購入記録の金額情報が欠落している場合、超過要因分析はエラーを返す", () => {
    const purchase_records = [
      {
        purchase_id: "P001",
        user_id: "U123",
        store_id: "S001",
        ingredient_id: "ING001",
        quantity: 2,
        amount: 500,
        purchase_date: "2024-01-15",
      },
      {
        purchase_id: "P002",
        user_id: "U123",
        store_id: "S001",
        ingredient_id: "ING002",
        quantity: 3,
        amount: null,
        purchase_date: "2024-01-16",
      },
    ];

    const price_data = [
      {
        price_id: "PR001",
        ingredient_id: "ING001",
        store_id: "S001",
        unit_price: 250,
        category: "野菜",
        price_date: "2024-01-15",
      },
      {
        price_id: "PR002",
        ingredient_id: "ING002",
        store_id: "S001",
        unit_price: 180,
        category: "肉類",
        price_date: "2024-01-16",
      },
    ];

    const monthly_budget = 30000;
    const total_spent = 1500;

    expect(() =>
      analyzeExcessSpendingFactors({
        purchase_records,
        price_data,
        monthly_budget,
        total_spent,
      })
    ).toThrow(/金額/);
  });

  test("カテゴリ別価格データが不完全な場合、超過要因分析はエラーを返す", () => {
    const purchase_records = [
      {
        purchase_id: "P001",
        user_id: "U123",
        store_id: "S001",
        ingredient_id: "ING001",
        quantity: 2,
        amount: 500,
        purchase_date: "2024-01-15",
      },
      {
        purchase_id: "P002",
        user_id: "U123",
        store_id: "S001",
        ingredient_id: "ING002",
        quantity: 3,
        amount: 540,
        purchase_date: "2024-01-16",
      },
    ];

    const price_data = [
      {
        price_id: "PR001",
        ingredient_id: "ING001",
        store_id: "S001",
        unit_price: 250,
        category: "野菜",
        price_date: "2024-01-15",
      },
      {
        price_id: "PR002",
        ingredient_id: "ING002",
        store_id: "S001",
        unit_price: 180,
        category: null,
        price_date: "2024-01-16",
      },
    ];

    const monthly_budget = 30000;
    const total_spent = 1500;

    expect(() =>
      analyzeExcessSpendingFactors({
        purchase_records,
        price_data,
        monthly_budget,
        total_spent,
      })
    ).toThrow(/カテゴリ/);
  });

  test("購入記録が空の場合、超過要因分析はエラーを返す", () => {
    const purchase_records: never[] = [];

    const price_data = [
      {
        price_id: "PR001",
        ingredient_id: "ING001",
        store_id: "S001",
        unit_price: 250,
        category: "野菜",
        price_date: "2024-01-15",
      },
    ];

    const monthly_budget = 30000;
    const total_spent = 1500;

    expect(() =>
      analyzeExcessSpendingFactors({
        purchase_records,
        price_data,
        monthly_budget,
        total_spent,
      })
    ).toThrow(/購入記録/);
  });

  test("価格データが空の場合、超過要因分析はエラーを返す", () => {
    const purchase_records = [
      {
        purchase_id: "P001",
        user_id: "U123",
        store_id: "S001",
        ingredient_id: "ING001",
        quantity: 2,
        amount: 500,
        purchase_date: "2024-01-15",
      },
    ];

    const price_data: never[] = [];

    const monthly_budget = 30000;
    const total_spent = 1500;

    expect(() =>
      analyzeExcessSpendingFactors({
        purchase_records,
        price_data,
        monthly_budget,
        total_spent,
      })
    ).toThrow(/価格データ/);
  });

  test("購入記録の必須フィールドが複数欠落している場合、超過要因分析はエラーを返す", () => {
    const purchase_records = [
      {
        purchase_id: "P001",
        user_id: "U123",
        store_id: "S001",
        ingredient_id: "ING001",
        quantity: null,
        amount: null,
        purchase_date: "2024-01-15",
      },
    ];

    const price_data = [
      {
        price_id: "PR001",
        ingredient_id: "ING001",
        store_id: "S001",
        unit_price: 250,
        category: "野菜",
        price_date: "2024-01-15",
      },
    ];

    const monthly_budget = 30000;
    const total_spent = 1500;

    expect(() =>
      analyzeExcessSpendingFactors({
        purchase_records,
        price_data,
        monthly_budget,
        total_spent,
      })
    ).toThrow(/必須データ/);
  });

  test("完全な購入記録と価格データがある場合、超過要因分析が正常に実行される", () => {
    const purchase_records = [
      {
        purchase_id: "P001",
        user_id: "U123",
        store_id: "S001",
        ingredient_id: "ING001",
        quantity: 2,
        amount: 500,
        purchase_date: "2024-01-15",
      },
      {
        purchase_id: "P002",
        user_id: "U123",
        store_id: "S001",
        ingredient_id: "ING002",
        quantity: 3,
        amount: 540,
        purchase_date: "2024-01-16",
      },
    ];

    const price_data = [
      {
        price_id: "PR001",
        ingredient_id: "ING001",
        store_id: "S001",
        unit_price: 250,
        category: "野菜",
        price_date: "2024-01-15",
      },
      {
        price_id: "PR002",
        ingredient_id: "ING002",
        store_id: "S001",
        unit_price: 180,
        category: "肉類",
        price_date: "2024-01-16",
      },
    ];

    const monthly_budget = 30000;
    const total_spent = 31500;

    const result = analyzeExcessSpendingFactors({
      purchase_records,
      price_data,
      monthly_budget,
      total_spent,
    });

    expect(result).toEqual({
      status: "success",
      excess_amount: 1500,
      excess_percentage: 5.0,
      composition_analysis: {
        vegetable_ratio: 33.33,
        meat_ratio: 36.0,
        other_ratio: 30.67,
      },
      price_variance: {
        vegetable_variance_percentage: 0,
        meat_variance_percentage: 0,
        other_variance_percentage: 0,
      },
      recommendations: [
        {
          category: "肉類",
          suggestion: "価格の低い商品への切り替え検討",
          potential_saving: 150,
        },
        {
          category: "野菜",
          suggestion: "季節外商品の削減",
          potential_saving: 100,
        },
      ],
      log_details: {
        missing_fields: [],
        validation_status: "passed",
        timestamp: "2024-01-31T00:00:00Z",
      },
    });
  });

  test("価格データにおいて単価情報が欠落している場合、超過要因分析はエラーを返す", () => {
    const purchase_records = [
      {
        purchase_id: "P001",
        user_id: "U123",
        store_id: "S001",
        ingredient_id: "ING001",
        quantity: 2,
        amount: 500,
        purchase_date: "2024-01-15",
      },
    ];

    const price_data = [
      {
        price_id: "PR001",
        ingredient_id: "ING001",
        store_id: "S001",
        unit_price: null,
        category: "野菜",
        price_date: "2024-01-15",
      },
    ];

    const monthly_budget = 30000;
    const total_spent = 1500;

    expect(() =>
      analyzeExcessSpendingFactors({
        purchase_records,
        price_data,
        monthly_budget,
        total_spent,
      })
    ).toThrow(/単価/);
  });

  test("購入日時情報が欠落している場合、超過要因分析はエラーを返す", () => {
    const purchase_records = [
      {
        purchase_id: "P001",
        user_id: "U123",
        store_id: "S001",
        ingredient_id: "ING001",
        quantity: 2,
        amount: 500,
        purchase_date: null,
      },
    ];

    const price_data = [
      {
        price_id: "PR001",
        ingredient_id: "ING001",
        store_id: "S001",
        unit_price: 250,
        category: "野菜",
        price_date: "2024-01-15",
      },
    ];

    const monthly_budget = 30000;
    const total_spent = 1500;

    expect(() =>
      analyzeExcessSpendingFactors({
        purchase_records,
        price_data,
        monthly_budget,
        total_spent,
      })
    ).toThrow(/購入日時/);
  });
});