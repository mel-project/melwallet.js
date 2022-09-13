import * as JSONBig from 'json-bigint';

export type JSONValue =
  | string
  | boolean
  | bigint
  | JSONObject
  | JSONArray
  | JSONObject;

export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = Array<JSONValue>;

export type NotPromise<T> = T extends Promise<unknown> ? never : T;

type Reviver<T> = (key: string, value: T) => any | false;

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
