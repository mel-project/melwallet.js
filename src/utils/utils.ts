import * as JSONBigPackage from 'json-bigint';
import { JSONRPCResponse } from '~/types/jsonrpc';
var JSONBig = JSONBigPackage;
if ((JSONBigPackage as any).default) {
  JSONBig = (JSONBigPackage as any).default;
}

/// modified from
/// https://stackoverflow.com/questions/72515807/create-an-union-type-from-interface-properties
export type Split<T> = keyof T extends infer Keys // turn on distributivity
  ? Keys extends PropertyKey
  ? Keys extends keyof T
  ? T[Keys] // apply to each keyfor readability
  : never
  : never
  : never;


export type ExhaustiveTo<T extends string | number | symbol, K> = {[k in T]: K}
export type Exhaustive<T extends string | number | symbol> = ExhaustiveTo<T, any>

export type JSONValue =
  | string
  | boolean
  | bigint
  | JSONObject
  | JSONArray
  | null
  | JSONObject;



export type JSONObject = Record<any, any>;
export type JSONArray = JSONValue[];

export type NotPromise<T> = T extends Promise<unknown> ? never : T;

export function random_hex_string(arg0: number): string {
  let char_codes: number[] = [...Array(arg0).keys()].map(() =>
    Math.floor(Math.random() * 15),
  );
  let hex_string = char_codes.map((i: number) => i.toString(16)).join('');
  // console.log(hex_string.length, hex_string)
  return hex_string;
}

export async function unwrap_nullable_promise<T>(
  m: Promise<T | null>,
): Promise<T> {
  let maybe: T | null = await m;
  if (maybe) {
    return maybe;
  }
  throw Error(`Unable to unwrap: ${m}`);
}

export async function promise_or_false<T>(
  promise: Promise<T>,
): Promise<T | false> {
  try {
    return await promise;
  } catch (e) {
    return false;
  }
}

export function map_from_entries<T, K>(entries: [T, K][]): Map<T, K> {
  let map: Map<T, K> = new Map();
  for (let entry of entries) {
    // console.log(entry);
    let [key, value] = entry;
    map.set(key, value);
  }
  return map;
}

const JSONAlwaysBig = JSONBig({
  useNativeBigInt: true,
  alwaysParseAsBig: true,
});

export const ThemelioJson = {
  stringify: function <T>(
    value: NotPromise<T>,
    replacer?: (string | number)[] | null | undefined,
    space?: string | number | undefined,
  ): string {
    return JSONAlwaysBig.stringify(value, replacer, space);
  },
  parse: function (text: string): JSONValue {
    // let reviver = use_reviver ? main_reviver : null;
    return JSONAlwaysBig.parse(text) as JSONValue;
  },
};

