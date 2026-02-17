import requests

url = "http://localhost:8000/remove-bg"
files = {'file': ('test_portrait.png', open('C:/Users/Yasavanth/.gemini/antigravity/brain/b3bd8943-569e-48c5-a782-208364f187ae/test_portrait_1769419915410.png', 'rb'), 'image/png')}

try:
    response = requests.post(url, files=files)
    if response.status_code == 200:
        with open('C:/Users/Yasavanth/.gemini/antigravity/brain/b3bd8943-569e-48c5-a782-208364f187ae/test_result.png', 'wb') as f:
            f.write(response.content)
        print("Success! Processed image saved as test_result.png")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Exception: {e}")
