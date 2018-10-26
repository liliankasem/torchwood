import { Contract } from './Contract';

export class EthType {
    public contract_instance: Contract;

    public contract(param: string): Contract {
        return this.contract_instance;
    }
}