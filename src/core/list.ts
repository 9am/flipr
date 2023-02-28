import { Observable } from 'rxjs';

class List {
    private _a: any;
    private _b: any;
    private _index = 0;
    content: CanvasImageSource[];

    constructor(content: CanvasImageSource[]) {
        this.content = content;
        this._a = new Observable((arg) => {
            this._b = arg;
        });
    }

    getItem(i: number): CanvasImageSource | undefined {
        return this.content[i];
    }

    getItemByOffset(offset: number): CanvasImageSource | undefined {
        return this.getItem(this._index + offset);
    }

    set index(val: number) {
        this._index = Math.max(0, Math.min(val, this.content.length));
        this._b.next(this._index);
    }

    get index(): number {
        return this._index;
    }

    get observable(): any {
        return this._a;
    }
}

export default List;
