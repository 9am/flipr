import Point from '../core/point';
import Line from '../core/line';
import Area from '../core/area';

class CanvasPainter {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _w: number;
    private _h: number;

    constructor(w: number, h: number) {
        this._w = w;
        this._h = h;
        this._canvas = document.createElement('canvas');
        this._canvas.width = w;
        this._canvas.height = h;
        this._canvas.className = 'flipr';
        this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    clear(): void {
        this._ctx.clearRect(0, 0, this._w, this._h);
    }

    drawClip(points: Point[] = [], img: CanvasImageSource, point: Point): void {
        this._ctx.save();
        this.drawPath(points);
        this._ctx.clip();
        this._ctx.drawImage(img, 0, 0, 400, 600, point.x, point.y, 400, 600);
        this._ctx.restore();
    }

    drawPath(points: Point[] = []): void {
        if (!points.length) {
            return;
        }
        const path = [...points];
        this._ctx.beginPath();
        const start = path.shift();
        this._ctx.moveTo(start!.x, start!.y);
        path.forEach(point => {
            this._ctx.lineTo(point!.x, point!.y);
        });
        this._ctx.closePath();
        this._ctx.stroke();
        this._ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        this._ctx.fill();
    }

    drawLine(points: Point[]): void {
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

    drawText(text:string, x: number, y: number): void {
        this._ctx.fillStyle = 'black';
        this._ctx.fillText(text, x, y);
    }

    draw(entity: Point | Line | Area): void {
        if (entity instanceof Point) {
            const point = entity as Point;
            this.drawCircle(point.x, point.y);
            this.drawText(point.id, point.x + 10, point.y - 10);
        } else if (entity instanceof Line) {
            const line = entity as Line;
            this.drawLine(line.points);
            line.points.forEach(point => this.draw(point));
        } else if (entity instanceof Area) {
            const area = entity as Area;
            this.drawPath(area.points);
            area.points.forEach(point => this.draw(point));
        }
    }

    get dom(): HTMLElement {
        return this._canvas;
    }
}

export default CanvasPainter;
