interface EventMapper {
    [type: string]: (ev: any) => void;
}

export class SocketInstance {
    socket: WebSocket;
    eventMapper: EventMapper;
    constructor(socket: WebSocket) {
        this.socket = socket;

        // adding default behaviour
        this.eventMapper = {
            open: () => {},
            close: () => {},
            error: () => {}
        };
        this.socket.onopen = () => {
            console.log("socket opened");
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

    on<T = SocketData>(type: string, callback: (ev: T) => void) {
        if (!this.eventMapper[type]) {
            this.eventMapper[type] = callback;
        }
        this.socket.onmessage = (event) => {
            console.log(event, this.eventMapper);
            let data: MessageEvent<T>;
            try {
                data = JSON.parse(event.data);
                const cb = this.eventMapper[data.type];
                cb(data.data);
            } catch (e) {
                console.log("system error: cannot parse server response");
            }
        };
    }
}
