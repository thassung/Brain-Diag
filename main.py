from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import nibabel as nib
import aiofiles

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="./")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), message: str = None):
    file_content = await file.read()

    nii_image = nib.Nifti1Image.from_bytes(file_content)
    
    image_data = nii_image.get_fdata()
    
    image_shape = image_data.shape

    print(image_shape)
    
    response_data = {message: "pass"}
    
    return JSONResponse(content=response_data)