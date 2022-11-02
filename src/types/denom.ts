import { Split } from '../utils/utils';

interface _DenomNum {
    MEL: 109, // b"m"
    SYM: 115, // b"s"
    ERG: 100, // b"d"
    CUSTOM: bigint, // txhash.to_vec
    NEWCOIN: 0, // b""
}
interface _DenomNames {
    MEL: "MEL"
    SYM: "SYM"
    ERG: "ERG"
    NEWCOIN: "(NEWCOIN)"
    CUSTOM: `CUSTOM-${string}`
}
export type DenomName = Split<_DenomNames>
export type DenomNum = Split<_DenomNum>

export class Denom {
    private readonly value: DenomNum;
    //------ Instances ------//

    static readonly MEL = new Denom(109);// b"m"
    static readonly SYM = new Denom(115) // b"s"
    static readonly ERG = new Denom(100) // b"d"
    static readonly CUSTOM = (value: bigint) => new Denom(value) // txhash.to_vec
    static readonly NEWCOIN = new Denom(0) // b""

    //------ Static Methods ------//


    /**
     * Converts a string to its corresponding Denom instance.
     *
     * @param s the string to convert to Denom
     * @returns the matching Denom
     */
    static fromString(s: string): Denom {
        if (s === "MEL") return this.MEL
        if (s === "SYM") return this.SYM
        if (s === "ERG") return this.ERG
        if (s === "NEWCOIN") return this.NEWCOIN
        let splitted: string[] = s.split("-")
        if (splitted.length != 2 || splitted[0] != "CUSTOM") {
            throw `Illegal argument passed to fromString(): ${s} does not correspond to any instance of the Denom ${(this as any).prototype.constructor.name}`
        }
        return this.CUSTOM(BigInt(splitted[0]))
    }

    static fromNumber(n: number | bigint): Denom {
        if (n === 109) return this.MEL
        if (n === 115) return this.SYM
        if (n === 100) return this.ERG
        if (n === 0) return this.NEWCOIN
        return this.CUSTOM(BigInt(n))
    }

    static fromHex(h: string): Denom {
        let n = Number(h)
        return Denom.fromNumber(n)
    }
    private constructor(
        value: DenomNum,
    ) {
        this.value = value;
    }

    //------ Methods ------//
    public toNum(): DenomNum {
        return this.value
    }
    public toString(): DenomName {
        let n = this.value
        if (n === 109) return "MEL"
        if (n === 115) return "SYM"
        if (n === 100) return "ERG"
        if (n === 0) return "(NEWCOIN)"
        let name: `CUSTOM-${string}` = `CUSTOM-${this.value.toString(16).toUpperCase()}`
        return name
    }
    /**
     * Called when converting the Denom value to a string using JSON.Stringify.
     * Compare to the fromString() method, which deserializes the object.
     */
    public toJSON() {
        return this.toString();
    }
}

export default Denom;