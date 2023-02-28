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

    clone(): Point {
        return new Point(this.x, this.y);
    }

    isEqual(point: Point): boolean {
        return point.x === this.x
            && point.y === this.y;
    }

    log(): void {
        console.info(`x: ${this.x}, y: ${this.y}`);
    }

}

export default Point;
