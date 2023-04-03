import Area from './area';
import Page from './page';
import Circle from './circle';
import Line from './line';
import Point from './point';
import Shadow from './shadow';
import { PageName, TriggerName, Align, Direction, Offset } from '../type';

class Book extends Area {
    private _active: Area;

    align: Align;
    bl: Line = new Line([new Point(), new Point()], ''); // base line
    ml: Line = new Line([0, 0, 0], ''); // middle line
    pages: Record<PageName, Page>; // pages object
    triggers: Record<TriggerName, Area>; // trigger object
    shadows: Record<PageName, Shadow>; // trigger object
    rMap: Map<Area, Circle[]> = new Map(); // map of restriction circle
    dMap: Map<Area, [Point, Direction]> = new Map(); // map of destination
    aMap: Map<Area, [Area, Area, Point, number, number]> = new Map(); // map of active handle

    constructor(
        points: [tl: Point, tr: Point, br: Point, bl: Point],
        tSize = 100,
        align: Align = Align.HORIZONTAL
    ) {
        super(points, '');
        this.align = align;

        this.pages = this.preparePage(points);
        this.triggers = this.prepareTrigger(points, tSize);
        this.aMap = this.prepareActiveMap();
        this.rMap = this.prepareRestrainMap();
        this.dMap = this.prepareDestinationMap();
        this.shadows = {
            [PageName.PREV]: new Shadow(PageName.PREV).add([
                this.pages.prev.clip.lines[align === Align.HORIZONTAL ? 3 : 0]!,
            ]),
            [PageName.CURR]: new Shadow(PageName.CURR).add([
                this.pages.curr.clip.lines[align === Align.HORIZONTAL ? 1 : 2]!,
            ]),
            [PageName.BACK]: new Shadow(PageName.BACK, this).add([
                this.pages.back.clip.lines[0]!,
            ]),
            [PageName.FRONT]: new Shadow(PageName.FRONT, this.pages.front.clip).add(
                this.pages.front.clip.lines[0]!
            ),
        };
        this._active = this.triggers.tr;
        // const [top, right, bottom, left] = [
        //     [this.triggers.tr, this.triggers.tl],
        //     [this.triggers.tr, this.triggers.br],
        //     [this.triggers.br, this.triggers.bl],
        //     [this.triggers.tl, this.triggers.bl],
        // ];
    }

    private preparePage(points: [Point, Point, Point, Point]): Record<string, Page> {
        const [tl, tr, br, bl] = points;
        const [w, h] =
            this.align === Align.HORIZONTAL
                ? [(tr.x - tl.x) / 2, br.y - tr.y]
                : [tr.x - tl.x, (br.y - tr.y) / 2];
        const currOrigin =
            this.align === Align.HORIZONTAL ? tl.getMiddle(tr) : tl.getMiddle(bl);
        return {
            prev: new Page({
                origin: tl.clone(),
                w,
                h,
                offset: Offset.PREV,
                align: this.align,
                id: PageName.PREV,
            }),
            curr: new Page({
                origin: currOrigin,
                w,
                h,
                offset: Offset.CURR,
                align: this.align,
                id: PageName.CURR,
            }),
            front: new Page({
                origin: tl.clone(),
                w,
                h,
                offset: Offset.NEXT,
                align: this.align,
                id: PageName.FRONT,
            }),
            back: new Page({
                origin: tl.clone(),
                w,
                h,
                offset: Offset.NEXT_2,
                align: this.align,
                id: PageName.BACK,
            }),
        };
    }

    private prepareTrigger(
        points: [Point, Point, Point, Point],
        tSize: number
    ): Record<string, Area> {
        const [tl, tr, br, bl] = points;
        return {
            tl: new Area(
                [
                    tl,
                    new Point(tl.x + tSize, tl.y),
                    new Point(tl.x + tSize, tl.y + tSize),
                    new Point(tl.x, tl.y + tSize),
                ],
                'tl'
            ),
            tr: new Area(
                [
                    tr,
                    new Point(tr.x - tSize, tr.y),
                    new Point(tr.x - tSize, tr.y + tSize),
                    new Point(tr.x, tr.y + tSize),
                ],
                'tr'
            ),
            br: new Area(
                [
                    br,
                    new Point(br.x - tSize, br.y),
                    new Point(br.x - tSize, br.y - tSize),
                    new Point(br.x, br.y - tSize),
                ],
                'br'
            ),
            bl: new Area(
                [
                    bl,
                    new Point(bl.x + tSize, bl.y),
                    new Point(bl.x + tSize, bl.y - tSize),
                    new Point(bl.x, bl.y - tSize),
                ],
                'bl'
            ),
        };
    }

    private prepareActiveMap(): Map<Area, [Area, Area, Point, number, number]> {
        const { tl, tr, bl, br } = this.triggers;
        const { prev, curr } = this.pages;
        return this.align === Align.HORIZONTAL
            ? new Map<Area, [Area, Area, Point, number, number]>([
                  [tl, [tl, bl, prev.root, Offset.PREV_2, Offset.PREV_3]],
                  [tr, [tr, br, curr.root, Offset.NEXT, Offset.NEXT_2]],
                  [bl, [tl, bl, prev.root, Offset.PREV_2, Offset.PREV_3]],
                  [br, [tr, br, curr.root, Offset.NEXT, Offset.NEXT_2]],
              ])
            : new Map<Area, [Area, Area, Point, number, number]>([
                  [tl, [tr, tl, prev.root, Offset.PREV_2, Offset.PREV_3]],
                  [tr, [tr, tl, prev.root, Offset.PREV_2, Offset.PREV_3]],
                  [bl, [br, bl, curr.root, Offset.NEXT, Offset.NEXT_2]],
                  [br, [br, bl, curr.root, Offset.NEXT, Offset.NEXT_2]],
              ]);
    }

    private prepareDestinationMap(): Map<Area, [Point, Direction]> {
        const { tl, tr, bl, br } = this.triggers;
        return this.align === Align.HORIZONTAL
            ? new Map<Area, [Point, Direction]>([
                  [tl, [tr.root, Direction.PREV]],
                  [tr, [tl.root, Direction.NEXT]],
                  [bl, [br.root, Direction.PREV]],
                  [br, [bl.root, Direction.NEXT]],
              ])
            : new Map<Area, [Point, Direction]>([
                  [tl, [bl.root, Direction.PREV]],
                  [tr, [br.root, Direction.PREV]],
                  [bl, [tl.root, Direction.NEXT]],
                  [br, [tr.root, Direction.NEXT]],
              ]);
    }

    private prepareRestrainMap(): Map<Area, Circle[]> {
        const { tl, tr, bl, br } = this.triggers;
        const [[t0, t1], [b0, b1]] =
            this.align === Align.HORIZONTAL
                ? [
                      [tr, tl],
                      [br, bl],
                  ]
                : [
                      [tl, bl],
                      [tr, br],
                  ];
        const tm = t0.root.getMiddle(t1.root);
        const bm = b0.root.getMiddle(b1.root);
        const d0 = t0.root.dist(t1.root) / 2;
        const d1 = t0.root.dist(bm);
        const r0 = [new Circle(bm.x, bm.y, d1, 'r00'), new Circle(tm.x, tm.y, d0, 'r01')];
        const r1 = [new Circle(tm.x, tm.y, d1, 'r10'), new Circle(bm.x, bm.y, d0, 'r11')];
        return this.align === Align.HORIZONTAL
            ? new Map<Area, Circle[]>([
                  [tl, r0],
                  [tr, r0],
                  [bl, r1],
                  [br, r1],
              ])
            : new Map<Area, Circle[]>([
                  [tl, r0],
                  [tr, r1],
                  [bl, r0],
                  [br, r1],
              ]);
    }

    private restrain(mouse: Point): [number, number] {
        let restrainCircles: Circle[] | undefined = this.rMap.get(this._active);
        if (!restrainCircles?.length) {
            return mouse.val;
        }
        return restrainCircles.reduce((memo: Point, circle) => {
            if (!circle.hit(memo)) {
                const l = new Line([new Point(circle.x, circle.y), memo], '');
                const cp = circle.cross(l).find((p) => l.include(p));
                if (cp) {
                    memo.val = cp.val;
                }
            }
            return memo;
        }, mouse.clone()).val;
    }

    update(mouse: Point): void {
        this.bl.points[1]!.val = this.restrain(mouse);
        this.ml.abc = this.bl.getMsAbc();
        const crossPoints = this.cross(this.ml);
        this.pages.back.updateClip(crossPoints, this._active);
        this.pages.front.mirror(this.pages.back, this.ml);
    }

    test(mouse: Point, [isFrontCover, isEndCover]: [boolean, boolean]): Area | null {
        // const trigger = Object.values(this.triggers).reduce((memo: Area | null, rect) => {
        let triggers = Object.values(this.triggers);
        if (isEndCover) {
            triggers =
                this.align === Align.HORIZONTAL
                    ? [this.triggers.tl, this.triggers.bl]
                    : [this.triggers.tl, this.triggers.tr];
        }
        if (isFrontCover) {
            triggers =
                this.align === Align.HORIZONTAL
                    ? [this.triggers.tr, this.triggers.br]
                    : [this.triggers.bl, this.triggers.br];
        }
        let trigger = null;
        triggers.some((area) => {
            if (area.hit(mouse)) {
                trigger = area;
                return true;
            }
            return false;
        });
        if (trigger) {
            this.active = trigger;
        }
        return trigger;
    }

    get active(): Area {
        return this._active;
    }

    set active(trigger: Area) {
        this._active = trigger;

        this.bl.points[0]!.val = trigger.root.val;
        const [t1, t2, root, frontOffset, backOffset]: [
            Area,
            Area,
            Point,
            number,
            number
        ] = this.aMap.get(trigger)!;
        this.pages.back.clip.points[2]!.copyFrom(t2.root);
        this.pages.back.clip.points[3]!.copyFrom(t1.root);
        this.pages.back.origin = root.clone();
        this.pages.front.origin = root.clone();
        this.pages.front.offset = frontOffset;
        this.pages.back.offset = backOffset;
    }

    findDestination(trigger: Area, start: Point, end: Point): [Point, Direction] {
        if (trigger.hit(end)) {
            // click
            if (start.dist(end) < 10) {
                return this.dMap.get(trigger)!;
            }
            return [trigger.root, Direction.STAY];
        }
        return this.dMap.get(trigger)!;
    }
}

export default Book;
