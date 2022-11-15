
import { Split } from "~/utils/type-utils";

interface _Denom {
  MEL: 'MEL';
  SYM: 'SYM';
  ERG: 'ERG';
  NEWCOIN: '(NEWCOIN)';
  CUSTOM: `CUSTOM-${string}`;
}
export type Denom = Split<_Denom>;
// export type DenomNum = Split<_DenomNum>;


export namespace DenomNames {
  export const MEL = "MEL";
  export const SYM = "SYM";
  export const ERG = "ERG";
  export const CUSTOM: (str: string) => Denom = (str) => `CUSTOM-${str}`;
  export const NEWCOIN = "(NEWCOIN)";
}

export type DenomNames = keyof _Denom


const MEL = "MEL" as const
const SYM: Denom = "SYM"
const ERG: Denom = "ERG"
const NEWCOIN: Denom = "(NEWCOIN)"
const CUSTOM: (s: string) => `CUSTOM-${string}` = (s: string) => `CUSTOM-${s}`

export const Denom = {
  MEL,
  SYM,
  CUSTOM,
  ERG,
  NEWCOIN
} as const;


