import { Observable } from 'rxjs';

class List {
    readonly debug: boolean;
    private _a: any;
    private _b: any;
    private _index = 0;
    content: (CanvasImageSource | HTMLElement)[];

    constructor(content: any[], index = 0, debug: boolean) {
        this.content = content;
        this.debug = debug;
        this._a = new Observable((arg) => {
            this._b = arg;
            this.index = index;
        });
    }

    getItem(i: number): CanvasImageSource | HTMLElement | undefined {
        return this.content[i];
    }

    getItemByOffset(offset: number): CanvasImageSource | HTMLElement | undefined {
        return this.getItem(this._index + offset);
    }

    isCover(): [boolean, boolean] {
        if (this.debug) {
            return [false, false];
        }
        return [this.isFrontCover(), this.isEndCover()];
    }

    isFrontCover(): boolean {
        return this._index === 0;
    }

    isEndCover(): boolean {
        return (
            this._index === this.content.length - 1 || this._index === this.content.length
        );
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
