from fastapi import FastAPI, Request, WebSocketException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()  # Load .env variables automatically

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*",
                   'http://localhost:8080'],
    allow_methods=["*"],
    allow_headers=["*"],
)

queue = []


import math

def distance(p1, p2):
    return math.sqrt((p2['x'] - p1['x'])**2 + (p2['y'] - p1['y'])**2 + (p2['z'] - p1['z'])**2)

def angle_between(p1, p2, p3):
    a = distance(p2, p1)
    b = distance(p2, p3)
    c = distance(p3, p1)

    if a * b == 0:
        return 0
    angle = math.acos((a**2 + b**2 - c**2) / (2 * a * b))
    return math.degrees(angle)

def analyze_throw(frames):
    """
    frames = list of pose points per frame
    """

    elbow_angles = []
    wrist_ys = []
    hip_drift_xs = []

    for points in frames:
        # Right side joints
        shoulder = points[12]
        elbow = points[14]
        wrist = points[16]
        hip_right = points[24]
        hip_left = points[23]

        # Calculate elbow angle
        elbow_angle = angle_between(shoulder, elbow, wrist)
        elbow_angles.append(elbow_angle)

        # Wrist vertical position
        wrist_ys.append(wrist['y'])

        # Hip horizontal drift
        hip_dx = abs(hip_right['x'] - hip_left['x'])
        hip_drift_xs.append(hip_dx)

    # Summarize data
    min_elbow_angle = min(elbow_angles)
    max_elbow_angle = max(elbow_angles)
    wrist_start_y = wrist_ys[0]
    wrist_end_y = wrist_ys[-1]
    wrist_delta_y = wrist_end_y - wrist_start_y
    max_hip_drift = max(hip_drift_xs)

    # Build text output
    text_output = f"""
Throw Analysis:

- Minimum elbow angle during throw: {min_elbow_angle:.2f} degrees (Expected: < 100 degrees for cocking phase)
- Maximum elbow angle during throw: {max_elbow_angle:.2f} degrees (Expected: > 150 degrees for full extension)
- Wrist vertical movement (end - start): {wrist_delta_y:.4f} units (Expected: negative value indicating wrist snap upward)
- Maximum hip drift (side to side): {max_hip_drift:.4f} units (Expected: < 0.2 units for stable core)

Use this data to determine if the throw technique matches good throwing mechanics. Pretend you are a coach and you are giving advice to someone keep it very short in your response on what they should improve for the next throw pretend to just know what the guy should improve on like you actually saw them throw 
"""
    return text_output.strip()




@app.post("/bball")
async def receive_bball(request: Request):
    data = await request.json()
    print("Received data:", data)
    return {"message": "Data received", "data": data}



@app.post("/baseball")
async def receive_baseball(request: Request):
    data = await request.json()
    print("Received data:")

    if 'points' not in data:
        return {"error": "Invalid payload: 'points' missing"}

    points_list = data['points']
    points = {i: pt for i, pt in enumerate(points_list)}  # turn list -> dict

    queue.append(points)

    if len(queue) >= 5:
        frames = queue.copy()
        queue.clear()
        txt = analyze_throw(frames)
        print(txt)
        client = genai.Client(api_key=os.getenv("GEMENI_API_KEY"))
        response = client.models.generate_content( 
            model="gemini-2.0-flash", 
            contents=[txt]
        )
        print(response.text)
        return {"Text": response.text}
    return {"message": "Data received"}


from datetime import datetime, timedelta

@app.websocket("/baseball")
async def websocket_baseball(websocket: WebSocket):
    await websocket.accept()
    last_sent_time = datetime.min  # set to a very old time initially

    try:
        while True:
            data = await websocket.receive_json()
            print("Received data via WebSocket. - ", len(queue))

            if isinstance(data, dict) and data.get('type') == 'clear':
                queue.clear()
                print("Queue cleared.")
                continue

            if 'points' not in data:
                await websocket.send_json({"error": "Invalid payload: 'points' missing"})
                continue

            points_list = data['points']
            points = {i: pt for i, pt in enumerate(points_list)}  # list -> dict
            queue.append(points)

            if len(queue) >= 30:
                frames = queue.copy()
                queue.clear()
                txt = analyze_throw(frames)
                print(txt)

                now = datetime.now()
                if now - last_sent_time >= timedelta(seconds=60):
                    client = genai.Client(api_key=os.getenv("GEMENI_API_KEY"))
                    response = client.models.generate_content(
                        model="gemini-2.0-flash",
                        contents=[txt]
                    )
                    print(response.text)

                    await websocket.send_json({"Text": response.text})
                    last_sent_time = now
                else:
                    print("Skipped sending because 60 seconds have not passed.")

    except WebSocketDisconnect:
        print("Client disconnected")
