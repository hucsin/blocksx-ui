/******
 * Tiny Queue
 *
 * @constructor
 */
export default class AgentQueue {
    private queueList: any[];
    private active: boolean;
    private onEmptyCallback: Function;

    constructor(onEmptyCallback: Function) {
        this.queueList = [];
        this.active = false;
        this.onEmptyCallback = onEmptyCallback;
    }

    /***
     *
     * @param func 要执行的函数
     * @returns {jQuery.Deferred}
     */
    queue(func: Function) {
        this.queueList.push(func);

        if (this.queueList.length === 1 && !this.active) {
            this._progressQueue();
        }
    }

    private _progressQueue() {
        // stop if nothing left in queue
        if (!this.queueList.length) {
            this.onEmptyCallback();
            return;
        }

        let f: Function = this.queueList.shift();
        this.active = true;

        // execute function
        const completeFunction = this.next.bind(this);
        f(completeFunction);
    }

    clear() {
        this.queueList = [];
    }

    next() {
        this.active = false;
        this._progressQueue();
    }
}
