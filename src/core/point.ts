// import Dispatcher from './dispatcher';

class Point {
    id: string;
    x: number;
    y: number;

    constructor(x = 0, y = 0, id = '') {
        // super();
        this.id = id;
        this.x = x;
        this.y = y;
    }

    set val(value: [x: number, y: number]) {
        const [x, y] = value;
        this.x = x;
        this.y = y;

    }

    get val(): [x: number, y: number] {
        return [this.x, this.y];
    }

    clone(): Point {
        return new Point(this.x, this.y);
    }

    isEqual(point: Point): boolean {
        return point.x === this.x
            && point.y === this.y;
    }

    dist(point: Point): number {
        const [x0, y0] = this.val;
        const [x1, y1] = point.val;
        const [px, py] = [Math.abs(x1 - x0), Math.abs(y1 - y0)];
        return Math.sqrt(Math.pow(px, 2) + Math.pow(py, 2));
    }

    log(): void {
        console.info(`x: ${this.x}, y: ${this.y}`);
    }

}

export default Point;
