import crypto = require('crypto');

export class EthereumCode {
    private readonly code: string;
    private readonly hash: string;

    constructor(code: string) {
        this.hash = EthereumCode.CreateHash(code);
        this.code = code;
    }

    public Code(): string {
        return this.code;
    }

    public Hash(): string {
        return this.hash;
    }

    private static CreateHash(code: string): string {
        const sha3 = crypto.createHash('sha256');
        // Extract metadata hash from code
        const metaRegex = new RegExp('((0x){0,1}([a-fA-F0-9]+))a165627a7a72305820([a-fA-F0-9]{64})0029');
        const results = metaRegex.exec(code);

        if (!results) {
            throw new Error("Could not extract metamask without bytecode");
        }
        const realCode = results[3];

        sha3.update(realCode);
        return sha3.digest('hex');
    }
}