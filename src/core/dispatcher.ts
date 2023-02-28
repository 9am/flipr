export interface Callback { (...args: any[]): void }
export type Event = {
    name: string,
    data: unknown,
}

class Dispatcher {
    private _map: Record<string, Callback[]> = {};

    addListener(name: string, cb: Callback): Callback {
        this._map[name] = this._map[name] || [];
        this._map[name].push(cb);
        return () => {
            this._map[name] = this._map[name].filter(item => item !== cb);
        };
    }

    dispatch(event: Event): void {
        this._map[event.name] && this._map[event.name].forEach(cb => cb(event));
    }

    destory(): void {
        this._map = {};
    }
}

export default Dispatcher;
