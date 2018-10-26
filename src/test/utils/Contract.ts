export class Contract {
    public payload: any;

    public at(address: string): Contract {
        return this;
    }
    public allEvents(param: any): Contract {
        return this;
    }

    public get(callback: any) {
        callback(null, this.payload);
    }
}
