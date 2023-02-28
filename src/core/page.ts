import Area from './area';
import Line from './line';
import Point from './point';

export enum Align {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}

class Page extends Area {
    align: Align;
    clip0: Area;
    clip1: Area;
    bl: Line;
    ml: Line;
    previous: Area[] = [];
    next: Area[] = [];
    tMap: Record<string, Area>;
    tArea: Area[] = [];

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

        this.previous = this.align === Align.HORIZONTAL
            ? [tMap.tl, tMap.bl]
            : [tMap.tr, tMap.tl];
        this.next = this.align === Align.HORIZONTAL
            ? [tMap.tr, tMap.br]
            : [tMap.br, tMap.bl];
        this.tArea = [...this.previous, ...this.next];
        this.tMap = tMap;
    }

    update(mouse: Point): void {
        this.bl.points[1].val = mouse.val;
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
            this.setRoot(trigger);
        }
        return trigger;
    }

    setRoot(trigger: Area): void {
        this.bl.points[0].val = trigger.root.val;
        const group = this.previous.includes(trigger)
            ? this.previous
            : this.next;
        this.clip0.points[2].val = group[1].root.val;
        this.clip0.points[3].val = group[0].root.val;
    }

    limitMouse(): void {
        console.log(1);
    }
}

export default Page;
