function uploadFiles() {
    const input = document.getElementById('file-input');
    const files = input.files;
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Files uploaded successfully');
        listFiles();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error uploading files');
    });
}

function listFiles(filter = 'all') {
    fetch('http://localhost:3000/files')
        .then(response => response.json())
        .then(data => {
            const fileList = document.getElementById('file-list');
            fileList.innerHTML = '';

            if (data.length === 0) {
                fileList.innerHTML = '<p class="no-files">No files found</p>';
                return;
            }

            // Update sidebar active state
            document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
            document.querySelector(`.sidebar li[onclick="filterFiles('${filter}')"]`).classList.add('active');

            // Filter files based on type
            const filteredFiles = filter === 'all' ? data : data.filter(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                if (filter === 'documents') {
                    return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'].includes(ext);
                } else if (filter === 'images') {
                    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
                } else if (filter === 'pdfs') {
                    return ext === 'pdf';
                }
                return true;
            });

            if (filteredFiles.length === 0) {
                fileList.innerHTML = '<p class="no-files">No files found in this category</p>';
                return;
            }

            filteredFiles.forEach(file => {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'file-item';

                const ext = file.name.split('.').pop().toLowerCase();
                let icon = '📄'; // Default document icon

                if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
                    icon = '📷';
                } else if (ext === 'pdf') {
                    icon = '📚';
                } else if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
                    icon = '📝';
                } else if (['xls', 'xlsx'].includes(ext)) {
                    icon = '📊';
                } else if (['ppt', 'pptx'].includes(ext)) {
                    icon = '.slides';
                }

                fileDiv.innerHTML = `
<div class="file-content">
    <span class="file-icon">${icon}</span>
    <span class="file-name">${file.name}</span>
    <span class="file-size">${formatFileSize(file.size)}</span>
    <button class="download-btn" onclick="downloadFile('${file.name}')">Download</button>
</div>
                `;
                fileList.appendChild(fileDiv);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('file-list').innerHTML = '<p class="error">Error loading files</p>';
        });
}

function downloadFile(filename) {
    window.location.href = `http://localhost:3000/download?file=${encodeURIComponent(filename)}`;
}

function filterFiles(type) {
    listFiles(type);
}

// Format file size to human readable format
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initialize file list on page load
window.onload = () => {
    listFiles();
};
