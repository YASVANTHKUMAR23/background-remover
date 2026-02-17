// Backend API URL (Empty for relative paths in unified server)
const API_URL = '';
console.log('MagicBG Local initialized. API_URL:', API_URL);

// Check backend status on load
async function checkStatus() {
    const dot = document.getElementById('status-dot');
    try {
        const response = await fetch(`${API_URL}/`);
        if (response.status === 200 || response.status === 404) {
            // Even a 404 from the root means the server is reachable
            dot.classList.add('online');
        }
    } catch (e) {
        console.log('Backend is offline or waking up...');
    }
}

checkStatus();
const originalPreview = document.getElementById('original-preview');
const processedPreview = document.getElementById('processed-preview');
const loadingOverlay = document.getElementById('loading-overlay');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const resultContainer = document.getElementById('result-container');

let processedBlobUrl = null;

// Drag and drop event listeners
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('active');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('active');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('active');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

async function handleFile(file) {
    console.log('File selected:', file.name, file.size, file.type);
    // Show previews and loading state
    dropZone.style.display = 'none';
    resultContainer.style.display = 'block';
    loadingOverlay.style.display = 'flex';

    // Set original preview
    const reader = new FileReader();
    reader.onload = (e) => originalPreview.src = e.target.result;
    reader.readAsDataURL(file);

    // Prepare for backend request
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_URL}/remove-bg`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to process image');

        const blob = await response.blob();
        processedBlobUrl = URL.createObjectURL(blob);
        processedPreview.src = processedBlobUrl;

    } catch (error) {
        console.error(error);
        alert('An error occurred while processing the image.');
        resetUI();
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

downloadBtn.addEventListener('click', () => {
    if (!processedBlobUrl) return;
    const a = document.createElement('a');
    a.href = processedBlobUrl;
    a.download = 'magic-bg-removed.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

resetBtn.addEventListener('click', resetUI);

function resetUI() {
    dropZone.style.display = 'block';
    resultContainer.style.display = 'none';
    fileInput.value = '';
    originalPreview.src = '';
    processedPreview.src = '';
    if (processedBlobUrl) {
        URL.revokeObjectURL(processedBlobUrl);
        processedBlobUrl = null;
    }
}
