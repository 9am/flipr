import Point from '../core/point';
import Mouse from '../core/mouse';
import Circle from '../core/circle';
import Line from '../core/line';
import Area from '../core/area';
import Page from '../core/page';
import Shadow from '../core/shadow';
import List from '../core/list';
import { Align, Offset } from '../type';
import Painter, { BASE_CLASS_NAME } from './base';
import CSS from '../index.module.css';

const updateProperties = (
    dom: HTMLElement | undefined,
    properties: Record<string, string | number>
) => {
    for (const [key, value] of Object.entries(properties)) {
        dom?.style.setProperty(key, `${value}`, 'important');
    }
};

class DomPainter extends Painter {
    private _wrapper: HTMLElement;
    private _domMap: Map<string, HTMLElement> = new Map();

    constructor(w: number, h: number, ph: number, pv: number, align: Align) {
        super();
        this._wrapper = document.createElement('div');
        this._wrapper.className = `${BASE_CLASS_NAME} ${CSS[align]}`;
        updateProperties(this._wrapper, {
            '--w': w,
            '--h': h,
            '--ph': ph,
            '--pv': pv,
            // '--clip': `inset(-1000% ${ph}px)`,
        });
    }

    addElement(entity: any, wrapper: HTMLElement = this.dom): void {
        const name = entity.name;
        const id = `${name}-${entity.id}`;
        if (this._domMap.has(id)) {
            return;
        }
        const ele = document.createElement('i');
        ele.className = `${CSS.item} ${CSS[name]}`;
        ele.id = id;
        if (name === Page.NAME) {
            ele.classList.add(CSS[id]!);
            const wrapper = document.createElement('div');
            wrapper.className = CSS.wrapper!;
            const content = document.createElement('div');
            content.className = CSS.content!;
            wrapper.appendChild(content);
            ele.appendChild(wrapper);
        }
        if (name === Shadow.NAME) {
            ele.classList.add(CSS[id]!);
            entity.toArray().forEach((line: Line) => this.addElement(line, ele));
        }
        wrapper.appendChild(ele);
        this._domMap.set(id, ele);
    }

    getElement(entity: any): HTMLElement | undefined {
        const id = `${entity.name}-${entity.id}`;
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

    drawList(entity: List) {
        const dom = this.dom;
        const { before, after } = entity;
        updateProperties(dom, {
            '--p-before': before,
            '--p-after': after,
        });
    }

    drawPage(entity: Page, content: HTMLElement | undefined): void {
        const { origin, offset, w, h, rotation, clip } = entity;
        const path = clip.points.map((p: Point) => `${p.x},${p.y}`);
        const dom = this.getElement(entity);
        dom?.classList.toggle(
            CSS.sideA!,
            offset === Offset.NEXT || offset === Offset.PREV_3 || offset === Offset.PREV
        );
        dom?.classList.toggle(
            CSS.sideB!,
            offset === Offset.PREV_2 || offset === Offset.NEXT_2 || offset === Offset.CURR
        );
        const wrapper = dom?.firstElementChild as HTMLElement;
        updateProperties(wrapper, {
            '--clip-path': `path('M ${path.join(' L ')} Z')`,
            '--rotation': `${rotation}rad`,
            '--transform': `translate3d(${origin.x}px, ${origin.y}px, 0) rotate(${rotation}rad)`,
        });
        const cc = wrapper?.firstElementChild as HTMLElement;
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
        entity: Point | Circle | Mouse | Line | Area | Page | Shadow | List,
        content?: HTMLElement
    ): void {
        this.addElement(entity);
        switch (entity.name) {
            case Point.NAME:
            case Circle.NAME:
            case Mouse.NAME: {
                this.drawCircle(entity as Circle | Point);
                break;
            }
            case Line.NAME: {
                this.drawLine(entity as Line);
                break;
            }
            case Area.NAME: {
                const area = entity as Area;
                this.drawPath(area);
                area.points.forEach((point) => this.draw(point));
                break;
            }
            case Shadow.NAME: {
                this.drawShadow(entity as Shadow);
                break;
            }
            case List.NAME: {
                this.drawList(entity as List);
                break;
            }
            case Page.NAME: {
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
