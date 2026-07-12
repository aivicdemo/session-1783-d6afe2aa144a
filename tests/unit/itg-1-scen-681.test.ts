import { recalculatePriorityMatrix } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-681
  test('ユーザーセグメント構成の変動が0%の場合でも新規ペイン要因が検出されると再計算が実行される', () => {
    const currentSegmentComposition = {
      segment_a_ratio: 0.30,
      segment_b_ratio: 0.40,
      segment_c_ratio: 0.30,
      measured_at: '2024-01-15T09:00:00Z',
    };

    const previousSegmentComposition = {
      segment_a_ratio: 0.30,
      segment_b_ratio: 0.40,
      segment_c_ratio: 0.30,
      measured_at: '2024-01-08T09:00:00Z',
    };

    const detectedNewPainFactors = [
      {
        pain_factor_id: 'new_allergy_001',
        pain_factor_name: '新規アレルギー（ナッツ類）',
        detection_timestamp: '2024-01-15T11:30:00Z',
        affected_segment_count: 2,
      },
      {
        pain_factor_id: 'new_nutrition_001',
        pain_factor_name: '新規栄養制限（塩分制限）',
        detection_timestamp: '2024-01-15T11:35:00Z',
        affected_segment_count: 3,
      },
    ];

    const priorityMatrixBeforeRecalculation = [
      {
        pain_factor_id: 'existing_001',
        frequency_score: 75,
        impact_score: 80,
        priority_rank: 'high',
      },
      {
        pain_factor_id: 'existing_002',
        frequency_score: 45,
        impact_score: 60,
        priority_rank: 'medium',
      },
    ];

    const result = recalculatePriorityMatrix({
      current_segment_composition: currentSegmentComposition,
      previous_segment_composition: previousSegmentComposition,
      detected_new_pain_factors: detectedNewPainFactors,
      priority_matrix_before_recalculation: priorityMatrixBeforeRecalculation,
    });

    expect(result.segment_composition_change_rate).toBe(0);
    expect(result.new_pain_factors_detected_count).toBe(2);
    expect(result.recalculation_triggered).toBe(true);
    expect(result.recalculation_reason).toBe('新規ペイン要因検出により再計算が必要');

    expect(result.recalculation_executed).toBe(true);
    expect(result.recalculation_timestamp).toBeDefined();

    const recalculatedMatrix = result.priority_matrix_after_recalculation;
    expect(recalculatedMatrix.length).toBe(4);

    const newPainInMatrix = recalculatedMatrix.find(
      (item) => item.pain_factor_id === 'new_allergy_001'
    );
    expect(newPainInMatrix).toBeDefined();
    expect(newPainInMatrix?.priority_rank).toBe('high');
    expect(newPainInMatrix?.frequency_score).toBeGreaterThan(0);
    expect(newPainInMatrix?.impact_score).toBeGreaterThan(0);

    const newNutritionInMatrix = recalculatedMatrix.find(
      (item) => item.pain_factor_id === 'new_nutrition_001'
    );
    expect(newNutritionInMatrix).toBeDefined();
    expect(newNutritionInMatrix?.priority_rank).toBe('high');

    expect(result.menu_generation_priority_updated).toBe(true);
    expect(result.affected_user_segments).toContain('segment_a');
    expect(result.affected_user_segments).toContain('segment_b');
    expect(result.affected_user_segments).toContain('segment_c');

    expect(result.matrix_version_incremented).toBe(true);
    expect(result.previous_matrix_version).toBe(1);
    expect(result.current_matrix_version).toBe(2);
  });
});