import { classifyMealReviewReason } from '../../src/logic/it-1-br-2-1-1-1';

describe('献立却下・修正理由の自動カテゴリ分類 - 定義外テキスト処理', () => {
  // SCEN-360
  test('定義外のテキスト（特殊文字・バイナリ）が入力された場合、デフォルトカテゴリまたはエラーで適切に処理される', () => {
    // === ハッピーパス: 定義内の正常なテキスト ===
    const validInput = '栄養バランスが悪い';
    const validResult = classifyMealReviewReason(validInput);
    expect(validResult).toEqual({
      category: '栄養バランス',
      confidence: 95,
      isValid: true,
      errorMessage: null,
    });

    // === 境界値: 空文字列 ===
    const emptyInput = '';
    const emptyResult = classifyMealReviewReason(emptyInput);
    expect(emptyResult).toEqual({
      category: 'その他',
      confidence: 0,
      isValid: false,
      errorMessage: null,
    });

    // === 定義外テキスト: 特殊文字のみ ===
    const specialCharsInput = '!@#$%^&*()';
    const specialCharsResult = classifyMealReviewReason(specialCharsInput);
    expect(
      specialCharsResult.category === 'その他' ||
        specialCharsResult.category === '未分類'
    ).toBe(true);
    expect(specialCharsResult.isValid).toBe(false);
    expect(specialCharsResult.confidence).toBeLessThanOrEqual(20);

    // === 定義外テキスト: バイナリデータ（エスケープシーケンス） ===
    const binaryInput = '\x00\x01\x02\x03';
    const binaryResult = classifyMealReviewReason(binaryInput);
    expect(
      binaryResult.category === 'その他' ||
        binaryResult.category === '未分類'
    ).toBe(true);
    expect(binaryResult.isValid).toBe(false);

    // === 定義外テキスト: ランダム記号の組み合わせ ===
    const randomSymbolsInput = '~~~###~~~';
    const randomSymbolsResult = classifyMealReviewReason(randomSymbolsInput);
    expect(randomSymbolsResult.isValid).toBe(false);
    expect(randomSymbolsResult.category).toMatch(/その他|未分類/);

    // === 定義外テキスト: 絵文字のみ ===
    const emojiInput = '🚀🎉🔥';
    const emojiResult = classifyMealReviewReason(emojiInput);
    expect(emojiResult.isValid).toBe(false);
    expect(
      emojiResult.category === 'その他' ||
        emojiResult.category === '未分類'
    ).toBe(true);

    // === 定義外テキスト: 超長文（10000文字以上） ===
    const longInput = 'あ'.repeat(10000);
    const longResult = classifyMealReviewReason(longInput);
    expect(longResult.isValid).toBe(false);
    expect(longResult.errorMessage).toMatch(/入力形式|長さ|超過/);

    // === エラーハンドリング: null 入力 ===
    expect(() => classifyMealReviewReason(null as any)).toThrow(/入力値/);

    // === エラーハンドリング: undefined 入力 ===
    expect(() => classifyMealReviewReason(undefined as any)).toThrow(/入力値/);

    // === エラーハンドリング: 数値入力（型誤り） ===
    expect(() => classifyMealReviewReason(12345 as any)).toThrow(/テキスト/);

    // === 境界値: ホワイトスペースのみ ===
    const whitespaceInput = '   \t\n  ';
    const whitespaceResult = classifyMealReviewReason(whitespaceInput);
    expect(whitespaceResult.isValid).toBe(false);
    expect(whitespaceResult.category).toMatch(/その他|未分類/);

    // === 定義外テキスト: 制御文字混在 ===
    const controlCharInput = 'テスト\u0000データ\u0001';
    const controlCharResult = classifyMealReviewReason(controlCharInput);
    expect(controlCharResult.isValid).toBe(false);
    expect(controlCharResult.errorMessage).toMatch(/制御文字|不正/);

    // === 部分的マッチ: 定義内キーワード + 特殊文字 ===
    const mixedInput = '栄養バランス!!!###???';
    const mixedResult = classifyMealReviewReason(mixedInput);
    // キーワードは抽出されるが、信頼度は低下
    expect(mixedResult.category).toBe('栄養バランス');
    expect(mixedResult.confidence).toBeLessThan(80);

    // === レスポンス構造の検証 ===
    const structureTest = classifyMealReviewReason('@#$%');
    expect(structureTest).toHaveProperty('category');
    expect(structureTest).toHaveProperty('confidence');
    expect(structureTest).toHaveProperty('isValid');
    expect(structureTest).toHaveProperty('errorMessage');
    expect(typeof structureTest.category).toBe('string');
    expect(typeof structureTest.confidence).toBe('number');
    expect(typeof structureTest.isValid).toBe('boolean');
    expect(
      structureTest.errorMessage === null ||
        typeof structureTest.errorMessage === 'string'
    ).toBe(true);

    // === システム安定性: デフォルトカテゴリが常に返却される ===
    const malformedInputs = [
      '!!!',
      '\x00',
      '🎨',
      '>>><<<',
      '\n\n\n',
    ];
    malformedInputs.forEach((input) => {
      const result = classifyMealReviewReason(input);
      expect(result.category).toBeDefined();
      expect(result.category.length).toBeGreaterThan(0);
      expect(result.isValid).toBe(false);
    });
  });
});