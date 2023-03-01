import Point from '../core/point';
import Line from '../core/line';
import Circle from '../core/circle';
import Area from '../core/area';
import Page from '../core/page';
import Shadow from '../core/shadow';
import Painter from './base';

const updateProperties = (
    dom: HTMLElement | undefined,
    properties: Record<string, string | number>
) => {
    for (const [key, value] of Object.entries(properties)) {
        dom?.style.setProperty(key, `${value}`);
    }
};

class DomPainter extends Painter {
    private _wrapper: HTMLElement;
    private _domMap: Map<string, HTMLElement> = new Map();

    constructor(w: number, h: number, ph: number, pv: number) {
        super();
        this._wrapper = document.createElement('div');
        this._wrapper.className = 'painter';
        updateProperties(this._wrapper, {
            '--w': w,
            '--h': h,
            '--ph': ph,
            '--pv': pv,
        });
    }

    addElement(entity: any, wrapper: HTMLElement = this.dom): void {
        const etype = entity.constructor.name.toLowerCase();
        const id = `${etype}-${entity.id}`;
        if (this._domMap.has(id)) {
            return;
        }
        const ele = document.createElement('i');
        ele.className = `pitem ${etype}`;
        ele.id = id;
        if (etype === 'page') {
            const content = document.createElement('div');
            content.className = 'content';
            ele.appendChild(content);
        }
        if (etype === 'shadow') {
            entity.toArray().forEach((line: Line) => this.addElement(line, ele));
        }
        wrapper.appendChild(ele);
        this._domMap.set(id, ele);
    }

    getElement(entity: any): HTMLElement | undefined {
        const etype = entity.constructor.name.toLowerCase();
        const id = `${etype}-${entity.id}`;
        return this._domMap.get(id);
    }

    clear(): void {
        for (const [key, dom] of this._domMap) {
            dom.remove();
        }
        this._domMap.clear();
    }

    drawLine(line: Line): void {
        const dom = this.getElement(line);
        const [a, b] = line.points as [Point, Point];
        const rotation = Math.atan2(b.y - a.y, b.x - a.x);
        updateProperties(dom, {
            '--len': a.dist(b),
            '--transform': `translate(${a.x}px, ${a.y}px) rotate(${rotation}rad)`,
        });
    }

    drawCircle(entity: Point | Circle): void {
        const dom = this.getElement(entity);
        const [x, y] = entity.val;
        const radius = entity.r ?? 2;
        updateProperties(dom, {
            '--x': x,
            '--y': y,
            '--r': radius,
        });
    }

    drawPath(entity: Area): void {
        if (!entity.points.length) {
            return;
        }
        const path = entity.points.map((p: Point) => `${p.x},${p.y}`);
        const dom = this.getElement(entity);
        updateProperties(dom, {
            '--clip-path': `path('M ${path.join(' L ')} Z')`,
        });
    }

    drawShadow(entity: Shadow) {
        const dom = this.getElement(entity);
        updateProperties(dom, {
            '--clip-path': `path("M 60,0 L 740,0 L 740,600 L 60,600 Z")`,
        });
        entity.toArray().forEach((line) => {
            this.drawLine(line);
        });
    }

    drawPage(entity: Page, content: HTMLElement | undefined): void {
        const origin = entity.origin;
        const w = entity.w;
        const h = entity.h;
        const rotation = entity.rotation;
        const clip = entity.clip.points;
        const path = clip.map((p: Point) => `${p.x},${p.y}`);
        const dom = this.getElement(entity);
        updateProperties(dom, {
            // visibility: content ? 'visible' : 'hidden',
            '--clip-path': `path('M ${path.join(' L ')} Z')`,
        });
        const cc = dom?.children.item(0) as HTMLElement;
        if (!cc?.isSameNode(content as Node)) {
            cc?.replaceChildren(content ?? '');
        }
        updateProperties(cc, {
            '--transform': `translate(${origin.x}px, ${origin.y}px) rotate(${rotation}rad)`,
        });
    }

    draw(
        entity: Point | Circle | Line | Area | Page | Shadow,
        content?: HTMLElement
    ): void {
        this.addElement(entity);
        switch (entity.constructor.name) {
            case 'Point':
            case 'Circle': {
                this.drawCircle(entity as Circle | Point);
                break;
            }
            case 'Line': {
                this.drawLine(entity as Line);
                break;
            }
            case 'Area': {
                const area = entity as Area;
                this.drawPath(area);
                area.points.forEach((point) => this.draw(point));
                break;
            }
            case 'Shadow': {
                this.drawShadow(entity as Shadow);
                break;
            }
            case 'Page': {
                const page = entity as Page;
                this.drawPage(page, content);
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
