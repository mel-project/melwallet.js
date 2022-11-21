
import { ShapeOf, Split } from "~/utils/type-utils";

interface _Denom {
  MEL: 'MEL';
  SYM: 'SYM';
  ERG: 'ERG';
  NEWCOIN: '(NEWCOIN)';
  CUSTOM: `CUSTOM-${string}`;
} 
export type Denom = "MEL" | "SYM" | "ERG" | "(NEWCOIN)" | `CUSTOM-${string}`
// export type DenomNum = Split<_DenomNum>;

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
} as const satisfies ShapeOf<DenomNames>;


