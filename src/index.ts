import Point from './core/point';
import Mouse from './core/mouse';
import Area from './core/area';
import List from './core/list';
import Book from './core/book';
import Painter from './painter/base';
import CanvasPainter from './painter/canvas';
import DOMPainter from './painter/dom';
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
    throttleTime,
} from 'rxjs/operators';
import {
    FlipbookOptions,
    DragState,
    Drag,
    HoverState,
    Hover,
    Align,
    Direction,
} from './type';
import './index.css';

class Flipr {
    private painter: Painter;
    root: Window;
    options: FlipbookOptions;
    mouse: Mouse;
    book: Book;
    list: List;

    constructor(options: FlipbookOptions) {
        this.options = options;
        this.root = window;

        const {
            w,
            h,
            ph = 60,
            pv = 100,
            tSize = 100,
            align = Align.HORIZONTAL,
            content = document.createElement('div'),
        } = this.options;
        // this.painter = new CanvasPainter(w, h);
        this.painter = new DOMPainter(w, h, ph, pv);
        this.list = new List(
            Array.from(content.children).map((node) => node.cloneNode(true)),
            this.options.debug
        );

        this.mouse = new Mouse();
        this.book = new Book(
            [
                new Point(0 + ph, 0 + pv),
                new Point(w - ph, 0 + pv),
                new Point(w - ph, h - pv),
                new Point(0 + ph, h - pv),
            ],
            tSize,
            align
        );

        // init
        this.initListener();
        this.render();
    }

    render(): void {
        this.painter.clear();

        if (this.options.debug) {
            Object.values(this.book.triggers).forEach((area) => this.painter.draw(area));
            Array.from(this.book.rMap.values()).forEach((restrain) => {
                restrain.forEach((circle) => this.painter.draw(circle));
            });
            Object.values(this.book.pages).forEach((page) => {
                this.painter.draw(page.clip);
            });
            this.painter.draw(this.mouse);
        } else {
            this.painter.draw(
                this.book.pages.prev,
                this.list.getItemByOffset(this.book.pages.prev.offset)
            );
            this.painter.draw(
                this.book.pages.curr,
                this.list.getItemByOffset(this.book.pages.curr.offset)
            );
            this.painter.draw(this.book.shadows.back);
            this.painter.draw(
                this.book.pages.back,
                this.list.getItemByOffset(this.book.pages.back.offset)
            );
            this.painter.draw(
                this.book.pages.front,
                this.list.getItemByOffset(this.book.pages.front.offset)
            );
            this.painter.draw(this.book.shadows.front);
        }
    }

    // listener
    initListener(): void {
        const toXY = (event: MouseEvent): Point => {
            const { x, y } = this.dom.getBoundingClientRect();
            return new Point(event.clientX - x, event.clientY - y);
        };
        const mouseDown = fromEvent<MouseEvent>(this.root, 'mousedown').pipe(
            map(toXY),
            map((xy) => ({ enter: this.book.test(xy, this.list.isCover()), xy })),
            filter(({ enter }) => !!enter)
        );
        const mouseMove = fromEvent<MouseEvent>(this.root, 'mousemove').pipe(
            throttleTime(20),
            map(toXY)
        );
        const mouseUp = fromEvent<MouseEvent>(this.root, 'mouseup').pipe(map(toXY));

        // drag
        const start = mouseDown.pipe(
            map(({ xy, enter }) => ({
                enter,
                current: xy,
                state: DragState.START,
            }))
        );
        const middle = start.pipe(
            switchMap(
                () => mouseMove.pipe(takeUntil(mouseUp)),
                (start, current) => ({ ...start, current, state: DragState.MIDDLE })
            )
        );
        const end = start.pipe(
            switchMap(
                () => mouseUp.pipe(take(1)),
                (start, current) => ({
                    ...start,
                    start: start.current,
                    current,
                    state: DragState.END,
                })
            )
        );

        const drag = start.pipe(
            merge(middle, end),
            startWith({
                start: new Point(),
                current: new Point(),
                state: DragState.END,
            })
        );

        // trigger
        const moveUtilDragEnd = mouseMove.pipe(
            withLatestFrom(drag),
            filter(([, d]: [Point, Drag]) => d.state === DragState.END),
            map(([m]) => m)
        );
        const enterLeave = moveUtilDragEnd.pipe(
            map((xy) => this.book.test(xy, this.list.isCover())),
            distinctUntilChanged(),
            pairwise(),
            map(([lastEnter, enter]: any[]) => {
                return {
                    enter: enter || lastEnter,
                    current: new Point(),
                    state: enter ? HoverState.ENTER : HoverState.LEAVE,
                };
            })
        );
        const move = moveUtilDragEnd.pipe(
            map((xy) => [xy, this.book.test(xy, this.list.isCover())]),
            filter(([xy, enter]) => !!enter),
            map(([xy, enter]) => ({
                enter,
                current: xy,
                state: DragState.MIDDLE,
            }))
        );

        const trigger = enterLeave.pipe(merge(move));

        // enter and leave
        trigger.subscribe((action: any) => {
            if (this.mouse.prevent) {
                return;
            }
            // console.log('trigger', action);
            switch (action.state) {
                case HoverState.ENTER:
                    this.mouse.copyFrom(action.enter.root);
                    break;
                case HoverState.MIDDLE:
                    this.mouse.moveTo(action.current);
                    break;
                case HoverState.LEAVE:
                    this.mouse.moveTo(this.book.active.root);
                    break;
                default:
                    break;
            }
        });
        // drag
        drag.pipe(skip(1)).subscribe((action: any) => {
            // console.log('drag', action);
            switch (action.state) {
                case DragState.START:
                    this.mouse.copyFrom(this.book.active.root);
                    this.mouse.moveTo(action.current, true);
                    break;
                case DragState.MIDDLE:
                    this.mouse.moveTo(action.current);
                    break;
                case DragState.END:
                    const [destination, direction] = this.book.findDestination(
                        action.enter,
                        action.start,
                        action.current
                    );
                    this.mouse.moveTo(destination, true).then((res) => {
                        this.mouse.copyFrom(this.book.active.root);
                        this.list.index = this.list.index + direction * 2;
                        console.log(destination, direction, this.list.index);
                    });
                    break;
                default:
                    break;
            }
        });

        this.mouse.observable.pipe(merge(this.list.observable)).subscribe(() => {
            this.book.update(this.mouse);
            this.render();
        });
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
