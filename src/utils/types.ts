export function makeKey<PF extends string, N extends string>(prefix: PF, name: N) {
  return prefix + '/' + name as `${PF}/${N}`
}

export type StringWith<Suggestions> = Suggestions | (string & { toString: () => string });
