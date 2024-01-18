type SocketCallback<Data> = (ev: Data) => void;

interface EventMapper<DataType> {
    [roomId: string]: {
        [type: string]: SocketCallback<DataType>;
    };
}

interface Options {
    defaultEvents: {
        open: (ev: Event) => void;
        close: (ev: Event) => void;
    };
}
const defaultOptions: Options = {
    defaultEvents: {
        open: () => {},
        close: () => {}
    }
};

export class SocketInstance<SocketDataType> {
    socket: WebSocket;
    eventMapper: EventMapper<any>;
    readonly GLOBAL = "global";
    roomId: string = this.GLOBAL;

    constructor(socket: WebSocket, options: Options = defaultOptions) {
        this.socket = socket;

        // adding default behaviour
        this.eventMapper = {
            // default room
            [this.GLOBAL]: {
                _: () => {}
            }
        };
        this.on<Event>("open", options.defaultEvents.open);
        this.on<Event>("close", options.defaultEvents.close);

        this.socket.onopen = (ev) => {
            this.eventMapper[this.GLOBAL].open(ev);
        };

        this.socket.onclose = (ev) => {
            this.eventMapper[this.GLOBAL].close(ev);
        };
    }

    send(type: string, data: unknown) {
        this.socket.send(
            JSON.stringify({
                type,
                data
            })
        );
    }

    /**
     * Add Event Listner to current room. if room not set, event will registered to GLOBAL room
     * @param type event name
     * @param callback function will be fired when receive event
     * @example
     * ```typescript
     *  socket.on("boo", (data) => { console.log(data.msg) })
     *  // This function is generic. default type of event callback
     *  is type passed to SocketWrapper.
     *  socket.on<{foo: string, bar: number}>("boo", (data) => {
     *    console.log(data.foo, data.bar + 1)
     *  })
     * ```
     */
    on<T = SocketDataType>(type: string, callback: SocketCallback<T>) {
        if (!this.eventMapper[this.roomId][type]) {
            // setting new event into current room
            this.eventMapper[this.roomId][type] = callback;
        }

        this.socket.onmessage = (event) => {
            console.log({ event, eventMapper: this.eventMapper, room: this.roomId });

            let data: MessageEvent<T>;
            try {
                data = JSON.parse(event.data);
                const cb = this.eventMapper[this.roomId][data.type];
                cb ? cb(data.data) : () => {};
            } catch (e) {
                console.log("system error: cannot parse server response");
            }
        };

        return this;
    }
}
