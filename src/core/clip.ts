import Area from './area';
import Line from './line';
import Point from './point';

class Clip extends Area {
    // bl: Line;
    ml: Line;
    constructor(mouse: Point, points: Point[], id = '') {
        super(points, id);
        // this.bl = new Line([this.p0, mouse], '');
        this.ml = new Line([new Point(0, 0 ), new Point(0, 0)], '');
    }

    update(): void {
        // this.cross(this.bl);
        // console.log(this.bl.abc);
        // console.log(this.ml.abc);
        // this.ml.abc = this.bl.getMsAbc();
        // //console.log(this.ml.abc);
        // const [x1, x2] = this.cross(this.ml);
        // this.p1.val = x1.val;
        // this.p2.val = x2.val;
        // this.p1.log();
    }
}

export default Clip;
