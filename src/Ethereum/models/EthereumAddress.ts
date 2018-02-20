export class EthereumAddress {
    private readonly content: string;

    public constructor(address : string) {
        this.content = address;
    }

    public static ParseFromStack(address : string): EthereumAddress {
        // Remove leading zeroes from address and add "0x" prefix.
        address = "0x" + address.substring(42);
        return new EthereumAddress(address);
    }

    public AsHex(): string {
        return this.content;
    }
}