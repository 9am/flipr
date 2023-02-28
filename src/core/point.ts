class Point {
    id: string;
    x: number;
    y: number;

    constructor(x = 0, y = 0, id = '') {
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

    copyFrom(point: Point) {
        this.val = [point.x, point.y];
    }

    clone(): Point {
        return new Point(this.x, this.y);
    }

    isEqual(point: Point): boolean {
        return point.x === this.x && point.y === this.y;
    }

    dist(p: Point): number {
        const [x0, y0] = this.val;
        const [x1, y1] = p.val;
        const [px, py] = [Math.abs(x1 - x0), Math.abs(y1 - y0)];
        return Math.sqrt(Math.pow(px, 2) + Math.pow(py, 2));
    }

    getMiddle(p: Point): Point {
        return new Point((p.x + this.x) / 2, (p.y + this.y) / 2);
    }

    isSolid(): boolean {
        return this.x !== Infinity && this.y !== Infinity;
    }

    closest(list: Point[]): Point {
        const [, result] = list.reduce(
            (memo, target) => {
                const [minDist] = memo;
                const dist = this.dist(target);
                return dist < minDist ? [dist, target] : memo;
            },
            [Number.MAX_SAFE_INTEGER, new Point()]
        );
        return result;
    }

    log(): void {
        console.info(`x: ${this.x}, y: ${this.y}`);
    }
}

export default Point;
