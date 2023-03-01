import Line from './line';

class Shadow {
    readonly id: string = 'shadow';
    private _lineMap: Map<string, Line> = new Map();

    constructor(id: string) {
        this.id = id;
    }

    add(line: Line | Line[]) {
        if (Array.isArray(line)) {
            line.forEach((item) => this.add(item));
        } else {
            this._lineMap.set(line.id, line);
        }
        return this;
    }

    remove(id: string) {
        if (this._lineMap.has(id)) {
            this._lineMap.delete(id);
        }
        return this;
    }

    getItem(id: string): Line | undefined {
        return this._lineMap.get(id);
    }

    toArray(): Line[] {
        return [...this._lineMap].map(([key, value]) => value);
    }
}

export default Shadow;
