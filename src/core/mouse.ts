import {
    Observable,
    //interval,
} from 'rxjs';
import {
    // startWith,
    // filter,
    // map,
    // distinctUntilChanged,
    // pairwise,
    // switchMap,
    // takeUntil,
    // takeWhile,
    // take,
    // merge,
    withLatestFrom,
} from 'rxjs/operators';
import Point from './point';

class Mouse extends Point {
    // private _interval: Observable<number>;
    private _set: any;
    private _setSub: any;

    private _move: any;
    private _moveSub: any;

    constructor() {
        super(0, 0, 'mouse');
        this._set = new Observable(sub => {
            this._setSub = sub;
            this._setSub.next({x: 0, y: 0});
        });
        this._move = new Observable(sub => {
            this._moveSub = sub;
            this._moveSub.next({x: 0, y: 0});
        });

        const fromTo = this._move.pipe(withLatestFrom(this._set));
        fromTo.subscribe((args: any) => {
            console.log('from to', args);
        });

        // const moveTo = this._move.pipe(
        //     map((to: any) => ({
        //         m: {x: this.x, y: this.y},
        //         t: {x: to.x, y: to.y},
        //     }))
        // );

        // const tween = this._move.pipe(
        //     switchMap(
        //         () => interval(32).pipe(
        //             takeWhile((xy: any) => {
        //                 const dist = new Point(this.x, this.y).dist(new Point(xy.x, xy.y)) > 0.1;
        //                 console.log(dist, this.x, this.y, xy);
        //                 return dist;
        //             }),
        //         ),
        //         xy => ({
        //             m: xy,
        //             c: {x: this.x, y: this.y},
        //         }),
        //     ),
        //     // takeUtil(nextMove)
        // );

        // this._move
        //     .pipe(
        //         merge(tween),
        //     )
        // tween
        //     .subscribe((args: any) => {
        //         console.log('interval', args);
        //         const [x, y] = [
        //             args.c.x + (args.m.x - args.c.x) / 2,
        //             args.c.y + (args.m.y - args.c.y) / 2,
        //         ];
        //         this.val = [x, y];
        //     });
    }

    set val(value: [x: number, y: number]) {
        const [x, y] = value;
        this.x = x;
        this.y = y;
        console.log('set');
        this._setSub.next({x, y});
    }

    get val(): [x: number, y: number] {
        return [this.x, this.y];
    }

    moveTo(x: number, y: number): void {
        // TODO tween
        // this._moveSub.next({x, y});

        this.x = x;
        this.y = y;
        this._setSub.next({x, y});
    }

    get observable(): any {
        return this._set;
    }
}

export default Mouse;
