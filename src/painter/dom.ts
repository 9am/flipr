import Point from '../core/point';
import Line from '../core/line';
import Circle from '../core/circle';
import Area from '../core/area';
import Page from '../core/page';
import Painter from './base';

const STYLE = {
    painter: `
        --w: 800;
        --h: 600;
        position: relative;
        top: 0;
        left: 0;
        width: calc(var(--w) * 1px);
        height: calc(var(--h) * 1px);
        outline: 1px dashed grey;
    `,
    pitem: `
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    `,
    point: `
        --x: 0;
        --y: 0;
        --r: 6;
        --r-h: calc(var(--r) / 2);
        --x-px: calc((var(--x) - var(--r-h)) * 1px);
        --y-px: calc((var(--y) - var(--r-h)) * 1px);
        --r-px: calc(var(--r) * 1px);
        width: var(--r-px);
        height: var(--r-px);
        border-radius: 50%;
        transform: translate(var(--x-px), var(--y-px));
        border: 1px solid red;
    `,
    area: `
        --clip-path: initial;
        clip-path: var(--clip-path);
        background: rgba(255, 0, 0, 0.05);
    `,
    page: `
        background: rgba(255, 0, 255, 0.05);
        --clip-path: initial;
        --transform: initial;
        clip-path: var(--clip-path);
    `,
    content: `
        width: calc(50% - var(--ph) * 1px);
        height: calc(100% - var(--pv) * 2px);
        transform: var(--transform);
        transform-origin: top left;
        overflow: auto;
        padding: 10px;
        background: whitesmoke;
        outline: 1px solid dimgrey;
        outline-offset: -1px;
    `,
};

class DomPainter extends Painter {
    private _wrapper: HTMLElement;
    private _domMap: Map<string, HTMLElement> = new Map();

    constructor(w: number, h: number, ph: number, pv: number) {
        super();
        this._wrapper = document.createElement('div');
        this._wrapper.className = 'painter';
        this._wrapper.style.cssText = STYLE.painter;
        this._wrapper.style.setProperty('--w', `${w}`);
        this._wrapper.style.setProperty('--h', `${h}`);
        this._wrapper.style.setProperty('--ph', `${ph}`);
        this._wrapper.style.setProperty('--pv', `${pv}`);
    }

    addElement(eType: string, name: string): void {
        const etype = eType.toLowerCase();
        const id = `${etype}-${name}`;
        if (this._domMap.has(id)) {
            return;
        }
        const ele = document.createElement('i');
        ele.className = `pitem ${etype}`;
        ele.id = id;
        ele.style.cssText = `${STYLE.pitem}${STYLE[etype]}` ?? '';
        if (etype === 'page') {
            const content = document.createElement('div');
            content.style.cssText = STYLE.content;
            content.className = 'content';
            ele.appendChild(content);
        }
        this._wrapper.appendChild(ele);
        this._domMap.set(id, ele);
    }

    clear(): void {}

    drawCircle(id: string, x: number, y: number, radius = 6): void {
        const dom = this._domMap.get(id);
        dom?.style.setProperty('--x', `${x}`);
        dom?.style.setProperty('--y', `${y}`);
        dom?.style.setProperty('--r', `${radius}`);
    }

    drawPath(id: string, points: Point[] = []): void {
        if (!points.length) {
            return;
        }
        const path = points.map((p: Point) => `${p.x},${p.y}`);
        const dom = this._domMap.get(id);
        dom?.style.setProperty('--clip-path', `path('M ${path.join(' L ')} Z')`);
    }

    drawClip(
        id: string,
        content: HTMLElement | undefined,
        origin: Point,
        w: number,
        h: number,
        rotation: number,
        points: Point[] = []
    ): void {
        const path = points.map((p: Point) => `${p.x},${p.y}`);
        const dom = this._domMap.get(id);
        dom?.style.setProperty('--clip-path', `path('M ${path.join(' L ')} Z')`);
        const cc = dom?.children.item(0) as HTMLElement;
        cc?.replaceChildren(content as Node);
        cc?.style.setProperty(
            '--transform',
            `translate(${origin.x}px, ${origin.y}px) rotate(${rotation}rad)`
        );
    }

    draw(entity: Point | Circle | Line | Area | Page, content?: HTMLElement): void {
        this.addElement(entity.constructor.name, entity.id);
        switch (entity.constructor.name) {
            case 'Point': {
                const point = entity as Point;
                const id = `${entity.constructor.name.toLowerCase()}-${point.id}`;
                this.drawCircle(id, point.x, point.y);
                break;
            }
            case 'Area':
            case 'Book': {
                const area = entity as Area;
                const id = `${entity.constructor.name.toLowerCase()}-${area.id}`;
                this.drawPath(id, area.points);
                area.points.forEach((point) => this.draw(point));
                break;
            }
            case 'Page': {
                const page = entity as Page;
                const id = `${entity.constructor.name.toLowerCase()}-${page.id}`;
                this.drawClip(
                    id,
                    content!,
                    page.origin,
                    page.w,
                    page.h,
                    page.rotation,
                    page.clip.points
                );
                break;
            }
            default:
                break;
        }
    }

    get dom() {
        return this._wrapper;
    }
}

export default DomPainter;
