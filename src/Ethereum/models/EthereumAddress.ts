export class EthereumAddress {
    private readonly content: string;

    constructor(address : string) {
        this.content = address;
    }

    public static Parse(address : string): EthereumAddress {
        // Remove leading zeroes from address and add "0x" prefix.
        address = "0x" + address.substring(24);
        return new EthereumAddress(address);
    }

    public AsHex(): string {
        return this.content;
    }
}