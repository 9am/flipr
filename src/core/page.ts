import Area from './area';
import Line from './line';
import Point from './point';
import { Align } from './book';

export enum Direction {
    PREV = '-1',
    STAY = '0',
    NEXT = '+1',
}

class Page extends Area{
    static origin2Points(p: Point, w: number, h: number): Point[] {
        const [x, y] = p.val;
        return [
            new Point(x, y),
            new Point(x + w, y),
            new Point(x + w, y + h),
            new Point(x, y + h),
        ];
    }

    private _origin: Point = new Point();
    private _offset: number;
    align: Align;
    direction: Direction = Direction.PREV;
    w: number;
    h: number;
    clip: Area;

    constructor(origin: Point, w: number, h: number, offset: number, direction: Direction, align: Align = Align.HORIZONTAL) {
        super(Page.origin2Points(origin, w, h), `page.${+direction * offset}`);
        this.align = align;
        this.direction = direction;
        this.origin = origin;
        this.w = w;
        this.h = h;
        this._offset = offset;
        this.clip = new Area(Page.origin2Points(origin, w, h));
    }

    set origin(p: Point) {
        this._origin = p;
        this.points = Page.origin2Points(p, this.w, this.h)
    }

    get origin(): Point {
        return this._origin;
    }

    get offset(): number {
        return +this.direction * this._offset;
    }

    get rotation(): number {
        if (this._offset === 1) {
            return 0;
        }
        const [x0, y0] = this.clip.points[3].val;
        const [x1, y1] = this.clip.points[2].val;
        const angle = this.align === Align.HORIZONTAL ? -Math.PI / 2 : Math.PI;
        return Math.atan2(y1 - y0, x1 - x0) + angle;
    }

    updateClip(points: Point[], trigger: Area): void {
        const [p0, p1, p2, p3] = points;
        switch (this.align) {
            case Align.HORIZONTAL:
                this.clip.points[0].val = p0.isSolid() ? p0.val : trigger.root.val;
                this.clip.points[1].val = p2.isSolid() ? p2.val : trigger.root.val;
                break;
            case Align.VERTICAL:
                this.clip.points[0].val = p1.isSolid() ? p1.val : trigger.root.val;
                this.clip.points[1].val = p3.isSolid() ? p3.val : trigger.root.val;
                break;
            default:
                break;
        }
    }

    mirror(page: Page, line: Line): void {
        page.clip.points.forEach((point, index) => {
            this.clip.points[index].val = line.mirror(point).val;
        });
        const index = this.align === Align.HORIZONTAL ? 1 : 3;
        this._origin.val = line.mirror(page.points[index]).val;
    }
}

export default Page;
