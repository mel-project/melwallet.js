import BigNumber from "bignumber.js"
import fetch from 'node-fetch'
import { Response, RequestInit } from 'node-fetch'

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
  
  export function map_from_entries<T,K>(entries: [T,K][]): Map<T,K> {
    let map: Map<T,K> = new Map();
    for(let entry of entries){
      let [key, value] = entry;
      map.set(key, value);
    }
    return map;
  }

  export function int_to_bigint<T, K>(key: T, value: K): BigNumber | K{
    if(typeof(value) === 'number'){
        return new BigNumber(value);
    }
    return value
  }