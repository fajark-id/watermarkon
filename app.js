// =========================================================================
// 1. DEKLARASI SELEKTOR DOM ELEMEN HTML
// =========================================================================
const themeToggle = document.getElementById('themeToggle');
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput'); 
const documentPreview = document.getElementById('documentPreview');
const watermarkStyle = document.getElementById('watermarkStyle');
const watermarkText = document.getElementById('watermarkText');
const opacitySlider = document.getElementById('opacitySlider');
const fontSizeInput = document.getElementById('fontSizeInput');
const rotationSlider = document.getElementById('rotationSlider');
const colorCircles = document.querySelectorAll('.color-circle');
const hiddenColorInput = document.getElementById('hiddenColorInput'); 
const btnTemplates = document.querySelectorAll('.btn-template');
const btnSave = document.getElementById('btnSave');
const btnReset = document.getElementById('btnReset');

// Selektor Zoom Minimalis Baru
const zoomSlider = document.getElementById('zoomSlider');
const zoomLabel = document.getElementById('zoomLabel');

// Variabel Penyimpanan Data Internal Aplikasi
let gambarAsliObj = null;
let warnaRGB = '255, 0, 0';
let namaFileAsli = 'dokumen_watermark';

// State Kontrol Zoom & Panning (Geser Layar)
let tingkatZoom = 100; // Dalam persen (100% - 300%)
let currentX = 0;
let currentY = 0;
let startX = 0;
let startY = 0;
let isDragging = false;

// =========================================================================
// 2. SISTEM MANAGEMENT TEMA (DARK / LIGHT MODE)
// =========================================================================
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.contains('dark-mode') ? setModeVisual(false) : setModeVisual(true);
});

function setModeVisual(pilihGelap) {
    if (pilihGelap) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// =========================================================================
// 3. LOGIKA INTERAKSI UNGGAH DOKUMEN (DRAG-DROP & KLIK)
// =========================================================================
uploadZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        eksekusiProsesFile(e.target.files[0]);
    }
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--primary-color)';
    uploadZone.style.backgroundColor = 'rgba(22, 163, 74, 0.05)';
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = 'var(--upload-border)';
    uploadZone.style.backgroundColor = 'var(--upload-bg)';
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--upload-border)';
    uploadZone.style.backgroundColor = 'var(--upload-bg)';
    if (e.dataTransfer.files.length > 0) {
        eksekusiProsesFile(e.dataTransfer.files[0]);
    }
});

// =========================================================================
// 4. MEMPROSES FILE DAN MERENDER KE CANVAS
// =========================================================================
function eksekusiProsesFile(file) {
    if (!file) return;
    documentPreview.innerHTML = '';
    namaFileAsli = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            gambarAsliObj = new Image();
            gambarAsliObj.onload = function() {
                // Reset Zoom & Posisi Koordinat Seret Setiap Ganti Dokumen Baru
                tingkatZoom = 100;
                currentX = 0;
                currentY = 0;
                zoomSlider.value = 100;
                terapkanTransformasiCanvas();
                inisialisasiPapanCanvas();
            };
            gambarAsliObj.src = event.target.result;
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        documentPreview.innerHTML = `<p style="color: var(--text-main); font-size: 0.9rem; text-align:center;">📄 File PDF dimuat: <strong>${file.name}</strong>.<br><span style="color: var(--text-muted); font-size: 0.8rem;">(Fitur render PDF otomatis akan aktif pada tahap pengembangan selanjutnya).</span></p>`;
    } else {
        documentPreview.innerHTML = '<p style="color: #ef4444; font-weight: bold;">❌ Format berkas tidak didukung!</p>';
    }
}

function inisialisasiPapanCanvas() {
    if (!gambarAsliObj) return;
    documentPreview.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.id = 'papanWatermark';
    canvas.width = gambarAsliObj.width;
    canvas.height = gambarAsliObj.height;

    documentPreview.appendChild(canvas);
    gambarUlangSistemWatermark();
    terapkanTransformasiCanvas();
}

// =========================================================================
// 5. SISTEM DRAG-TO-PAN (CLICK & DRAG KURSOR HAND) & ZOOM
// =========================================================================
zoomSlider.addEventListener('input', (e) => {
    tingkatZoom = parseInt(e.target.value);
    terapkanTransformasiCanvas();
});

function terapkanTransformasiCanvas() {
    const canvas = document.getElementById('papanWatermark');
    if (!canvas) return;

    zoomLabel.innerText = `${tingkatZoom}%`;

    if (tingkatZoom > 100) {
        documentPreview.classList.add('can-pan');
    } else {
        documentPreview.classList.remove('can-pan');
        // Kunci balik posisi ke tengah jika kembali ke 100%
        currentX = 0;
        currentY = 0;
    }
    canvas.style.transform = `translate(${currentX}px, ${currentY}px) scale(${tingkatZoom / 100})`;
}

// Event dragging penyeretan dokumen menggunakan kursor mouse
documentPreview.addEventListener('mousedown', (e) => {
    if (tingkatZoom <= 100) return;
    isDragging = true;
    documentPreview.classList.add('is-panning');
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    terapkanTransformasiCanvas();
});

window.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        documentPreview.classList.remove('is-panning');
    }
});

// =========================================================================
// 6. ENGINE WATERMARK CANVAS
// =========================================================================
function gambarUlangSistemWatermark() {
    const canvas = document.getElementById('papanWatermark');
    if (!canvas || !gambarAsliObj) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(gambarAsliObj, 0, 0);

    const teks = watermarkText.value;
    const ukuranFont = parseInt(fontSizeInput.value) || 32;
    const transparansi = opacitySlider.value / 100;
    const kemiringanRad = (rotationSlider.value * Math.PI) / 180;

    ctx.font = `bold ${ukuranFont}px Arial, sans-serif`;
    ctx.fillStyle = `rgba(${warnaRGB}, ${transparansi})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const pola = watermarkStyle.value;

    if (pola === 'center') {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(kemiringanRad);
        ctx.fillText(teks, 0, 0);
        ctx.restore();

    } else if (pola === 'scattered') {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(kemiringanRad);

        const lebarTeks = ctx.measureText(teks).width;
        const jarakX = lebarTeks + (ukuranFont * 3);
        const jarakY = ukuranFont * 5;
        const radiusBatas = Math.max(canvas.width, canvas.height) * 2;

        for (let x = -radiusBatas; x <= radiusBatas; x += jarakX) {
            for (let y = -radiusBatas; y <= radiusBatas; y += jarakY) {
                let barisGanjil = Math.abs(Math.round(y / jarakY)) % 2 === 1;
                let geserX = barisGanjil ? (jarakX / 2) : 0;
                ctx.fillText(teks, x + geserX, y);
            }
        }
        ctx.restore();

    } else if (pola === 'footer') {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height - (ukuranFont * 2));
        ctx.rotate(kemiringanRad);
        ctx.fillText(teks, 0, 0);
        ctx.restore();
    }
}

// =========================================================================
// 7. EVENT LISTENER KONTROL & WARNA
// =========================================================================
watermarkText.addEventListener('input', gambarUlangSistemWatermark);
watermarkStyle.addEventListener('change', gambarUlangSistemWatermark);
opacitySlider.addEventListener('input', gambarUlangSistemWatermark);
fontSizeInput.addEventListener('input', gambarUlangSistemWatermark);
rotationSlider.addEventListener('input', gambarUlangSystemsWatermark);

function gambarUlangSystemsWatermark() {
    gambarUlangSistemWatermark();
}

colorCircles.forEach((circle) => {
    circle.addEventListener('click', () => {
        if (circle.id === 'customColorBtn') {
            hiddenColorInput.click();
            return;
        }
        
        colorCircles.forEach(c => c.classList.remove('active'));
        circle.classList.add('active');
        warnaRGB = circle.getAttribute('data-color');
        gambarUlangSistemWatermark();
    });
});

hiddenColorInput.addEventListener('input', (e) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    warnaRGB = `${r}, ${g}, ${b}`;
    
    colorCircles.forEach(c => c.classList.remove('active'));
    document.getElementById('customColorBtn').classList.add('active');
    document.getElementById('customColorBtn').style.backgroundColor = hex;
    
    gambarUlangSistemWatermark();
});

// =========================================================================
// 8. QUICK TEMPLATE TEKS
// =========================================================================
btnTemplates.forEach(btn => {
    btn.addEventListener('click', () => {
        const kontenTombol = btn.innerText;

        if (kontenTombol === '+ Tanggal') {
            const hariIni = new Date();
            const tgl = String(hariIni.getDate()).padStart(2, '0');
            const bln = String(hariIni.getMonth() + 1).padStart(2, '0');
            const thn = hariIni.getFullYear();
            watermarkText.value += ` ${tgl}-${bln}-${thn}`;
        } else {
            watermarkText.value = kontenTombol;
        }
        gambarUlangSistemWatermark();
    });
});

// =========================================================================
// 9. TOMBOL RESET AWAL
// =========================================================================
btnReset.addEventListener('click', () => {
    watermarkText.value = 'DOKUMEN COPY';
    watermarkStyle.value = 'center';
    opacitySlider.value = 50;
    fontSizeInput.value = 32;
    rotationSlider.value = -30;
    warnaRGB = '255, 0, 0';

    colorCircles.forEach(c => c.classList.remove('active'));
    colorCircles[0].classList.add('active');
    document.getElementById('customColorBtn').style.backgroundColor = 'var(--bg-main)';

    tingkatZoom = 100;
    currentX = 0;
    currentY = 0;
    zoomSlider.value = 100;
    
    gambarUlangSistemWatermark();
    terapkanTransformasiCanvas();
});

// =========================================================================
// 10. EXPORT & SIMPAN BERKAS (AUTONAME TIMESTAMP)
// =========================================================================
btnSave.addEventListener('click', () => {
    const canvas = document.getElementById('papanWatermark');
    if (!canvas || !gambarAsliObj) {
        alert('Silakan pilih dokumen terlebih dahulu sebelum disimpan!');
        return;
    }

    const waktuSkrg = new Date();
    const thn = waktuSkrg.getFullYear();
    const bln = String(waktuSkrg.getMonth() + 1).padStart(2, '0');
    const tgl = String(waktuSkrg.getDate()).padStart(2, '0');
    const jam = String(waktuSkrg.getHours()).padStart(2, '0');
    const mnt = String(waktuSkrg.getMinutes()).padStart(2, '0');
    
    const formatWaktu = `${thn}${bln}${tgl}_${jam}${mnt}`;
    const namaUnduhanBaru = `${formatWaktu}_${namaFileAsli}.png`;

    const linkDownload = document.createElement('a');
    linkDownload.download = namaUnduhanBaru;
    linkDownload.href = canvas.toDataURL('image/png');
    
    document.body.appendChild(linkDownload);
    linkDownload.click();
    document.body.removeChild(linkDownload);
});
