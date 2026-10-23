/**
 * @param {string} id
 * @param {string} title
 * @param {"Easy"|"Medium"|"Hard"} difficulty
 * @param {string} description
 * @param {string} scene
 * @param {string[][]} rows
 */
export function quiz(id, title, difficulty, description, scene, rows) {
  return {
    id,
    title,
    difficulty,
    description,
    scene,
    questions: rows.map(([kind, glyph, answer, why, d1, d2, d3]) => ({
      kind,
      glyph,
      answer,
      why,
      distractors: [d1, d2, d3],
    })),
  };
}
