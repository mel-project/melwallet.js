import { Denom, NetID} from "./themelio-types";

export function int_to_netid(num: bigint): NetID{
    if(num === BigInt(NetID.Mainnet)) return NetID.Mainnet;
    if(num === BigInt(NetID.Testnet)) return NetID.Testnet;
    return NetID.Custom02;
}

export function string_to_denom(str: string): Denom {
    if(str == "MEL") return Denom.MEL;
    if(str == "SYM") return Denom.SYM;
    return Denom.ERG
}

export function hex_to_denom(hex: string): Denom {
    
    let denom_val = Number(hex);
    return number_to_denom(denom_val);
}

export function number_to_denom(num: Number): Denom {
    (Object.values(Denom) as Array<keyof typeof Denom>).findIndex((key) => {})
    throw Error();
}
