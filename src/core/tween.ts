type tweenOption = {
    start: any;
    end: any;
    duration: number;
    easing?: Function;
    cb?: Function;
    isExclusive?: boolean;
};

const interval = 1000 / 60;
const getTick = ({
    start,
    end,
    duration,
    easing = (t: number): number => t,
}: tweenOption): Function => {
    const totalFrame = duration / interval;
    return (currFrame: number) => {
        if (totalFrame - currFrame < 1) {
            return end;
        }
        return Object.entries(start).reduce(
            (memo, [key, value]) => ({
                ...memo,
                [key]: value + easing(currFrame / totalFrame) * (end[key] - value),
            }),
            {}
        );
    };
};

class Tween {
    private _isRunning: boolean = false;
    private _isExclusive: boolean = false;
    private _start: any;
    private _curr: any;
    private _end: any;
    private _duration: number;
    private _cb: Function;
    private _resolve: Function;
    private _frame: any;
    private _tsPrev = 0;
    private _tick: Function;
    private _currFrame: number;

    constructor() {}

    add({
        start,
        end,
        duration,
        easing,
        cb = () => {},
        isExclusive = false,
    }: tweenOption): Promise<boolean> {
        if (this._isExclusive) {
            return Promise.reject();
        }
        if (!(start && end && duration)) {
            return Promise.reject();
        }
        // if (this._isRunning) {
        this.clear();
        // }
        // TBD start a new one
        this._isRunning = true;
        this._isExclusive = isExclusive;
        this._start = start;
        this._end = end;
        this._cb = cb;
        this._currFrame = 0;
        this._tick = getTick({ start, end, duration, easing });
        this._ticker(-1);
        return new Promise((resolve) => (this._resolve = resolve));
    }

    clear() {
        if (this._frame) {
            cancelAnimationFrame(this._frame);
        }
        if (this._resolve) {
            this._resolve(true);
        }
        this._isRunning = false;
        this._isExclusive = false;
        this._start = {};
        this._curr = this._start;
        this._end = this._start;
        this._cb = () => {};
    }

    private _ticker = (ts: number) => {
        if (ts - this._tsPrev < interval) {
            this._frame = requestAnimationFrame(this._ticker);
            return;
        }
        this._tsPrev = ts;
        this._curr = this._tick(this._currFrame);
        this._cb(this._curr);
        if (this._curr === this._end) {
            this.clear();
            this._resolve(true);
        } else {
            this._currFrame += 1;
            this._frame = requestAnimationFrame(this._ticker);
        }
    };
}

export default Tween;
