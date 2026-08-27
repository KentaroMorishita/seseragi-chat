# seseragi-chat

Minimal real-time chat demo written in Seseragi.

- no database
- one room
- WebSocket broadcast
- browser UI with Signal-driven updates

## Local development

Run the WebSocket server:

```sh
cd server
seseragi run .
```

In another terminal, run the browser app:

```sh
cd client
seseragi dev --open
```

The browser client connects to `ws://127.0.0.1:41290/chat`.

> The Vercel deployment contains the browser build only. The WebSocket process server is intentionally kept as a separate deployable because it requires a long-lived WebSocket host.
