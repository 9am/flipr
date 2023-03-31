import Point from './point';

type abc = [a: number, b: number, c: number];

class Line {
    static NAME = 'line';
    readonly name = Line.NAME;

    id: string;
    private _points: [Point, Point];
    private _abc: abc;
    private _mp: Point; // middle point

    constructor(abc: abc, id: string);
    constructor(points: [Point, Point], id: string);
    constructor(input: any, id = '') {
        this.id = id;
        this._mp = new Point(0, 0);
        if (input.some((item: Point | number) => item instanceof Point)) {
            this._points = input;
            this._points.forEach(
                (point, index) => (point.id = point.id || [this.id, index].join('-'))
            );
            this._abc = this.abc;
        } else {
            // start with abc
            this._abc = input as abc;
        }
    }

    get points(): Point[] {
        return this._points;
    }

    get abc(): abc {
        if (this.points?.length) {
            const [p0, p1] = this.points as [Point, Point];
            const m = p1.y - p0.y;
            const n = p1.x - p0.x;
            const a = m;
            const b = -n;
            const c = n * p0.y - m * p0.x;
            return [a, b, c];
        }
        return this._abc;
    }

    set abc(val: abc) {
        this._abc = val;
    }

    get kb(): [number, number] {
        const [a, b, c] = this.abc;
        return [-a / b, -c / b];
    }

    getMsAbc(): abc {
        const [p0, p1] = this.points as [Point, Point];
        const [a, b] = this.abc;
        this._mp.val = [(p0.x + p1.x) / 2, (p0.y + p1.y) / 2];
        if (a === 0) {
            return [1, 0, -this._mp.x];
        }
        if (b === 0) {
            return [0, 1, -this._mp.y];
        }
        const k = b / a;
        const m = this._mp.y - k * this._mp.x;
        return [k, -1, m];
    }

    cross(line: Line): Point {
        const [l, m, n] = this.abc;
        const [o, p, q] = line.abc;
        const [x, y, z] = [m * q - n * p, n * o - l * q, l * p - m * o];
        if (z === 0) {
            return new Point(Infinity);
        }
        return new Point(x / z, y / z);
    }

    mirror(point: Point): Point {
        const [a, b, c] = this.abc;
        const [x, y] = point.val;
        const pa = Math.pow(a, 2);
        const pb = Math.pow(b, 2);
        const rx = ((pb - pa) * x - 2 * a * b * y - 2 * a * c) / (pa + pb);
        const ry = (b / a) * (rx - x) + y;
        return new Point(rx, ry);
    }

    project(point: Point): Point {
        const [x, y] = point.val;
        const [a, b, c] = this.abc;
        const [k, bb] = [-a / b, -c / b];
        const rx = (k * (y - bb) + x) / (k * k + 1);
        const ry = k * x + bb;
        return new Point(rx, ry);
    }

    include(p: Point): boolean {
        const [p0, p1] = this.points as [Point, Point];
        const sum = p.dist(p0) + p.dist(p1);
        const len = p0.dist(p1);
        return Math.abs(sum - len) < 1e-10;
    }
}

export default Line;
