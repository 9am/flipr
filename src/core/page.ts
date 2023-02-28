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

    // tMap: Record<string, Area>;
    cMap: Map<Area[], Area[]>;
    rMap: Map<Area[], Circle[]>;
    tArea: Area[] = [];

    c: Circle[] = [];

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

        const [tl, tr, br, bl] = points;
        const tMap = {
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
        this.tArea = Object.values(tMap);

        const [top, right, bottom, left] = [
            [tMap.tr, tMap.tl],
            [tMap.tr, tMap.br],
            [tMap.br, tMap.bl],
            [tMap.tl, tMap.bl],
        ];

        this.cMap = new Map();
        if (this.align === Align.HORIZONTAL) {
            this.cMap.set(left, left);
            this.cMap.set(right, right);
        } else {
            this.cMap.set(top, top);
            this.cMap.set(bottom, bottom);
        }


        this.rMap = new Map();
        if (this.align === Align.HORIZONTAL) {
            const tm = top[0].root.getMiddle(top[1].root);
            const bm = bottom[0].root.getMiddle(bottom[1].root);
            const d0 = top[0].root.dist(top[1].root) / 2;
            const d1 = top[0].root.dist(bm);
            this.rMap.set(top, [
                new Circle(bm.x, bm.y, d1),
                new Circle(tm.x, tm.y, d0),
            ]);
            this.rMap.set(bottom, [
                new Circle(tm.x, tm.y, d1),
                new Circle(bm.x, bm.y, d0),
            ]);
        } else {
        }

        this._active = tMap.tl;
    }

    update(mouse: Point): void {
        this.bl.points[1].val = this.restrain(mouse);
        this.ml.abc = this.bl.getMsAbc();
        const [p0, p1, p2, p3] = this.cross(this.ml);
        switch (this.align) {
            case Align.HORIZONTAL:
                this.clip0.points[0].val = p0.val;
                this.clip0.points[1].val = p2.val;
                break;
            case Align.VERTICAL:
                this.clip0.points[0].val = p1.val;
                this.clip0.points[1].val = p3.val;
                break;

        }
        this.clip0.points.forEach((point, index) => {
            this.clip1.points[index].val = this.ml.mirror(point).val;
        });
    }

    test(point: Point): Area | null {
        const trigger = this.tArea.reduce((memo: Area | null, rect) => {
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
                this.c = val;
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
                console.log('xxx', cp);
                if (cp) {
                    memo.val = cp.val;
                }
            }
            return memo;
        }, mouse.clone()).val;
    }
}

export default Page;
