import Point from './core/point';
import Mouse from './core/mouse';
import Page, { Align } from './core/page';
import CanvasPainter from './painter/canvas';
import { fromEvent } from 'rxjs';
import {
    startWith,
    filter,
    map,
    distinctUntilChanged,
    pairwise,
    switchMap,
    takeUntil,
    take,
    merge,
    withLatestFrom,
} from 'rxjs/operators';

interface Options {
    w: number,
    h: number,
    align: Align,
}



interface XY {
  readonly x: number;
  readonly y: number;
}
enum DragState {
  START = 'start',
  MIDDLE = 'middle',
  END = 'end',
}
interface Drag {
  readonly start: XY;
  readonly current: XY;
  readonly state: DragState;
}



class Flipr {
    private painter: CanvasPainter;
    root: HTMLElement;
    options: Options;
    mouse: Mouse;
    page: Page;
    content: CanvasImageSource[];

    constructor(options: Options) {
        this.options = options;
        this.root = document.body;

        const { w, h } = this.options;
        this.painter = new CanvasPainter(w, h);
        const content = document.getElementById('content') || document.createElement('div');
        this.content = Array.from(content.children).map(node => node as CanvasImageSource);

        const [pv, ph] = [60, 60];
        const tSize = 100;

        this.mouse = new Mouse();
        this.page = new Page(
            [
                new Point(0 + ph, 0 + pv),
                new Point(w - ph, 0 + pv),
                new Point(w - ph, h - pv),
                new Point(0 + ph, h - pv),
            ],
            tSize,
            Align.HORIZONTAL,
        );

        // init
        this.initListener();
        this.render();
    }

    render(): void {
        this.painter.clear();
        this.painter.draw(this.page);
        this.page.tArea.forEach(area => this.painter.draw(area));
        this.painter.draw(this.page.clip0);
        this.painter.draw(this.page.clip1);

        // for (const circles of this.page.rMap.values()) {
        //     circles.forEach(c => this.painter.draw(c));
        // }
        this.page.c.forEach(c => this.painter.draw(c));
    }

    // listener
    initListener(): void {
        const toXY = (event: MouseEvent): XY => {
            const { x, y } = this.dom.getClientRects()[0];
            return { x: event.clientX - x, y: event.clientY -y };
        }
        const mouseDown = fromEvent<MouseEvent>(this.root, 'mousedown').pipe(
            map(toXY),
            filter(xy => !!this.page.test(new Point(xy.x, xy.y)))
        );
        const mouseMove = fromEvent<MouseEvent>(this.root, 'mousemove').pipe(
            map(toXY),
        );
        const mouseUpLeave = fromEvent<MouseEvent>(this.root, 'mouseup').pipe(
            merge(fromEvent<MouseEvent>(this.root, 'mouseleave')),
            map(toXY),
        );

        // drag
        const start = mouseDown.pipe(
            map(xy => ({start: xy, current: xy, state: DragState.START}))
        );
        const middle = mouseDown.pipe(switchMap(
            () => mouseMove.pipe(takeUntil(mouseUpLeave)),
            (start, current) => ({start, current, state: DragState.MIDDLE})
        ));
        const end = mouseDown.pipe(switchMap(
            () => mouseUpLeave.pipe(take(1)),
            (start, current) => ({start, current, state: DragState.END})
        ));

        const drag = start.pipe(
            merge(middle, end),
            startWith({start: {x: 0, y: 0}, current: {x: 0, y: 0}, state: DragState.END}),
        )

        const moveStopByDrag = mouseMove
            .pipe(
                withLatestFrom(drag),
                filter(([, d]) => d.state === DragState.END),
                map(([m]) => m),
            );
        const enterLeave = moveStopByDrag
            .pipe(
                map(xy => this.page.test(new Point(xy.x, xy.y))),
                distinctUntilChanged(),
                pairwise(),
                map(([lastEnter, enter]: any[]) => {
                    return {
                        enter: enter || lastEnter,
                        current: { x: 0, y: 0 },
                        state: enter ? DragState.START : DragState.END,
                    };
                }),
            )
        const move = moveStopByDrag
            .pipe(
                filter(xy => !!this.page.test(new Point(xy.x, xy.y))),
                map(xy => ({
                    enter: null,
                    current: xy,
                    state: DragState.MIDDLE,
                })),
            );

        const trigger = enterLeave.pipe(merge(move));



        // enter and leave
        trigger.subscribe((action: any) => {
            console.log('trigger', action);
            switch (action.state) {
                case DragState.START:
                    this.mouse.val = [action.enter.root.x, action.enter.root.y];
                    break;
                case DragState.MIDDLE:
                    this.mouse.moveTo(action.current.x, action.current.y);
                    break;
                case DragState.END:
                    this.mouse.moveTo(action.enter.root.x, action.enter.root.y);
                    break;
                default: break;
            }
        });
        // drag
        drag.subscribe((action: Drag) => {
            console.log('drag', action);
            switch (action.state) {
                case DragState.START:
                    this.mouse.moveTo(action.current.x, action.current.y);
                    break;
                case DragState.MIDDLE:
                    this.mouse.val = [action.current.x, action.current.y];
                    break;
                case DragState.END:
                    // TODO go previous or next
                    // TODO moveTo(different tirgger root)
                    break;
                default: break;
            }
        });

        this.mouse.observable.subscribe(
            () => {
                this.page.update(this.mouse);
                this.render();
            }
        );

    }

    log(): void {
        console.log(JSON.stringify(this.options, null, 4));
    }

    // accessor
    get dom(): HTMLElement {
        return this.painter.dom;
    }
}

export default Flipr;
