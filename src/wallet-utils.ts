import { NetID } from "./themelio-types";

export function int_to_netid(num: bigint): NetID{
    if(num === BigInt(NetID.Mainnet)) return NetID.Mainnet;
    if(num === BigInt(NetID.Testnet)) return NetID.Testnet;
    return NetID.Custom02;
}

