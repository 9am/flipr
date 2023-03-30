import Point from './point';
import Line from './line';

class Circle extends Point {
    override r: number;

    constructor(x = 0, y = 0, r = 0, id = '') {
        super(x, y, id);
        this.r = r;
    }

    hit(p: Point): boolean {
        return this.dist(p) <= this.r;
    }

    override clone(): Circle {
        return new Circle(this.x, this.y, this.r);
    }

    override isEqual(point: Circle): boolean {
        return point.x === this.x && point.y === this.y && point.r === this.r;
    }

    cross(line: Line): Point[] {
        const [k] = line.kb;
        const t = Math.atan(k);
        const y = Math.sin(t) * this.r;
        const x = Math.cos(t) * this.r;
        return [new Point(this.x - x, this.y - y), new Point(this.x + x, this.y + y)];
    }
}

export default Circle;
