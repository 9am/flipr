import {
    Observable,
} from 'rxjs';

class List {
    private _a: any;
    private _b: any;
    private _index = 0;
    content: CanvasImageSource[];
    taskQ: number[] = [];

    constructor(content: CanvasImageSource[]) {
        this.content = content;
        this._a = new Observable(arg => {
            this._b = arg;
        });
    }

    flush(): void {
        if (!this.taskQ.length) {
            return;
        }
        this.index = this.taskQ.reduce((sum, curr) => sum + curr, this.index);
        console.log('list index:', this.taskQ, this.index);
        this.taskQ = [];
    }

    push(offset: number): void {
        console.log('list push:', offset * 2);
        this.taskQ.push(offset * 2);
    }

    getItem(i: number): CanvasImageSource {
        return this.content[i];
    }

    set index(val: number) {
        this._index = val;
        this._b.next(this.index);
    }

    get index(): number {
        return this._index;
    }

    get observable(): any {
        return this._a;
    }

}

export default List;
