import asyncio
import websockets
import sys


async def listen(job_id):
    uri = f"ws://localhost:8000/ws/jobs/{job_id}/"

    print(f"Connecting to {uri}...")

    try:
        async with websockets.connect(uri) as websocket:
            print("Connected! Waiting for live updates...\n")

            while True:
                message = await websocket.recv()
                print(f"🚀 LIVE UPDATE: {message}")

    except websockets.ConnectionClosed as e:
        print(f"WebSocket closed: code={e.code}, reason={e.reason}")
    except Exception as e:
        print(f"WebSocket error: {type(e).__name__}: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ws.py <JOB_UUID>")
    else:
        asyncio.run(listen(sys.argv[1]))
