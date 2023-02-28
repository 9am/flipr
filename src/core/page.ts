import Area from './area';
import Circle from './circle';
import Line from './line';
import Point from './point';

export enum Align {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}

class Page extends Area {
    private _active: Area;

    align: Align;
    clip0: Area;
    clip1: Area;
    bl: Line;
    ml: Line;
    // map of trigger area
    tMap: Record<string, Area> = {};
    // map of trigger area for clipping calculation
    cMap: Map<Area[], Area[]> = new Map();
    // map of restriction circle
    rMap: Map<Area[], Circle[]> = new Map();

    constructor(
        points: [tl: Point, tr: Point, br: Point, bl: Point],
        tSize = 100,
        align: Align = Align.HORIZONTAL,
    ) {
        super(points, '');
        this.align = align;
        this.bl = new Line([
            new Point(),
            new Point(),
        ], '');
        this.ml = new Line([0, 0, 0], '');
        this.clip0 = new Area([
            new Point(),
            new Point(),
            new Point(),
            new Point(),
        ], 'clip0');
        this.clip1 = new Area([
            new Point(),
            new Point(),
            new Point(),
            new Point(),
        ], 'clip1');

        this.tMap = this.prepareTriggerMap(points, tSize);
        this._active = this.tMap.tl;
        const [top, right, bottom, left] = [
            [this.tMap.tr, this.tMap.tl],
            [this.tMap.tr, this.tMap.br],
            [this.tMap.br, this.tMap.bl],
            [this.tMap.tl, this.tMap.bl],
        ];
        this.cMap = this.prepareClipMap([top, right, bottom, left]);
        this.rMap = this.prepareRestrainMap([top, right, bottom, left]);
    }

    prepareTriggerMap(points: Point[], tSize: number): Record<string, Area> {
        const [tl, tr, br, bl] = points;
        return {
            tl: new Area([
                tl,
                new Point(tl.x + tSize, tl.y),
                new Point(tl.x + tSize, tl.y + tSize),
                new Point(tl.x, tl.y + tSize),
            ], 'tl'),
            tr: new Area([
                tr,
                new Point(tr.x - tSize, tr.y),
                new Point(tr.x - tSize, tr.y + tSize),
                new Point(tr.x, tr.y + tSize),
            ], 'tr'),
            br: new Area([
                br,
                new Point(br.x - tSize, br.y),
                new Point(br.x - tSize, br.y - tSize),
                new Point(br.x, br.y - tSize),
            ], 'br'),
            bl: new Area([
                bl,
                new Point(bl.x + tSize, bl.y),
                new Point(bl.x + tSize, bl.y - tSize),
                new Point(bl.x, bl.y - tSize),
            ], 'bl'),
        };
    }

    prepareClipMap([top, right, bottom, left]: Area[][]): Map<Area[], Area[]> {
        const map = new Map();
        if (this.align === Align.HORIZONTAL) {
            map.set(left, left);
            map.set(right, right);
        } else {
            map.set(top, top);
            map.set(bottom, bottom);
        }
        return map;
    }

    prepareRestrainMap([top, right, bottom, left]: Area[][]): Map<Area[], Circle[]>{
        const map = new Map();
        if (this.align === Align.HORIZONTAL) {
            const tm = top[0].root.getMiddle(top[1].root);
            const bm = bottom[0].root.getMiddle(bottom[1].root);
            const d0 = top[0].root.dist(top[1].root) / 2;
            const d1 = top[0].root.dist(bm);
            map.set(top, [
                new Circle(bm.x, bm.y, d1),
                new Circle(tm.x, tm.y, d0),
            ]);
            map.set(bottom, [
                new Circle(tm.x, tm.y, d1),
                new Circle(bm.x, bm.y, d0),
            ]);
        } else {
            const tm = left[0].root.getMiddle(left[1].root);
            const bm = right[0].root.getMiddle(right[1].root);
            const d0 = left[0].root.dist(left[1].root) / 2;
            const d1 = left[0].root.dist(bm);
            map.set(left, [
                new Circle(bm.x, bm.y, d1),
                new Circle(tm.x, tm.y, d0),
            ]);
            map.set(right, [
                new Circle(tm.x, tm.y, d1),
                new Circle(bm.x, bm.y, d0),
            ]);
        }
        return map;
    }

    update(mouse: Point): void {
        this.bl.points[1].val = this.restrain(mouse);
        this.ml.abc = this.bl.getMsAbc();
        const [p0, p1, p2, p3] = this.cross(this.ml);
        switch (this.align) {
            case Align.HORIZONTAL:
                this.clip0.points[0].val = p0.isSolid() ? p0.val : this._active.root.val;
                this.clip0.points[1].val = p2.isSolid() ? p2.val : this._active.root.val;
                break;
            case Align.VERTICAL:
                this.clip0.points[0].val = p1.isSolid() ? p1.val : this._active.root.val;
                this.clip0.points[1].val = p3.isSolid() ? p3.val : this._active.root.val;
                break;

        }
        this.clip0.points.forEach((point, index) => {
            this.clip1.points[index].val = this.ml.mirror(point).val;
        });
    }

    test(point: Point): Area | null {
        const trigger = Object.values(this.tMap).reduce((memo: Area | null, rect) => {
            if (memo) {
                return memo;
            }
            return rect.hit(point) ? rect : memo;
        }, null);
        if (trigger) {
            this.active = trigger;
        }
        return trigger;
    }

    set active(trigger: Area) {
        this._active = trigger;

        this.bl.points[0].val = trigger.root.val;
        for (const [key, val] of this.cMap.entries()) {
            if (key.includes(trigger)) {
                this.clip0.points[2].val = val[1].root.val;
                this.clip0.points[3].val = val[0].root.val;
                break;
            }
        }
    }

    restrain(mouse: Point): [number, number] {
        let restrainCircles: Circle[] = [];
        for (const [key, val] of this.rMap.entries()) {
            if (key.includes(this._active)) {
                restrainCircles = val;
                break;
            }
        }
        if (!restrainCircles.length) {
            return mouse.val;
        }
        return restrainCircles.reduce((memo: Point, circle) => {
            if (!circle.hit(memo)) {
                const l = new Line([new Point(circle.x, circle.y), memo], '');
                const cp = circle.cross(l).find(p => l.include(p));
                if (cp) {
                    memo.val = cp.val;
                }
            }
            return memo;
        }, mouse.clone()).val;
    }
}

export default Page;
