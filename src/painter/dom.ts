import Point from '../core/point';
import Line from '../core/line';
import Circle from '../core/circle';
import Area from '../core/area';
import Page from '../core/page';
import Shadow from '../core/shadow';
import { Align, Offset } from '../type';
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

    constructor(w: number, h: number, ph: number, pv: number, align: Align) {
        super();
        this._wrapper = document.createElement('div');
        this._wrapper.className = `painter ${align}`;
        updateProperties(this._wrapper, {
            '--w': w,
            '--h': h,
            '--ph': ph,
            '--pv': pv,
            // '--clip': `inset(-1000% ${ph}px)`,
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
            const wrapper = document.createElement('div');
            wrapper.className = 'wrapper';
            const content = document.createElement('div');
            content.className = 'content';
            wrapper.appendChild(content);
            ele.appendChild(wrapper);
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
        // for (const [key, dom] of this._domMap) {
        //     dom.remove();
        // }
        // this._domMap.clear();
    }

    drawLine(line: Line): void {
        const dom = this.getElement(line);
        const [a, b] = line.points as [Point, Point];
        const rotation = Math.atan2(b.y - a.y, b.x - a.x);
        updateProperties(dom, {
            '--len': a.dist(b),
            '--transform': `translate3d(${a.x}px, ${a.y}px, 0) rotate(${rotation}rad)`,
        });
    }

    drawCircle(entity: Point | Circle): void {
        const dom = this.getElement(entity);
        const [x, y] = entity.val;
        const radius = entity.r;
        if (entity.id.match(/back-clip/)) {
            dom!.textContent = entity.id;
        }
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
        const clip = entity?.clip?.points ?? [];
        const path = clip.map((p: Point) => `${p.x},${p.y}`);
        updateProperties(dom, {
            '--clip-path': `path('M ${path.join(' L ')} Z')`,
        });
        entity.toArray().forEach((line) => {
            this.drawLine(line);
        });
    }

    drawPage(entity: Page, content: HTMLElement | undefined): void {
        const { origin, offset, w, h, rotation, clip } = entity;
        const path = clip.points.map((p: Point) => `${p.x},${p.y}`);
        const dom = this.getElement(entity);
        dom?.classList.toggle(
            'side-a',
            offset === Offset.NEXT || offset === Offset.PREV_3 || offset === Offset.PREV
        );
        dom?.classList.toggle(
            'side-b',
            offset === Offset.PREV_2 || offset === Offset.NEXT_2 || offset === Offset.CURR
        );
        const wrapper = dom?.querySelector('.wrapper') as HTMLElement;
        updateProperties(wrapper, {
            '--clip-path': `path('M ${path.join(' L ')} Z')`,
            '--rotation': `${rotation}rad`,
            '--transform': `translate3d(${origin.x}px, ${origin.y}px, 0) rotate(${rotation}rad)`,
        });
        const cc = dom?.querySelector('.content') as HTMLElement;
        if (!cc.contains(content as Node)) {
            cc?.replaceChildren(content ?? '');
        }
        // update shadow percentage
        if (entity.id === 'front') {
            const percent = entity.clip.getRectArea() / entity.area;
            updateProperties(this.dom, {
                '--percent': percent,
            });
        }
    }

    draw(
        entity: Point | Circle | Line | Area | Page | Shadow,
        content?: HTMLElement
    ): void {
        this.addElement(entity);
        switch (entity.constructor.name) {
            case 'Point':
            case 'Circle':
            case 'Mouse': {
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
