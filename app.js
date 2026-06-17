// =========================================================================
// 1. DEKLARASI SELEKTOR ELEMENT DOM HTML
// =========================================================================
const themeToggle = document.getElementById('themeToggle');
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput'); 
const documentPreview = document.getElementById('documentPreview');
const watermarkStyle = document.getElementById('watermarkStyle');
const watermarkText = document.getElementById('watermarkText');
const opacitySlider = document.getElementById('opacitySlider');
const opacityVal = document.getElementById('opacityVal');
const rotationSlider = document.getElementById('rotationSlider');
const rotationVal = document.getElementById('rotationVal');
const fontSizeInput = document.getElementById('fontSizeInput');
const fontDecrease = document.getElementById('fontDecrease');
const fontIncrease = document.getElementById('fontIncrease');
const colorDots = document.querySelectorAll('.color-dot');
const customColorBtn = document.getElementById('customColorBtn');
const hiddenColorInput = document.getElementById('hiddenColorInput'); 
const btnTemplates = document.querySelectorAll('.btn-template');
const btnSave = document.getElementById('btnSave');
const btnReset = document.getElementById('btnReset');
const zoomSlider = document.getElementById('zoomSlider');
const zoomLabel = document.getElementById('zoomLabel');

// Variabel Data Internal State Aplikasi
let gambarAsliObj = null;
let warnaRGB = '255, 0, 0'; // Default warna merah (format string untuk canvas)
let namaFileAsli = 'dokumen_watermark';

// State Kontrol Zoom & Penyeretan Dokumen (Pan-Drag)
let tingkatZoom = 100;
let currentX = 0;
let currentY = 0;
let startX = 0;
let startY = 0;
let isDragging = false;

// =========================================================================
// 2. MANAGEMENT TEMA VISUAL (DARK & LIGHT MODE)
// =========================================================================
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// =========================================================================
// 3. LOGIKA INTERAKSI UNGGAH DOKUMEN (CLICK / DRAG & DROP)
// =========================================================================
uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) eksekusiProsesFile(e.target.files[0]);
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--primary-color)';
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = 'var(--upload-border)';
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--upload-border)';
    if (e.dataTransfer.files.length > 0) eksekusiProsesFile(e.dataTransfer.files[0]);
});

// =========================================================================
// 4. MEMPROSES FILE UNTUK DI-RENDER KE CANVAS 2D
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
                // Reset State Posisi & Zoom Dokumen Menjadi Awal Semula
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
        documentPreview.innerHTML = `<p style="color: var(--text-main); font-size: 0.9rem; text-align:center;">📄 File PDF dimuat: <strong>${file.name}</strong>.<br><span style="color: var(--text-muted); font-size: 0.8rem;">(Fitur render multi-halaman PDF otomatis aktif pada tahap rilis berikutnya).</span></p>`;
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
// 5. SISTEM ENGINE ZOOM & KURSOR HAND DRAG-TO-PAN
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
        currentX = 0;
        currentY = 0;
    }
    canvas.style.transform = `translate(${currentX}px, ${currentY}px) scale(${tingkatZoom / 100})`;
}

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
// 6. CORE ENGINE RENDER WATERMARK CANVAS
// =========================================================================
function gambarUlangSistemWatermark() {
    const canvas = document.getElementById('papanWatermark');
    if (!canvas || !gambarAsliObj) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Gambar ulang dokumen asli dasar
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
// 7. EVENT LISTENER KONTROL INPUT & REALTIME BADGES
// =========================================================================
watermarkText.addEventListener('input', gambarUlangSistemWatermark);
watermarkStyle.addEventListener('change', gambarUlangSistemWatermark);

opacitySlider.addEventListener('input', (e) => {
    opacityVal.innerText = `${e.target.value}%`;
    gambarUlangSistemWatermark();
});

rotationSlider.addEventListener('input', (e) => {
    rotationVal.innerText = `${e.target.value}°`;
    gambarUlangSistemWatermark();
});

// Kontrol Logika Tombol Font Stepper (- & +)
fontIncrease.addEventListener('click', () => {
    let ukuranSkrg = parseInt(fontSizeInput.value);
    if (ukuranSkrg < 200) {
        fontSizeInput.value = ukuranSkrg + 4; // Kelipatan naik 4px biar cepat
        gambarUlangSistemWatermark();
    }
});

fontDecrease.addEventListener('click', () => {
    let ukuranSkrg = parseInt(fontSizeInput.value);
    if (ukuranSkrg > 10) {
        fontSizeInput.value = ukuranSkrg - 4; // Kelipatan turun 4px
        gambarUlangSistemWatermark();
    }
});

// Pilihan Warna Bulat Minimalis
colorDots.forEach((dot) => {
    dot.addEventListener('click', () => {
        if (dot.id === 'customColorBtn') {
            hiddenColorInput.click();
            return;
        }
        
        colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        warnaRGB = dot.getAttribute('data-color');
        gambarUlangSistemWatermark();
    });
});

// Menangkap Input Custom Color Picker Browser
hiddenColorInput.addEventListener('input', (e) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    warnaRGB = `${r}, ${g}, ${b}`;
    
    colorDots.forEach(d => d.classList.remove('active'));
    customColorBtn.classList.add('active');
    customColorBtn.style.background = hex;
    
    gambarUlangSistemWatermark();
});

// =========================================================================
// 8. LOGIKA QUICK TEMPLATE TEKS
// =========================================================================
btnTemplates.forEach(btn => {
    btn.addEventListener('click', () => {
        const isiTombol = btn.innerText;

        if (isiTombol === '+ Tanggal') {
            const dateObj = new Date();
            const tgl = String(dateObj.getDate()).padStart(2, '0');
            const bln = String(dateObj.getMonth() + 1).padStart(2, '0');
            const thn = dateObj.getFullYear();
            watermarkText.value += ` ${tgl}-${bln}-${thn}`;
        } else {
            watermarkText.value = isiTombol;
        }
        gambarUlangSistemWatermark();
    });
});

// =========================================================================
// 9. EVENT TOMBOL RESET ULANG
// =========================================================================
btnReset.addEventListener('click', () => {
    watermarkText.value = 'DOKUMEN COPY';
    watermarkStyle.value = 'scattered';
    opacitySlider.value = 50;
    opacityVal.innerText = '50%';
    fontSizeInput.value = 32;
    rotationSlider.value = -30;
    rotationVal.innerText = '-30°';
    warnaRGB = '255, 0, 0';

    colorDots.forEach(d => d.classList.remove('active'));
    colorDots[0].classList.add('active');
    customColorBtn.style.background = 'linear-gradient(135deg, #ff0055, #00ffcc, #9900ff)';

    tingkatZoom = 100;
    currentX = 0;
    currentY = 0;
    zoomSlider.value = 100;
    
    gambarUlangSistemWatermark();
    terapkanTransformasiCanvas();
});

// =========================================================================
// 10. EKSPORT & SIMPAN BERKAS KE PENYIMPANAN LOKAL
// =========================================================================
btnSave.addEventListener('click', () => {
    const canvas = document.getElementById('papanWatermark');
    if (!canvas || !gambarAsliObj) {
        alert('Maaf, unggah dokumen gambar terlebih dahulu sebelum disimpan!');
        return;
    }

    const waktu = new Date();
    const thn = waktu.getFullYear();
    const bln = String(waktu.getMonth() + 1).padStart(2, '0');
    const tgl = String(waktu.getDate()).padStart(2, '0');
    const jam = String(waktu.getHours()).padStart(2, '0');
    const mnt = String(waktu.getMinutes()).padStart(2, '0');
    
    const timestamp = `${thn}${bln}${tgl}_${jam}${mnt}`;
    const namaUnduhan = `${timestamp}_${namaFileAsli}.png`;

    const triggerLink = document.createElement('a');
    triggerLink.download = namaUnduhan;
    triggerLink.href = canvas.toDataURL('image/png');
    
    document.body.appendChild(triggerLink);
    triggerLink.click();
    document.body.removeChild(triggerLink);
});
