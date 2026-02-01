import asyncio
import websockets
import json
import sys

async def test_websocket():
    uri = "ws://localhost:8000/ws/senate"
    mission = sys.argv[1] if len(sys.argv) > 1 else "Write a python script to hello world"
    
    print(f"Connecting to {uri} with mission: '{mission}'")
    try:
        async with websockets.connect(uri) as websocket:
            await websocket.send(json.dumps({"mission": mission}))
            
            while True:
                response = await websocket.recv()
                data = json.loads(response)
                print(f"\nRECEIVED EVENT: {data.get('event', 'STATUS')}")
                # Pretty print payloads
                if 'final_state' in data:
                    print("--- FINAL VERDICT ---")
                    print(f"Status: {data['final_state']['status']}")
                    if data['final_state']['artifact']:
                        print(f"Code:\n{data['final_state']['artifact']['code']}")
                    break
                elif 'error' in data:
                    print(f"ERROR: {data['error']}")
                    break
                else:
                    print(json.dumps(data, indent=2))
                    
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(test_websocket())
    except ImportError:
        print("Please install websockets: pip install websockets")
