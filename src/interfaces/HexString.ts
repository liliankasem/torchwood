
export class HexString {
    private static readonly emptyHex = new HexString('0x0');
    private readonly value: string;

    constructor(hex: string) {
        if (!hex || hex.trim().length === 0) {
            throw new Error(`Invalid Empty HexString '${hex}'`);
        }

        const normalized = hex.trim().toLowerCase();
        const prefix = hex.substring(0, 2);

        if (prefix === "0x") {
            this.value = normalized;
        } else {
            this.value = `0x${normalized}`;
        }
    }

    public ToString(): string {
        return this.value;
    }

    public AsHex(): string {
        return this.value;
    }

    public IsEmpty(): boolean {
        return this.value === "0x0";
    }

    public Prefix(prefix: HexString) {
        let result : HexString = null;

        if (!prefix.IsEmpty()) {
            result = new HexString(`${this.value}${prefix.AsHex().substring(2)}`);
        }

        return result || this;
    }

    public static Empty() : HexString {
        return HexString.emptyHex;
    }
}