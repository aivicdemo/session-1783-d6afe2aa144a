import { detectConflictingMenus } from "../../src/logic/it-1-br-2-1-1-1";

describe("制限抵触献立の自動検出・一覧表示機能", () => {
  // SCEN-321
  test("アレルギー情報の変更時に、該当アレルゲンを含む過去献立が正確に抽出され表示される", () => {
    const pastMenus = [
      {
        id: "menu_001",
        date: "2024-01-10",
        name: "えび天丼",
        ingredients: [
          { name: "えび", allergen: "えび" },
          { name: "卵", allergen: "卵" },
          { name: "小麦", allergen: "小麦" }
        ]
      },
      {
        id: "menu_002",
        date: "2024-01-12",
        name: "サーモン刺身",
        ingredients: [
          { name: "サーモン", allergen: null },
          { name: "醤油", allergen: null }
        ]
      },
      {
        id: "menu_003",
        date: "2024-01-14",
        name: "えびとアボカドサラダ",
        ingredients: [
          { name: "えび", allergen: "えび" },
          { name: "アボカド", allergen: null },
          { name: "レモン汁", allergen: null }
        ]
      },
      {
        id: "menu_004",
        date: "2024-01-16",
        name: "唐揚げ定食",
        ingredients: [
          { name: "鶏肉", allergen: null },
          { name: "卵", allergen: "卵" },
          { name: "小麦粉", allergen: "小麦" }
        ]
      },
      {
        id: "menu_005",
        date: "2024-01-18",
        name: "えびみそラーメン",
        ingredients: [
          { name: "えび", allergen: "えび" },
          { name: "味噌", allergen: null },
          { name: "麺", allergen: "小麦" }
        ]
      }
    ];

    const newAllergens = ["えび"];

    const result = detectConflictingMenus(pastMenus, newAllergens);

    expect(result.conflictingMenus).toHaveLength(3);
    expect(result.conflictingMenus[0].id).toBe("menu_001");
    expect(result.conflictingMenus[0].date).toBe("2024-01-10");
    expect(result.conflictingMenus[0].name).toBe("えび天丼");
    expect(result.conflictingMenus[0].conflictingIngredients).toEqual([
      { name: "えび", allergen: "えび" }
    ]);

    expect(result.conflictingMenus[1].id).toBe("menu_003");
    expect(result.conflictingMenus[1].date).toBe("2024-01-14");
    expect(result.conflictingMenus[1].name).toBe("えびとアボカドサラダ");
    expect(result.conflictingMenus[1].conflictingIngredients).toEqual([
      { name: "えび", allergen: "えび" }
    ]);

    expect(result.conflictingMenus[2].id).toBe("menu_005");
    expect(result.conflictingMenus[2].date).toBe("2024-01-18");
    expect(result.conflictingMenus[2].name).toBe("えびみそラーメン");
    expect(result.conflictingMenus[2].conflictingIngredients).toEqual([
      { name: "えび", allergen: "えび" }
    ]);

    expect(result.totalConflictingCount).toBe(3);
  });

  test("複数のアレルゲン追加後、全て該当する献立が漏れなく抽出される", () => {
    const pastMenus = [
      {
        id: "menu_101",
        date: "2024-02-01",
        name: "えび＆卵焼き",
        ingredients: [
          { name: "えび", allergen: "えび" },
          { name: "卵", allergen: "卵" }
        ]
      },
      {
        id: "menu_102",
        date: "2024-02-02",
        name: "サーモン刺身",
        ingredients: [
          { name: "サーモン", allergen: null },
          { name: "醤油", allergen: null }
        ]
      },
      {
        id: "menu_103",
        date: "2024-02-03",
        name: "カニコロッケ",
        ingredients: [
          { name: "カニ", allergen: "かに" },
          { name: "卵", allergen: "卵" }
        ]
      },
      {
        id: "menu_104",
        date: "2024-02-04",
        name: "えびと貝のパスタ",
        ingredients: [
          { name: "えび", allergen: "えび" },
          { name: "アサリ", allergen: "貝" }
        ]
      },
      {
        id: "menu_105",
        date: "2024-02-05",
        name: "野菜炒め",
        ingredients: [
          { name: "キャベツ", allergen: null },
          { name: "人参", allergen: null }
        ]
      }
    ];

    const multipleAllergens = ["えび", "卵", "かに"];

    const result = detectConflictingMenus(pastMenus, multipleAllergens);

    expect(result.conflictingMenus).toHaveLength(4);
    expect(result.conflictingMenus.map((m) => m.id)).toEqual([
      "menu_101",
      "menu_103",
      "menu_104",
      "menu_102"
    ].slice(0, 4));

    const menu101 = result.conflictingMenus.find((m) => m.id === "menu_101");
    expect(menu101?.conflictingIngredients).toContainEqual({
      name: "えび",
      allergen: "えび"
    });
    expect(menu101?.conflictingIngredients).toContainEqual({
      name: "卵",
      allergen: "卵"
    });

    const menu104 = result.conflictingMenus.find((m) => m.id === "menu_104");
    expect(menu104?.conflictingIngredients).toContainEqual({
      name: "えび",
      allergen: "えび"
    });

    expect(result.totalConflictingCount).toBe(4);
  });

  test("アレルゲンを含まない献立は抽出されない", () => {
    const pastMenus = [
      {
        id: "menu_201",
        date: "2024-03-01",
        name: "鶏肉のグリル",
        ingredients: [
          { name: "鶏肉", allergen: null },
          { name: "塩", allergen: null }
        ]
      },
      {
        id: "menu_202",
        date: "2024-03-02",
        name: "野菜スープ",
        ingredients: [
          { name: "トマト", allergen: null },
          { name: "玉ねぎ", allergen: null }
        ]
      }
    ];

    const newAllergens = ["えび"];

    const result = detectConflictingMenus(pastMenus, newAllergens);

    expect(result.conflictingMenus).toHaveLength(0);
    expect(result.totalConflictingCount).toBe(0);
  });

  test("空の過去献立リストに対しても安全に処理される", () => {
    const pastMenus: any[] = [];
    const newAllergens = ["えび", "卵"];

    const result = detectConflictingMenus(pastMenus, newAllergens);

    expect(result.conflictingMenus).toHaveLength(0);
    expect(result.totalConflictingCount).toBe(0);
  });

  test("献立詳細情報に日付と全アレルゲン成分が正確に表示される", () => {
    const pastMenus = [
      {
        id: "menu_301",
        date: "2024-04-15",
        name: "えび&くるみのサラダ",
        ingredients: [
          { name: "えび", allergen: "えび" },
          { name: "くるみ", allergen: "くるみ" },
          { name: "レタス", allergen: null }
        ]
      }
    ];

    const newAllergens = ["えび"];

    const result = detectConflictingMenus(pastMenus, newAllergens);

    expect(result.conflictingMenus).toHaveLength(1);
    const detailMenu = result.conflictingMenus[0];
    expect(detailMenu.date).toBe("2024-04-15");
    expect(detailMenu.conflictingIngredients).toHaveLength(1);
    expect(detailMenu.conflictingIngredients[0]).toEqual({
      name: "えび",
      allergen: "えび"
    });
  });
});