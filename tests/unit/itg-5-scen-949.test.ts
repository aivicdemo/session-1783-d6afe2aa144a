import { detectAndExcludeOutliers } from '../../src/logic/it-7-2-1';

describe('SCEN-949: 外れ値・異常値検出・除外機能 - ユーザー満足度スコア範囲検証', () => {
  // SCEN-949
  test('ユーザー満足度スコアの0〜100範囲外の異常値を検出・除外する', () => {
    // 準備: 正常値と異常値を混在させたテストデータセット
    const inputDataset = [
      { user_id: 1, satisfaction_score: 0 },      // 正常値: 最小
      { user_id: 2, satisfaction_score: 50 },     // 正常値: 中央
      { user_id: 3, satisfaction_score: 100 },    // 正常値: 最大
      { user_id: 4, satisfaction_score: -1 },     // 異常値: 範囲下限超過
      { user_id: 5, satisfaction_score: -50 },    // 異常値: 範囲下限大幅超過
      { user_id: 6, satisfaction_score: 101 },    // 異常値: 範囲上限超過
      { user_id: 7, satisfaction_score: 150 },    // 異常値: 範囲上限大幅超過
      { user_id: 8, satisfaction_score: 999 },    // 異常値: 範囲上限極大超過
      { user_id: 9, satisfaction_score: -999 },   // 異常値: 範囲下限極大超過
    ];

    // 実行: 外れ値・異常値検出及び除外処理
    const result = detectAndExcludeOutliers(inputDataset);

    // 検証1: 異常値検出結果の確認
    expect(result.detected_outliers).toHaveLength(6);
    
    // 検証2: 各異常値のエラー情報が正しく生成されていることを確認
    const outlier_values = result.detected_outliers.map((o: any) => o.satisfaction_score).sort((a: number, b: number) => a - b);
    expect(outlier_values).toEqual([-999, -50, -1, 101, 150, 999]);

    // 検証3: 各異常値に対してエラータイプが正しく付与されていることを確認
    result.detected_outliers.forEach((outlier: any) => {
      expect(outlier.error_type).toBe('OutOfRange');
    });

    // 検証4: 各異常値に対してエラーメッセージが生成されていることを確認
    result.detected_outliers.forEach((outlier: any) => {
      expect(typeof outlier.error_message).toBe('string');
      expect(outlier.error_message.length).toBeGreaterThan(0);
    });

    // 検証5: 異常値除外後のデータセットサイズを確認
    expect(result.cleaned_dataset).toHaveLength(3);

    // 検証6: 除外後のデータセットに正常値のみが残っていることを確認
    const cleaned_scores = result.cleaned_dataset.map((item: any) => item.satisfaction_score).sort((a: number, b: number) => a - b);
    expect(cleaned_scores).toEqual([0, 50, 100]);

    // 検証7: 除外後のユーザーIDが正しく対応していることを確認
    const cleaned_user_ids = result.cleaned_dataset.map((item: any) => item.user_id).sort((a: number, b: number) => a - b);
    expect(cleaned_user_ids).toEqual([1, 2, 3]);

    // 検証8: 検出された異常値の user_id が正しく記録されていることを確認
    const outlier_user_ids = result.detected_outliers.map((o: any) => o.user_id).sort((a: number, b: number) => a - b);
    expect(outlier_user_ids).toEqual([4, 5, 6, 7, 8, 9]);
  });
});