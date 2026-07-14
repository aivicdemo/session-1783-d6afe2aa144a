import { classifyRejectReasonCategory } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類', () => {
  // SCEN-828
  test('複数パターンの自然言語テキストが正しいカテゴリに自動分類される', () => {
    const testCases = [
      {
        input_text: 'たんぱく質が不足しているように感じます',
        expected_category: '栄養バランス',
      },
      {
        input_text: 'えびアレルギーが入っているので作れません',
        expected_category: 'アレルギー',
      },
      {
        input_text: '調理時間が45分かかるので忙しい日には無理です',
        expected_category: '調理可能性',
      },
      {
        input_text: '食材の値段が高すぎて予算オーバーになります',
        expected_category: 'コスト',
      },
      {
        input_text: '息子が野菜を全く食べないので選べません',
        expected_category: 'その他',
      },
      {
        input_text: 'ビタミンC不足の献立は避けたいです',
        expected_category: '栄養バランス',
      },
      {
        input_text: 'そば粉を使った料理はアレルギー症状が出ます',
        expected_category: 'アレルギー',
      },
      {
        input_text: '調理工程が複雑で30分では到底無理です',
        expected_category: '調理可能性',
      },
      {
        input_text: '食材単価が市場の2倍以上で購入できません',
        expected_category: 'コスト',
      },
      {
        input_text: '家族が昨週食べたばかりで飽きています',
        expected_category: 'その他',
      },
    ];

    const results = testCases.map((test_case) =>
      classifyRejectReasonCategory(test_case.input_text)
    );

    testCases.forEach((test_case, index) => {
      expect(results[index]).toBe(test_case.expected_category);
    });

    const classification_accuracy = testCases.reduce(
      (accumulator, test_case, index) => {
        return (
          accumulator +
          (results[index] === test_case.expected_category ? 1 : 0)
        );
      },
      0
    );

    const accuracy_percentage =
      (classification_accuracy / testCases.length) * 100;

    expect(accuracy_percentage).toBe(100);
    expect(classification_accuracy).toBe(testCases.length);
  });
});