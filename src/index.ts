import Point from './core/point';
import Mouse from './core/mouse';
import List from './core/list';
import Book, { Align } from './core/book';
import { Direction } from './core/page';
import CanvasPainter from './painter/canvas';
import { fromEvent } from 'rxjs';
import {
    skip,
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
    ph: number,
    pv: number,
    tSize: number,
    align: Align,
    debug: boolean,
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
    root: Window;
    options: Options;
    mouse: Mouse;
    book: Book;
    list: List;

    constructor(options: Options) {
        this.options = options;
        this.root = window;

        const { w, h, ph = 60, pv = 100, tSize = 100 } = this.options;
        this.painter = new CanvasPainter(w, h);
        const content = document.getElementById('content') || document.createElement('div');
        this.list = new List(Array.from(content.children).map(node => node as CanvasImageSource));

        this.mouse = new Mouse();
        this.book = new Book(
            [
                new Point(0 + ph, 0 + pv),
                new Point(w - ph, 0 + pv),
                new Point(w - ph, h - pv),
                new Point(0 + ph, h - pv),
            ],
            tSize,
            Align.HORIZONTAL,
            // Align.VERTICAL,
        );

        // init
        this.initListener();
        this.render();
    }

    render(): void {
        this.painter.clear();

        if (this.options.debug) {
            Object.values(this.book.tMap).forEach(area => this.painter.draw(area));
            Array.from(this.book.rMap.values()).forEach(circles => {
                circles.forEach(c => this.painter.draw(c));
            });
            Object.values(this.book.pMap).forEach(page => {
                this.painter.draw(page.clip);
            });
        } else {
            // this.painter.draw(this.book.pMap.prev, this.getContent(curr, this.book.pMap.prev.offset));
            // this.painter.draw(this.book.pMap.curr, this.getContent(curr, this.book.pMap.curr.offset));
            // this.painter.draw(this.book.pMap.back, this.getContent(curr, this.book.pMap.back.offset));
            // this.painter.draw(this.book.pMap.front, this.getContent(curr, this.book.pMap.front.offset));
            this.painter.draw(this.book.pMap.prev, this.list.getItem(this.list.index - 1));
            this.painter.draw(this.book.pMap.curr, this.list.getItem(this.list.index));
            this.painter.draw(this.book.pMap.back, this.list.getItem(this.list.index + (this.book.pMap.back.direction === Direction.PREV ? -3 : 2)));
            this.painter.draw(this.book.pMap.front, this.list.getItem(this.list.index + (this.book.pMap.front.direction === Direction.PREV ? -2 : 1)));
        }
    }

    // getContent(curr: number, offset: number): CanvasImageSource {
    //     const o = offset > 0 ? offset - 1 : offset;
    //     return this.content[curr + o];
    // }

    // listener
    initListener(): void {
        const toXY = (event: MouseEvent): XY => {
            // return { x: event.offsetX, y: event.offsetY };
            const { x, y } = this.dom.getClientRects()[0];
            return { x: event.clientX - x, y: event.clientY - y };
        }
        const mouseDown = fromEvent<MouseEvent>(this.root, 'mousedown').pipe(
            map(toXY),
            filter(xy => !!this.book.test(new Point(xy.x, xy.y)))
        );
        const mouseMove = fromEvent<MouseEvent>(this.root, 'mousemove').pipe(
            map(toXY),
        );
        const mouseUp = fromEvent<MouseEvent>(this.root, 'mouseup').pipe(
            map(toXY),
        );

        // drag
        const start = mouseDown.pipe(
            map(xy => ({start: xy, current: xy, state: DragState.START}))
        );
        const middle = mouseDown.pipe(switchMap(
            () => mouseMove.pipe(takeUntil(mouseUp)),
            (start, current) => ({start, current, state: DragState.MIDDLE})
        ));
        const end = mouseDown.pipe(switchMap(
            () => mouseUp.pipe(take(1)),
            (start, current) => ({start, current, state: DragState.END})
        ));

        const drag = start.pipe(
            merge(middle, end),
            startWith({start: {x: 0, y: 0}, current: {x: 0, y: 0}, state: DragState.END}),
        )

        const moveStopByDrag = mouseMove
            .pipe(
                withLatestFrom(drag),
                map(([m, d]): [XY, Drag] => [
                    d.state === DragState.START ? {x: Number.MAX_SAFE_INTEGER, y: 0} : m,
                    d,
                ]),
                filter(([, d]) => d.state !== DragState.MIDDLE),
                map(([m]) => m),
            );
        const enterLeave = moveStopByDrag
            .pipe(
                map(xy => this.book.test(new Point(xy.x, xy.y))),
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
                filter(xy => !!this.book.test(new Point(xy.x, xy.y))),
                map(xy => ({
                    enter: null,
                    current: xy,
                    state: DragState.MIDDLE,
                })),
            );

        const trigger = enterLeave.pipe(merge(move));



        // enter and leave
        trigger.subscribe((action: any) => {
            // console.log('trigger', action);
            switch (action.state) {
                case DragState.START:
                    this.mouse.val = [action.enter.root.x, action.enter.root.y];
                    this.mouse.moveTo(action.current.x, action.current.y);
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
        drag.pipe(
            skip(1),
        ).subscribe((action: Drag) => {
            // console.log('drag', action);
            switch (action.state) {
                case DragState.START:
                    // this.mouse.val = [action.current.x, action.current.y];
                    this.mouse.moveTo(action.current.x, action.current.y);
                    break;
                case DragState.MIDDLE:
                    this.mouse.val = [action.current.x, action.current.y];
                    break;
                case DragState.END:
                    const { x: startX, y: startY } = action.start;
                    const { x: endX, y: endY } = action.current;
                    const [destination, direction] = this.book.findDestination(
                        new Point(startX, startY),
                        new Point(endX, endY),
                    );
                    this.mouse.moveTo(destination.x, destination.y);
                    console.log(destination, direction);
                    // TODO go previous or next
                    // this.list.flush();
                    // this.list.push(parseInt(direction, 10));
                    // setTimeout(() => this.list.flush(), 1000);
                    break;
                default: break;
            }
        });

        this.mouse.observable.pipe(
            merge(this.list.observable),
        ).subscribe(
            () => {
                this.book.update(this.mouse);
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
