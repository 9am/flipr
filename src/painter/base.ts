import Point from '../core/point';
import Line from '../core/line';
import Circle from '../core/circle';
import Mouse from '../core/mouse';
import Area from '../core/area';
import Page from '../core/page';
import Shadow from '../core/shadow';

export default abstract class Painter {
    abstract clear(): void;
    abstract draw(
        entity: Point | Circle | Mouse | Line | Area | Page | Shadow,
        content?: CanvasImageSource | HTMLElement
    ): void;
    abstract get dom(): HTMLElement;
}
