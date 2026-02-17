from rembg import remove
from PIL import Image

# Load your image
input_path = r"D:\Background Remove\pexels-andrea-piacquadio-712513.jpg"  # Use raw string
output_path = r"D:\Background Remove\no_background(5).png"

input_image = Image.open(input_path)

# Remove background
output_image = remove(input_image)

# Save result with transparent background
output_image.save(output_path)