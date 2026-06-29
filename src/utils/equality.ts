/**
 * Shallow equality helpers used to skip redundant React state updates when the
 * worker re-broadcasts an unchanged object/array (keeps referential identity so
 * memoized consumers don't re-render).
 */

export const isObjEqual = (
  a: Record<string, unknown> | undefined,
  b: Record<string, unknown> | undefined,
): boolean => {
  if (!a || !b) return a === b;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => a[k] === b[k]);
};

export const isArrEqual = (a: unknown[] | undefined, b: unknown[] | undefined): boolean => {
  if (!a || !b) return a === b;
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
};
