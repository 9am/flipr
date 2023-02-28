import {
    Observable,
} from 'rxjs';
import Point from './point';

class Mouse extends Point {
    // private _interval: Observable<number>;
    private _intervalID = 0;
    private _a: any;
    private _b: any;

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
    }

    get val(): [x: number, y: number] {
        return [this.x, this.y];
    }

    tween(f: any, t: any): [number, number] {
        return [
            f.x + (t.x - f.x) / 2,
            f.y + (t.y - f.y) / 2,
        ];
    }

    moveTo(x: number, y: number): void {
        // TODO tween
        // this._moveSub.next({x, y});
        //
        // clearInterval(this._intervalID);
        // this._intervalID = <any>setInterval(() => {
        //     if (new Point(this.x, this.y).dist(new Point(x, y)) > 0.1) {
        //         this.val = this.tween(
        //             {x: this.x, y: this.y},
        //             {x, y},
        //         );
        //     } else {
        //         clearInterval(this._intervalID);
        //     }
        // }, 32);
        //
        this.val = [x, y];
    }

    get observable(): any {
        return this._a;
    }
}

export default Mouse;
