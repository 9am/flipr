import {
    Observable,
} from 'rxjs';
import Point from './point';

class Mouse extends Point { // private _interval: Observable<number>;
    private _intervalID = 0;
    private _a: any;
    private _b: any;
    private _destination: Point = new Point();
    private _isRunning = false;

    constructor() {
        super(0, 0, 'mouse');
        this.tween = this.tween.bind(this);
        this._a = new Observable(arg => {
            this._b = arg;
        });
    }

    set val(value: [x: number, y: number]) {
        const [x, y] = value;
        this.x = x;
        this.y = y;
        this._b.next({x, y});

        this._destination.val = value;
        this._isRunning = false;
    }

    get val(): [x: number, y: number] {
        return [this.x, this.y];
    }

    tween(): void {
        requestAnimationFrame(() => {
            if (this.dist(this._destination) > 0.01) {
                const [x0, y0] = this.val;
                const [x1, y1] = this._destination.val;
                const [x, y] = [
                    x0 + (x1 - x0) / 5,
                    y0 + (y1 - y0) / 5,
                ];
                this.x = x;
                this.y = y;
                this._b.next({x, y});
                this.tween();
            } else {
                this._isRunning = false;
            }
        });
    }

    moveTo(x: number, y: number): void {
        this._destination.val = [x, y];
        if (!this._isRunning) {
            this._isRunning = true;
            this.tween();
        }
        // this.val = [x, y];
    }

    get observable(): any {
        return this._a;
    }
}

export default Mouse;
