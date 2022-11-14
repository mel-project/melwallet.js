/// jsonrpc.ts represents the types necessary for interacting with melwalletd
/// and isn't necessarily spec compliant

import { createIs } from "typescript-is";
import { JSONValue } from "..";


export type JSONRPCID = string | number | null | bigint;
export type JSONRPCParams = object | any[];

export interface JSONRPCRequest {
    jsonrpc: "2.0";
    method: string;
    params?: JSONRPCParams;
    id?: JSONRPCID;
}

export interface JSONRPCResponse {
    jsonrpc: "2.0";
    id: JSONRPCID;
    result?: any;
    error?: any;
}

export interface JSONRPCSuccess {
    jsonrpc: "2.0";
    id: JSONRPCID;
    result: JSONValue;
}

export interface JSONRPCError {
    code: number;
    message: string;
    data?: JSONValue;
  }
  
export const isJSONRPCResponse = createIs<JSONRPCResponse>()

export namespace JSONRPC {
    export function extract_result(response: JSONRPCResponse): unknown {
      if (response?.result) {
        return response.result;

      }
      else if (response?.error) {
        let err = response.error;
        throw err
      }
      throw "Impossible JSONRPC Response without `result` or `error` field"
    }
  }
  
  