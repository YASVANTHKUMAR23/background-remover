from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from rembg import remove
import os

# Set custom home for rembg models (required for Vercel/Serverless)
os.environ["U2NET_HOME"] = "/tmp"

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for simplicity in single-server setup, or restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/remove-bg")
async def remove_background(file: UploadFile = File(...)):
    print(f"Received upload request: {file.filename} ({file.content_type})")
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded is not an image")
    
    try:
        # Read the uploaded image
        input_data = await file.read()
        
        # Process the image with rembg
        output_data = remove(input_data) 
        
        # Return the processed image as a PNG response
        return Response(content=output_data, media_type="image/png")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Robust frontend path detection
current_dir = os.path.dirname(os.path.abspath(__file__))
# Check both ./frontend and ../frontend
frontend_options = [
    os.path.join(current_dir, "frontend"),
    os.path.join(os.path.dirname(current_dir), "frontend"),
    os.path.join(os.getcwd(), "frontend")
]

frontend_path = None
for path in frontend_options:
    if os.path.exists(path):
        frontend_path = path
        break

if frontend_path:
    print(f"Serving frontend from: {frontend_path}")
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
else:
    print("Warning: Frontend directory not found!")

if __name__ == "__main__":
    # The port is provided via the PORT environment variable or defaults to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
