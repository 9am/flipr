import Point from './core/point';
import Mouse from './core/mouse';
import Area from './core/area';
import List from './core/list';
import Book from './core/book';
import Tween from './core/tween';
import Painter from './painter/base';
import CanvasPainter from './painter/canvas';
import DOMPainter from './painter/dom';
import { Unsubscribable, interval, fromEvent, Observable } from 'rxjs';
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
import type { FliprOptions, Drag, Hover } from './type';
import { defaultOptions, DragState, HoverState } from './type';

class Flipr {
    readonly options: Required<FliprOptions>;
    private root: Window = window;
    private painter: Painter;
    private mouse: Mouse;
    private book: Book;
    private list: List;
    private listeners: Unsubscribable[] = [];

    constructor(options: FliprOptions) {
        this.options = { ...defaultOptions, ...options };
        const { w, h, content, ph, pv, tSize, align, pageNum, debug } = this.options;
        // this.painter = new CanvasPainter(w, h);
        this.painter = new DOMPainter(w, h, ph, pv, align);
        this.list = new List(
            Array.from(content.children).map((node) => node.cloneNode(true)),
            pageNum,
            debug
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

    private render(): void {
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
            this.painter.draw(
                this.book.pages.back,
                this.list.getItemByOffset(this.book.pages.back.offset)
            );
            this.painter.draw(
                this.book.pages.front,
                this.list.getItemByOffset(this.book.pages.front.offset)
            );
            this.painter.draw(this.book.shadows.prev);
            this.painter.draw(this.book.shadows.curr);
            this.painter.draw(this.book.shadows.back);
            this.painter.draw(this.book.shadows.front);
            this.painter.draw(this.list);
        }
    }

    // listener
    private initListener(): void {
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

        const drag: Observable<any> = start.pipe(
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
        this.listeners.push(
            trigger.subscribe((action: any) => {
                // console.log('trigger', action);
                switch (action.state) {
                    case HoverState.ENTER:
                        this.mouse.copyFrom(action.enter.root);
                        break;
                    case HoverState.MIDDLE:
                        if (this.mouse.prevent) {
                            return;
                        }
                        this.mouse.moveTo(action.current);
                        break;
                    case HoverState.LEAVE:
                        if (this.mouse.prevent) {
                            return;
                        }
                        this.mouse.moveTo(this.book.active.root);
                        break;
                    default:
                        break;
                }
            })
        );
        // dnd
        this.listeners.push(
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
                            // console.log(destination, direction, this.list.index);
                        });
                        break;
                    default:
                        break;
                }
            })
        );
        // update
        this.listeners.push(
            this.mouse.observable.pipe(merge(this.list.observable)).subscribe(() => {
                this.book.update(this.mouse);
                this.render();
            })
        );
        // active
        const { tHint, tHintInterval } = this.options;
        this.book.active = tHint
            ? this.book.triggers[tHint] ?? this.book.active
            : this.book.active;
        this.mouse.copyFrom(this.book.active.root);
        // hint
        if (tHint) {
            this.listeners.push(
                interval(tHintInterval)
                    .pipe(
                        map((index) => index % 2),
                        takeUntil(trigger)
                    )
                    .subscribe((on) => {
                        const destination = on
                            ? this.book.active.points[0]
                            : this.book.active.points[2];
                        this.mouse.moveTo(destination!);
                    })
            );
        }
    }

    private removeListener() {
        this.listeners.forEach((listener: Unsubscribable) => listener.unsubscribe());
        this.listeners = [];
    }

    get dom(): HTMLElement {
        return this.painter.dom;
    }

    log(): void {
        console.log(JSON.stringify(this.options, null, 4));
    }

    destory() {
        this.removeListener();
    }
}

export { Align, TriggerName } from './type';
export type { FliprOptions } from './type';
export default Flipr;
