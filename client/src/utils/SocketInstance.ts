// Work later
type SocketType = "add" | "remove" | "edit";

class SocketInstance {
    socket: WebSocket;
    constructor(socket: WebSocket) {
        this.socket = socket;
    }

    send(type: SocketType, data: unknown) {
        this.socket.send(
            JSON.stringify({
                type,
                data
            })
        );
    }
}
