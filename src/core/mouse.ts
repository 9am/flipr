import { Observable } from 'rxjs';
import Point from './point';

class Mouse extends Point {
    private _intervalID = 0;
    private _a: any;
    private _b: any;
    private _destination: Point = new Point();
    private _isRunning = false;
    private _prevent = false;
    private _tweenComplete: Function;
    private _frame: number;

    constructor() {
        super(0, 0, 'mouse');
        this.tween = this.tween.bind(this);
        this._a = new Observable((arg) => {
            this._b = arg;
        });
    }

    override set val(value: [x: number, y: number]) {
        const [x, y] = value;
        this.x = x;
        this.y = y;
        this._b.next({ x, y });

        this._destination.val = value;
        this._isRunning = false;
    }

    override get val(): [x: number, y: number] {
        return [this.x, this.y];
    }

    tween(prevent: boolean): void {
        this._frame = requestAnimationFrame(() => {
            if (this.dist(this._destination) > 0.01) {
                const [x0, y0] = this.val;
                const [x1, y1] = this._destination.val;
                const [x, y] = [x0 + (x1 - x0) / 5, y0 + (y1 - y0) / 5];
                this.x = x;
                this.y = y;
                this._b.next({ x, y });
                this.tween(prevent);
            } else {
                this._isRunning = false;
                if (prevent) {
                    this._prevent = false;
                    queueMicrotask(() => this._tweenComplete(true));
                }
            }
        });
    }

    moveTo(point: Point, prevent: boolean = false): Promise<boolean> {
        this._destination.copyFrom(point);
        if (prevent) {
            cancelAnimationFrame(this._frame);
            this._tweenComplete(true);
            this._isRunning = false;
        }
        if (!this._isRunning) {
            this._isRunning = true;
            this._prevent = prevent;
            this.tween(prevent);
        }
        return new Promise((resolve) => (this._tweenComplete = resolve));
    }

    get observable(): any {
        return this._a;
    }

    get prevent(): boolean {
        return this._prevent;
    }
}

export default Mouse;
