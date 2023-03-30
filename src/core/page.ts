import Area from './area';
import Line from './line';
import Point from './point';
import { PageOptions, Align, Direction } from '../type';

class Page extends Area {
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
    offset: number;
    align: Align = Align.HORIZONTAL;
    w: number;
    h: number;
    clip: Area;
    area: number;

    constructor(option: PageOptions) {
        super(Page.origin2Points(option.origin, option.w, option.h), option.id);
        const { align, origin, w, h, offset } = option;
        this.w = w;
        this.h = h;
        this.align = align;
        this.origin = origin;
        this.offset = offset;
        this.clip = new Area(Page.origin2Points(origin, w, h), `${this.id}-clip`);
        this.area = this.getRectArea();
    }

    private isPlainPage(): boolean {
        return this.id === 'prev' || this.id === 'curr';
    }

    set origin(p: Point) {
        this._origin = p;
        this.points = Page.origin2Points(p, this.w, this.h);
    }

    get origin(): Point {
        return this._origin;
    }

    get rotation(): number {
        if (this.isPlainPage()) {
            return 0;
        }
        const [x0, y0] = this.clip.points[3]!.val;
        const [x1, y1] = this.clip.points[2]!.val;
        const angle = this.align === Align.HORIZONTAL ? -Math.PI / 2 : Math.PI;
        return Math.atan2(y1 - y0, x1 - x0) + angle;
    }

    updateClip(points: Point[], trigger: Area): void {
        const [p0, p1, p2, p3] = points as [Point, Point, Point, Point];
        const [c0, c1] = this.clip.points;
        let d0, d1;
        if (this.align === Align.HORIZONTAL) {
            d0 = [p0, p1, p3].find((p) => this.hit(p));
            d1 = [p2, p1, p3].find((p) => this.hit(p));
        } else {
            d0 = [p1, p0, p2].find((p) => this.hit(p));
            d1 = [p3, p0, p2].find((p) => this.hit(p));
        }
        c0!.val = d0?.isSolid() ? d0.val : trigger.root.val;
        c1!.val = d1?.isSolid() ? d1.val : trigger.root.val;
    }

    mirror(page: Page, line: Line): void {
        page.clip.points.forEach((point, index) => {
            this.clip.points[index]!.val = line.mirror(point).val;
        });
        const index = this.align === Align.HORIZONTAL ? 1 : 3;
        this._origin.val = line.mirror(page.points[index]!).val;
    }
}

export default Page;
