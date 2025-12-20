export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): { picked: Pick<T, K>; rest: Omit<T, K> } {
  const picked = {} as Pick<T, K>;
  const rest = {} as Omit<T, K>;

  if (!obj || typeof obj !== 'object') {
    return { picked, rest };
  }

  for (const key in obj) {
    if (keys.includes(key as any)) {
      (picked as any)[key] = obj[key];
    } else {
      (rest as any)[key] = obj[key];
    }
  }

  return { picked, rest };
}
