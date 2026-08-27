const url = process.argv[2]

if (!url) {
  throw new Error("usage: bun scripts/websocket-smoke.ts <wss-url>")
}

const protocol = "seseragi.chat.v1"
const timeoutMs = 15_000

function connect(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, protocol)
    const timeout = setTimeout(() => {
      socket.close()
      reject(new Error(`WebSocket connect timed out: ${url}`))
    }, timeoutMs)

    socket.addEventListener(
      "open",
      () => {
        clearTimeout(timeout)
        resolve(socket)
      },
      { once: true },
    )

    socket.addEventListener(
      "error",
      () => {
        clearTimeout(timeout)
        reject(new Error(`WebSocket connect failed: ${url}`))
      },
      { once: true },
    )
  })
}

function waitFor(socket: WebSocket, expected: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for broadcast: ${expected}`))
    }, timeoutMs)

    const onMessage = (event: MessageEvent) => {
      if (String(event.data) !== expected) return
      clearTimeout(timeout)
      socket.removeEventListener("message", onMessage)
      resolve()
    }

    socket.addEventListener("message", onMessage)
  })
}

const first = await connect()
const second = await connect()
const payload = `seseragi-chat-smoke-${Date.now()}`

try {
  const firstReceived = waitFor(first, payload)
  const secondReceived = waitFor(second, payload)
  first.send(payload)
  await Promise.all([firstReceived, secondReceived])
  console.log(`WebSocket broadcast smoke passed: ${url}`)
} finally {
  first.close(1000, "smoke complete")
  second.close(1000, "smoke complete")
}
