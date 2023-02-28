import Point from '../core/point';
import Line from '../core/line';
import Circle from '../core/circle';
import Area from '../core/area';
import Page from '../core/page';

export default abstract class Painter {
    abstract clear(): void;
    abstract draw(
        entity: Point | Circle | Line | Area | Page,
        content?: CanvasImageSource | HTMLElement
    ): void;
    abstract get dom(): HTMLElement;
}
