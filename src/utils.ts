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





function int_to_bigint(key: string, value: number): bigint | false {
  if (typeof (value) === 'number') {
    return BigInt(value);
  }
  return false
}

function object_to_map(key: string, value: Record<string, JSONValue>): Map<string, JSONValue> | false {
  if (typeof (value) == 'object') {
    let entries: [string, JSONValue][] = Object.entries(value);
    let map: Map<string, JSONValue> = map_from_entries(entries);

  }
  return false
}


type Reviver<T extends JSONValue> = (key: string, value: T) => any | false;
function chain_reviver<T extends JSONValue>(revivers: Reviver<T>[]): Reviver<T> {
  return (key, value) => {
    let v = revivers.find((r) => {
      let parsed_value = r(key, value)
      if (parsed_value === false) return false
      console.log('parsed_value: ', parsed_value)
      return true
    })
    if (v) return value;
    else return value;
  }
}

export let main_reviver = chain_reviver([int_to_bigint, object_to_map])