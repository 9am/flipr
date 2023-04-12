import Point from '../core/point';
import Circle from '../core/circle';
import Mouse from '../core/mouse';
import Line from '../core/line';
import Area from '../core/area';
import Page from '../core/page';
import Shadow from '../core/shadow';
import List from '../core/list';
import Painter, { BASE_CLASS_NAME } from './base';

class CanvasPainter extends Painter {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _w: number;
    private _h: number;

    constructor(w: number, h: number) {
        super();
        const dpr = window.devicePixelRatio;
        this._w = w;
        this._h = h;
        this._canvas = document.createElement('canvas');
        this._canvas.width = w * dpr;
        this._canvas.height = h * dpr;
        this._canvas.style.width = `${w}px`;
        this._canvas.style.height = `${h}px`;
        this._canvas.className = BASE_CLASS_NAME;
        this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
        this._ctx.scale(dpr, dpr);
    }

    clear(): void {
        this._ctx.clearRect(0, 0, this._w, this._h);
    }

    drawClip(
        content: CanvasImageSource | undefined,
        origin: Point,
        w: number,
        h: number,
        rotation: number,
        points: Point[] = []
    ): void {
        this._ctx.save();
        this.drawPath(points);
        this._ctx.clip();
        this._ctx.translate(origin.x, origin.y);
        this._ctx.rotate(rotation);
        // this._ctx.drawImage(content, 0, 0, content.width as number, content.height as number, 0, 0, w, h);
        content && this._ctx.drawImage(content, 0, 0, 400, 300, 0, 0, w, h);
        // this._ctx.setTransform(1, 0, 0, 1, 0, 0);
        this._ctx.restore();
    }

    drawPath(points: Point[] = [], fill = 'rgba(255, 0, 0, 0.2)'): void {
        if (!points.length) {
            return;
        }
        const path = [...points];
        this._ctx.beginPath();
        const start = path.shift();
        this._ctx.moveTo(start!.x, start!.y);
        path.forEach((point) => {
            this._ctx.lineTo(point!.x, point!.y);
        });
        this._ctx.closePath();
        this._ctx.stroke();
        this._ctx.fillStyle = fill;
        this._ctx.fill();
    }

    drawLine(points: [Point, Point]): void {
        const [a, b] = points;
        this._ctx.moveTo(a.x, a.y);
        this._ctx.lineTo(b.x, b.y);
        this._ctx.stroke();
    }

    drawCircle(x: number, y: number, radius = 4): void {
        this._ctx.beginPath();
        this._ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this._ctx.stroke();
    }

    drawText(text: string, x: number, y: number): void {
        this._ctx.fillStyle = 'black';
        this._ctx.fillText(text, x, y);
    }

    draw(
        entity: Point | Circle | Mouse | Line | Area | Page | Shadow | List,
        content?: CanvasImageSource
    ): void {
        switch (entity.name) {
            case Point.NAME:
                const point = entity as Point;
                this.drawCircle(point.x, point.y);
                this.drawText(point.id, point.x + 10, point.y - 10);
                break;
            case Circle.NAME:
                const circle = entity as Circle;
                this.drawCircle(circle.x, circle.y, circle.r);
                this.drawText(circle.id, circle.x + 10, circle.y - 10);
                break;
            case Line.NAME:
                const line = entity as Line;
                this.drawLine(line.points as [Point, Point]);
                line.points.forEach((point) => this.draw(point));
                break;
            case Area.NAME:
                const area = entity as Area;
                this.drawPath(area.points);
                area.points.forEach((point) => this.draw(point));
                break;
            case Page.NAME:
                const page = entity as Page;
                this.drawClip(
                    content!,
                    page.origin,
                    page.w,
                    page.h,
                    page.rotation,
                    page.clip.points
                );
                // this.drawPath(page.clip.points);
                // page.clip.points.forEach(point => this.draw(point));
                break;
            default:
                break;
        }
    }

    get dom(): HTMLElement {
        return this._canvas;
    }
}

export default CanvasPainter;
