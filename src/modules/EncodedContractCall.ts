import coder = require('web3/lib/solidity/coder');
import SolidityFunction = require('web3/lib/web3/function');
import { HexString } from '../interfaces/index';
import winston = require('winston');

export class EncodedContractCall {
    private readonly contract: any;
    private readonly encodedParamters: HexString;

    constructor(contract: any, method: string, params: any[]) {
        this.contract = contract;
        const abi = JSON.parse(contract.interface);
        this.encodedParamters = EncodedContractCall.EncodeContractParameters(abi, params, method);
    }

    public ByteCode(): HexString {
        return new HexString(this.contract.bytecode);
    }

    public EncodedCall(): HexString {
        return this.encodedParamters;
    }

    private static EncodeFunctionParameters(abi: any, params: any[]): HexString {
        const solFn = new SolidityFunction(null, abi, null);
        return new HexString(solFn.toPayload(params).data);
    }

    private static EncodeContractParameters(abi: any[], params: any[], method: string): HexString {
        const paramKeys = Object.keys(params);
        const paramsCount = paramKeys.length;
        const methodDecl = abi.filter((json) => this.IsAbiMatch(method, json) && json.inputs.length === paramsCount)[0];

        let result : HexString;
        if (methodDecl.type === 'constructor') {
            const types = methodDecl.inputs.map(input => input.type);
            const values = paramKeys.map(key => params[key]);
            result = HexString.Empty();

            if (types.length > 0) {
                const encoded = coder.encodeParams(types, values);
                result = new HexString(encoded);
            }
        } else {
            result = this.EncodeFunctionParameters(methodDecl, params);
        }

        return result;
    }

    private static IsAbiMatch(method: string, abi: any): boolean {
        let result = abi.type === 'constructor';

        if (method) {
            result = abi.name === method;
        }

        return result;
    }
}