import Flipr from '.';
import Area from './core/area';
import Point from './core/point';

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

export enum TriggerName {
    TL = 'tl',
    TR = 'tr',
    BL = 'bl',
    BR = 'br',
}

export enum PageName {
    PREV = 'prev',
    CURR = 'curr',
    BACK = 'back',
    FRONT = 'front',
}

interface FliprRequired {
    w: number;
    h: number;
    content: HTMLElement;
}
interface FliprOptional {
    ph?: number;
    pv?: number;
    tSize?: number;
    align?: Align;
    debug?: boolean;
    pageNum?: number;
    tHint?: TriggerName | '';
    tHintInterval?: number;
}

export type FliprOptions = FliprRequired & FliprOptional;

export const defaultOptions: Required<FliprOptional> = {
    ph: 0,
    pv: 0,
    tSize: 100,
    align: Align.HORIZONTAL,
    pageNum: 0,
    debug: false,
    tHint: '',
    tHintInterval: 1000,
};

export interface PageOptions {
    w: number;
    h: number;
    origin: Point;
    offset: number;
    align: Align;
    id?: string;
}
