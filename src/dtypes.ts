export type Func<T extends any[] = any[], U extends any = any> = (
  ...args: T
) => U;

export type PromiseReturnType<T> = T extends Func<any[], Promise<infer O>>
  ? O
  : never;

// stackoverflow.com/questions/56006111/is-it-possible-to-defined-a-non-empty-array-type-in-typescript
export type NonEmptyArray<T> = [T, ...T[]];
