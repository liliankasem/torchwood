export class Contract {
    public payload: any;

    public at(address: string): Contract {
        return this;
    }
    public allEvents(param: any): Contract {
        return this;
    }

    // tslint:disable-next-line
    public get(callback: any): any {
        callback(null, this.payload);
    }
}