class Job {
    private func;
    public promise;
    private resolve;
    private reject;

    constructor(func : any) {
        this.func = func;
        // tslint:disable-next-line
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    public Execute() {
        return this.func()
            .then(result => this.resolve(result))
            .catch(err => this.reject(err));
    }
}

export class JobQueue {
    private readonly requestMax = 10;
    private queue: Job[];
    private pendingQueue: Job[];
    private processing = 0;

    constructor() {
        this.queue = [];
        this.pendingQueue = [];
    }

    public ExecuteJob(func : any) {
        const job = new Job(func);
        this.queue.push(job);

        if (!this.processing) {
            this.StartProcessingQueue();
        }

        return job.promise;
    }

    private async ProcessQueue(_self: JobQueue) {
        while (_self.queue.length > 0 && _self.pendingQueue.length < _self.requestMax) {
            if (_self.pendingQueue.length < _self.requestMax) {
                const job = _self.queue.pop();
                _self.pendingQueue.push(job);
                await job.Execute();
                _self.pendingQueue.pop();

                if (_self.queue.length > 0 && !_self.processing) {
                    _self.StartProcessingQueue();
                }

            }
        }

        _self.processing = 0;
    }

    private StartProcessingQueue() {
        this.processing = 1;
        setTimeout(async () => { await this.ProcessQueue(this); }, 100);
    }
}