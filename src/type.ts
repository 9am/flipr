import Area from './core/area';
import Point from './core/point';

export interface FlipbookOptions {
    w: number;
    h: number;
    ph: number;
    pv: number;
    tSize: number;
    align: Align;
    debug: boolean;
    content: HTMLElement;
    pageNum: number;
}

export interface PageOptions {
    w: number;
    h: number;
    origin: Point;
    offset: number;
    align: Align;
    id?: string;
}

export enum DragState {
    START = 'start',
    MIDDLE = 'middle',
    END = 'end',
}

export interface Drag {
    readonly enter: Area;
    readonly start: Point;
    readonly current: Point;
    readonly state: DragState;
}

export enum HoverState {
    ENTER = 'enter',
    MIDDLE = 'middle',
    LEAVE = 'leave',
}

export interface Hover {
    readonly enter: Area;
    readonly current: Point;
    readonly state: HoverState;
}

export enum Align {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}

export enum Direction {
    PREV = -1,
    STAY = 0,
    NEXT = +1,
}

export enum Offset {
    PREV_3 = -3,
    PREV_2 = -2,
    PREV = -1,
    CURR = 0,
    NEXT = +1,
    NEXT_2 = +2,
}
