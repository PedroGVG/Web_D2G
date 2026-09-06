// Illustrative data only. Changing a benchmark never changes the player's round.
export const round = Object.freeze({ distance: 248, fairways: 64, recovery: 46, putts: 48 });
export const benchmarks = Object.freeze({
  tour: [-0.25, -0.58, -0.18, -0.42],
  '0': [0.04, -0.21, 0.02, -0.15],
  '5': [0.34, -0.11, -0.06, -0.24],
  '10': [0.72, 0.18, 0.15, -0.02],
  '15': [1.15, 0.48, 0.35, 0.12],
  '20': [1.68, 0.82, 0.58, 0.31]
});
export function compareRound(reference) {
  if (!Object.hasOwn(benchmarks, reference)) throw new RangeError('Unknown benchmark');
  const values = [...benchmarks[reference]];
  return { values, total: values.reduce((a, b) => a + b, 0), focus: values.indexOf(Math.min(...values)), round };
}
