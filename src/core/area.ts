import Point from './point';
import Line from './line';

class Area {
    id: string;
    private _points: Point[] = [];
    private _lines: Line[] = [];
    private _root: Point = new Point();

    constructor(points: Point[], id = '') {
        this.id = id;
        this.points = points;
    }

    set points(val: Point[]) {
        if (val.length < 3) {
            throw new Error('points length less than 3.');
        }
        this._points = val;
        this._lines = this._points.reduce(
            (memo, point, index) => [
                ...memo,
                new Line(
                    [
                        point,
                        this._points[index < this._points.length - 1 ? index + 1 : 0]!,
                    ],
                    ''
                ),
            ],
            [] as Line[]
        );
        this._points.forEach((point, index) => (point.id = [this.id, index].join('-')));
        this._root = this._points[0]!;
    }

    get points(): Point[] {
        return this._points;
    }

    get lines(): Line[] {
        return this._lines;
    }

    get root(): Point {
        return this._root;
    }

    cross(lineInput: Line): Point[] {
        return this._lines.reduce(
            (memo, line) => [...memo, lineInput.cross(line)],
            [] as Point[]
        );
    }

    hit(point: Point): boolean {
        const [x, y] = point.val;
        return (
            x <
                Math.max.apply(
                    null,
                    this.points.map((point) => point.x)
                ) &&
            x >
                Math.min.apply(
                    null,
                    this.points.map((point) => point.x)
                ) &&
            y <
                Math.max.apply(
                    null,
                    this.points.map((point) => point.y)
                ) &&
            y >
                Math.min.apply(
                    null,
                    this.points.map((point) => point.y)
                )
        );
    }
}

export default Area;
