import { Credentials, SimpleSigner, MNID } from 'uport-connect';

export class UPortFactory {
    private readonly appName: string;
    private readonly networkId: string;
    private readonly credentials: Credentials;

    public constructor(appName: string, networkId: string, identifer: string, key: string) {
        const signer = SimpleSigner(key);
        this.appName = appName;
        this.networkId = networkId;

        this.credentials = new Credentials({
            appName: this.appName,
            address: identifer,
            signer: signer
        });
    }

    public GenerateFunctionCallUri(contractAddress: string, functionName: string, functionParams: any[], callbackUrl: string): string {
        let paramString = '';

        if (functionParams != null) {
            functionParams.forEach((v) => {
                if (paramString.length > 0) {
                    paramString += ', ';
                }
                paramString += `${v.type} ${v.value}`;
            });
        }

        const contractId = this.EncodeId(contractAddress);
        const encodedArgs = `function=${functionName}(${paramString})&callback_url=${callbackUrl}`;
        return `me.uport:${contractId}?${encodedArgs}`;
    }

    public async GenerateClaimsRequest(claims: string[], callbackUrl: string, expiration: number): Promise<string> {
        const requestToken = await this.credentials.createRequest({
            requested: claims,
            callbackUrl: callbackUrl,
            exp: expiration,
            notifications: true
        });

        return 'me.uport:me?requestToken=' + requestToken;
    }

    public async ReadToken(jwt: string): Promise<any> {
        return await this.credentials.receive(jwt);
    }

    public async Push(token: string, pubKey: string, payload: any): Promise<any> {
        return await this.credentials.push(token, pubKey, payload);
    }

    public async Attest(uportId: string, claim: any, callbackUrl: string): Promise<any> {
        const att = {
            sub: uportId,
            exp: new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
            claim: claim
        };
        const jwt = await this.credentials.attest(att);
        return `me.uport:add?attestations=${encodeURIComponent(jwt)}&callback_url=${encodeURIComponent(callbackUrl)}`;
    }

    public EncodeId(contractAddress: string): string {
        return MNID.encode({ network: this.networkId, address: contractAddress });
    }

    public DecodeId(encodedId: string): any {
        return MNID.decode(encodedId);
    }
}

