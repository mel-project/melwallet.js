/// modified from
/// https://stackoverflow.com/questions/72515807/create-an-union-type-from-interface-properties
export type Split<T> = keyof T extends infer Keys // turn on distributivity
  ? Keys extends PropertyKey
  ? Keys extends keyof T
  ? T[Keys] // apply to each keyfor readability
  : never
  : never
  : never;


export type ExhaustiveTo<T extends string | number | symbol, K> = { [k in T]: K }
export type Exhaustive<T extends string | number | symbol> = ExhaustiveTo<T, any>

export type JSONValue =
  | string
  | boolean
  | bigint
  | JSONObject
  | JSONArray
  | null
  | JSONObject;


/**
 * Extra
 */
export type ShapeOf<T extends string | number | symbol> = {[key in T]: any}

export type JSONObject = Record<any, any>;
export type JSONArray = JSONValue[];

export type NotPromise<T> = T extends Promise<unknown> ? never : T;
