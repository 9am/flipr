import Area from './area';
import Page, { Direction } from './page';
import Circle from './circle';
import Line from './line';
import Point from './point';

export enum Align {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}

class Book extends Area {
    private _active: Area;

    align: Align;
    bl: Line; // base line
    ml: Line; // middle line
    pMap: Record<string, Page> = {}; // map of pages
    tMap: Record<string, Area> = {}; // map of trigger area
    gMap: Record<string, Area[]> = {}; // map of trigger area group for clipping calculation
    rMap: Map<Area[], Circle[]> = new Map(); // map of restriction circle

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

        this.pMap = this.preparePage(points);
        this.tMap = this.prepareTrigger(points, tSize);
        this._active = this.tMap.tl;
        const [top, right, bottom, left] = [
            [this.tMap.tr, this.tMap.tl],
            [this.tMap.tr, this.tMap.br],
            [this.tMap.br, this.tMap.bl],
            [this.tMap.tl, this.tMap.bl],
        ];
        this.gMap = this.prepareTriggerGroup([top, right, bottom, left]);
        this.rMap = this.prepareRestrain([top, right, bottom, left]);
    }

    private preparePage(points: Point[]): Record<string, Page> {
        const [tl, tr, br, bl] = points;
        const [w, h] = this.align === Align.HORIZONTAL
            ? [(tr.x - tl.x) / 2, br.y - tr.y]
            : [tr.x - tl.x, (br.y - tr.y) / 2];
        return {
            prev: new Page(tl.clone(), w, h, 1, Direction.PREV),
            curr: new Page(
                this.align === Align.HORIZONTAL ? tl.getMiddle(tr) : tl.getMiddle(bl),
                w,
                h,
                1,
                Direction.NEXT,
            ),
            front: new Page(tl.clone(), w, h, 2, Direction.PREV, this.align),
            back: new Page(tl.clone(), w, h, 3, Direction.PREV, this.align),
        };
    }

    private prepareTrigger(points: Point[], tSize: number): Record<string, Area> {
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

    private prepareTriggerGroup([top, right, bottom, left]: Area[][]): Record<string, Area[]> {
        return this.align === Align.HORIZONTAL
            ? {
                [Direction.PREV]: left,
                [Direction.NEXT]: right,
            }
            : {
                [Direction.PREV]: top,
                [Direction.NEXT]: bottom,
            };
    }

    private prepareRestrain([top, right, bottom, left]: Area[][]): Map<Area[], Circle[]>{
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

    private restrain(mouse: Point): [number, number] {
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

    update(mouse: Point): void {
        this.bl.points[1].val = this.restrain(mouse);
        this.ml.abc = this.bl.getMsAbc();
        const crossPoints = this.cross(this.ml);
        this.pMap.back.updateClip(crossPoints, this._active);
        this.pMap.front.mirror(this.pMap.back, this.ml);
    }


    test(mouse: Point): Area | null {
        const trigger = Object.values(this.tMap).reduce((memo: Area | null, rect) => {
            if (memo) {
                return memo;
            }
            return rect.hit(mouse) ? rect : memo;
        }, null);
        if (trigger) {
            this.active = trigger;
        }
        return trigger;
    }

    set active(trigger: Area) {
        this._active = trigger;

        this.bl.points[0].val = trigger.root.val;
        Object.keys(this.gMap).some(direction => {
            const group = this.gMap[direction];
            if (group.includes(trigger)) {
                const targetPage = direction === Direction.PREV ? 'prev' : 'curr';
                this.pMap.back.clip.points[2].val = group[1].root.val;
                this.pMap.back.clip.points[3].val = group[0].root.val;
                this.pMap.back.origin = this.pMap[targetPage].root.clone();
                this.pMap.back.direction = direction as Direction;
                this.pMap.front.direction = direction as Direction;
                return true;
            }
            return false;
        });
    }

    findDestination(start: Point, end: Point): [Point, Direction] {
        const [tl, tr, br, bl] = this.points;
        const map = new Map<Point, Point[]>([
            [tl, [tl, tr]],
            [tr, [tl, tr]],
            [bl, [bl, br]],
            [br, [bl, br]],
        ]);
        const startRoot = start.closest(Array.from(map.keys()));
        const pair = map.get(startRoot) || [];
        let endRoot = end.closest(pair);
        const offset = pair.indexOf(startRoot) - pair.indexOf(endRoot)

        // drag
        let direction = Direction.STAY;
        switch (offset) {
            case 1:
                direction = Direction.NEXT;
                break;
            case -1:
                direction = Direction.PREV;
                break;
            case 0:
                direction = Direction.STAY;
                break;
            default:
                break;
        }
        // click
        if (start.dist(end) < 10) {
            direction = !!pair.indexOf(startRoot) ? Direction.NEXT : Direction.PREV;
            endRoot = pair.filter(p => p !== startRoot)[0];
        }
        return [endRoot, direction];
    }
}

export default Book;
