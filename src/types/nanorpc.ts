/// jsonrpc.ts represents the types necessary for interacting with melwalletd
/// and isn't necessarily spec compliant

import { createIs } from 'typescript-is';
import { JSONValue } from '../utils/type-utils';

export type JSONRPCID = string | number | null | bigint;
export type JSONRPCParams = object | any[];

export interface JSONRPCRequest {
  jsonrpc: '2.0';
  method: string;
  params?: JSONRPCParams;
  id?: JSONRPCID;
}

export interface JSONRCSucessResponse {
  jsonrpc: '2.0';
  id: JSONRPCID;
  result: any;
}
export interface JSONRPCErrorResponse {
  jsonrpc: '2.0';
  id: JSONRPCID;
  error: any;
}

export type JSONRPCResponse = JSONRCSucessResponse | JSONRPCErrorResponse

export interface JSONRPCError {
  code: number;
  message: string;
  data?: JSONValue;
}

export const isJSONRPCResponse = createIs<JSONRPCResponse>();

export namespace JSONRPC {
  export function extract_result(response: JSONRPCResponse): unknown {
    if ('result' in response) {
      return response.result;
    } else if ('error' in response) {
      let err = response.error;
      throw err;
    }
    throw 'Impossible JSONRPC Response without `result` or `error` field';
  }
}
