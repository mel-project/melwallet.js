
import { Match } from "~/utils/type-utils";
import { bytesToHex, stringToUTF8Bytes } from "..";

interface _DenomNum {
  MEL: 109; // b"m"
  SYM: 115; // b"s"
  ERG: 100; // b"d"
  CUSTOM: bigint; // txhash.to_vec
  NEWCOIN: 0; // b""
}

type CUSTOM_DENOM = `CUSTOM-${string}`
export type Denom = 'MEL' | 'SYM' | 'ERG' | CUSTOM_DENOM | '(NEWCOIN)'
export const Denom = {
  MEL: 'MEL',
  SYM: 'SYM',
  ERG: 'ERG',
  NEWCOIN: '(NEWCOIN)',
  CUSTOM: (s: string): CUSTOM_DENOM => `CUSTOM-${s}`,
} as const;


export type DenomName = keyof typeof Denom

export function denom_to_name(value: Denom): DenomName {
  if (value.startsWith('CUSTOM-')) {
    return 'CUSTOM'
  }
  if (value === Denom.NEWCOIN) {
    return 'NEWCOIN'
  }
  console.log(value)
  return value as any //this is a forced cast since TS doesn't narrow and exclude `CUSTOM-${string}` 
}



export const DenomHelpers = {
  toName: denom_to_name,
  asString: (denom: Denom): string => denom,
  asBytes: (denom: Denom): string => {
    console.log(denom)
    let denom_name = denom_to_name(denom);
    if (denom_name === "MEL") return "6D";
    if (denom_name === "SYM") return "73";
    if (denom_name === "ERG") return "64";
    if (denom_name === "CUSTOM") return bytesToHex(stringToUTF8Bytes((denom_name as CUSTOM_DENOM).split('-')[1])); // txhash.to_vec
    if (denom_name === "NEWCOIN") return "0";
    throw "Impossible Denom"
  }
}
