import fetch from 'node-fetch';
import { Response, RequestInit } from 'node-fetch';
import { parse } from 'path';

type JSONValue = string | number | boolean | bigint | JSONObject | JSONArray;

interface JSONObject extends Record<string, JSONValue> {}
interface JSONArray extends Array<JSONValue> {}

export async function fetch_wrapper(
  endpoint: any,
  data?: RequestInit,
): Promise<Response> {
  data = data || {};
  let response = await fetch(endpoint, data);
  return response;
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

export function map_from_entries<T, K>(entries: [T, K][]): Map<T, K> {
  let map: Map<T, K> = new Map();
  for (let entry of entries) {
    // console.log(entry);
    let [key, value] = entry;
    map.set(key, value);
  }
  return map;
}

function int_to_bigint<T extends JSONValue>(
  key: string,
  value: T,
): bigint | false {
  if (typeof value === 'number') {
    return BigInt(value);
  }
  return false;
}

function null_object_to_record<T extends JSONValue>(
  key: string,
  value: T,
): Record<string, JSONValue> | false {
  if (typeof value == 'object') {
    let entries: [string, JSONValue][] = Object.entries(value);
    return Object.fromEntries(entries);
  } else return false;
}

type TypedReviver<T, K> = (key: T, value: any) => K | false;
type Reviver<T> = (key: string, value: T) => any | false;
function chain_replacer<T extends JSONValue>(
  replacers: Reviver<T>[],
): Reviver<T> {
  return (key, value) => {
    var parsed_value;

    // iterate through all the parsers
    replacers.find(r => {
      parsed_value = r(key, value);
      if (parsed_value === false) return false;
      return true;
    });
    if (parsed_value !== false) return parsed_value;
    return value;
  };
}

export let main_replacer = chain_replacer([null_object_to_record]);

export async function promise_value_or_error<T>(
  promise: Promise<T>,
): Promise<Error | Awaited<T>> {
  try {
    return await promise;
  } catch (e) {
    return e as Error;
  }
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

export const JSONBig = require('json-bigint')({
  useNativeBigInt: true,
  alwaysParseAsBig: true,
});
