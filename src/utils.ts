import fetch from 'node-fetch'
import { Response, RequestInit } from 'node-fetch'
import { parse } from 'path'


type JSONValue =
  | string
  | number
  | boolean
  | bigint
  | JSONObject 
  | JSONArray;

interface JSONObject extends Record<string, JSONValue> {}
interface JSONArray extends Array<JSONValue> { }



export async function fetch_wrapper(endpoint: any, data?: RequestInit): Promise<Response> {
  data = data || {}
  let response = await fetch(endpoint, data)
  return response
}

export async function unwrap_nullable_promise<T>(m: Promise<T | null>): Promise<T> {
  let maybe: T | null = await m
  if (maybe) {
    return maybe
  }
  throw Error(`Unable to unwrap: ${m}`)
}

export function map_from_entries<T, K>(entries: [T, K][], reviver?: Reviver<K>): Map<T, K> {
  let map: Map<T, K> = new Map();
  for (let entry of entries) {
    let [key, value] = entry;
    map.set(key, value);
  }
  return map;
}





function int_to_bigint<T extends JSONValue>(key: string, value:T ): bigint | false {
  if (typeof (value) === 'number') {
    return BigInt(value);
  }
  return false
}

function object_to_map<T extends JSONValue>(key: string, value: T): Map<string, JSONValue>| Record<string, JSONValue> | false {
  if (typeof (value) == 'object') {
    let entries: [string, JSONValue][] = Object.entries(value);

    // deal with the containing object
    // don't create a map since maps aren't analyzed properly by typescript-is
    if (key === "") return Object.fromEntries(entries)
    return map_from_entries(entries);
  }

  else 
  return false
}


type Reviver<T> = (key: string, value: T) => any | false;
function chain_reviver<T extends JSONValue>(revivers: Reviver<T>[]): Reviver<T> {
  return (key, value) => {
    var parsed_value;
    let v = revivers.find((r) => {
      parsed_value = r(key, value)
      if (parsed_value === false) return false
      return true
    })
    if (v) return parsed_value;
    else return value;
  }
}

export let main_reviver = chain_reviver([int_to_bigint, object_to_map])