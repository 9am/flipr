import Point from './core/point';
import Page, { Align, Direction } from './core/page';
import CanvasPainter from './painter/canvas';

interface Options {
    w: number,
    h: number,
    align: Align,
}

class Flipr {
    private painter: CanvasPainter;
    root: HTMLElement;
    options: Options;
    mouse: Point;
    pages: Page[] = [];
    content: CanvasImageSource[];
    isDrag = false;

    constructor(options: Options) {
        this.options = options;
        this.root = document.body;
        this.onDown = this.onDown.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);
        this.onUpdate = this.onUpdate.bind(this);

        const { w, h } = this.options;
        const [hw, hh] = [w / 2, h / 2];
        this.painter = new CanvasPainter(w, h);
        const content = document.getElementById('content') || document.createElement('div');
        this.content = Array.from(content.children).map(node => node as CanvasImageSource);

        this.initListener();

        const [pv, ph] = [60, 60];
        const tSize = 100;

        this.mouse = new Point(0, 0, 'mouse');
        this.pages = [
            new Page(
                [
                    new Point(0 + ph, 0 + pv),
                    new Point(hw,     0 + pv),
                    new Point(hw,     h - pv),
                    new Point(0 + ph, h - pv),
                ],
                Direction['-'],
                tSize,
            ),
            new Page(
                [
                    new Point(hw,     0 + pv),
                    new Point(w - ph, 0 + pv),
                    new Point(w - ph, h - pv),
                    new Point(hw,     h - pv),
                ],
                Direction['+'],
                tSize,
            ),
            // new Page(
            //     [
            //         new Point(0 + ph, 0 + pv),
            //         new Point(w - ph, 0 + pv),
            //         new Point(w - ph, hh),
            //         new Point(0 + ph, hh),
            //     ],
            //     Direction['-'],
            //     tSize,
            //     Align.VERTICAL,
            // ),
            // new Page(
            //     [
            //         new Point(0 + ph, hh),
            //         new Point(w - ph, hh),
            //         new Point(w - ph, h - pv),
            //         new Point(0 + ph, h - pv),
            //     ],
            //     Direction['+'],
            //     tSize,
            //     Align.VERTICAL,
            // ),
        ];
    }

    render(): void {
        this.painter.clear();
        this.pages.forEach(page => {
            this.painter.draw(page);
            page.tArea.forEach(area => this.painter.draw(area));
            this.painter.draw(page.clip0);
            this.painter.draw(page.clip1);
        });
    }

    // listener
    initListener(): void {
        this.dom.addEventListener('mousedown', this.onDown);
        this.dom.addEventListener('mousemove', this.onMove);
    }
    onMove(event: MouseEvent): void {
        this.mouse.val = [event.offsetX, event.offsetY];
        this.pages.forEach(page => {
            if (page.test(this.mouse)) {
                page.update(this.mouse);
                this.render();
            }
        });
    }
    onUpdate(event: MouseEvent): void {
        const { x, y } = this.dom.getClientRects()[0];
        this.mouse.val = [event.clientX - x, event.clientY - y];
        this.pages.forEach(page => page.update(this.mouse));
        this.render();
    }
    onDown(): void {
        console.log('down');
        this.dom.removeEventListener('mousemove', this.onMove);
        this.root.addEventListener('mousemove', this.onUpdate);
        this.root.addEventListener('mouseup', this.onEnd);
        this.root.addEventListener('mouseleave', this.onEnd);
    }
    onEnd(): void {
        console.log('out');
        this.dom.addEventListener('mousemove', this.onMove);
        this.root.removeEventListener('mousemove', this.onUpdate);
        this.root.removeEventListener('mouseup', this.onEnd);
        this.root.removeEventListener('mouseleave', this.onEnd);
        this.painter.clear();
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
