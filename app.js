// =========================================================================
// 1. SELEKTOR ELEMENT DOM
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

// State Internal Aplikasi
let gambarAsliObj = null;
let warnaRGB = '255, 0, 0'; 
let namaFileAsli = 'dokumen_watermark';

// State Zoom & Drag Pan
let tingkatZoom = 100;
let currentX = 0;
let currentY = 0;
let startX = 0;
let startY = 0;
let isDragging = false;

// =========================================================================
// 2. MANAGEMENT TEMA (DARK / LIGHT MODE)
// =========================================================================
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// =========================================================================
// 3. LOGIKA UNGGAH DOKUMEN
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
// 4. PEMROSESAN FILE BERKAS
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
        documentPreview.innerHTML = `<p style="color: var(--text-main); font-size: 0.85rem; text-align:center;">📄 File PDF dimuat: <strong>${file.name}</strong>.<br><span style="color: var(--text-muted); font-size: 0.75rem;">(Render multi-halaman PDF otomatis aktif pada tahap berikutnya).</span></p>`;
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
// 5. SISTEM ENGINE ZOOM & KURSOR PAN DRAG
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
// 6. ENGINE RENDERING WATERMARK
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

    const pola = watermarkStyle.value;

    if (pola === 'center') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(kemiringanRad);
        ctx.fillText(teks, 0, 0);
        ctx.restore();
    } else if (pola === 'scattered') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
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
        // SPESIFIKASI CABANG 3: FOOTER STYLE
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        
        // Atur padding aman dari ujung kiri dan bawah canvas (proporsional)
        const paddingX = Math.max(20, canvas.width * 0.03);
        const paddingY = Math.max(20, canvas.height * 0.04);
        
        const lebarMaksimum = canvas.width - (paddingX * 2);
        const barisKata = teks.split(' ');
        let barisKalimatSekarang = '';
        const daftarBarisFix = [];
        const tinggiBaris = ukuranFont * 1.3;

        // Algoritma pembungkus teks otomatis (Word Wrapping)
        for (let n = 0; n < barisKata.length; n++) {
            let ujiBaris = barisKalimatSekarang + barisKata[n] + ' ';
            let ukuranUji = ctx.measureText(ujiBaris).width;
            if (ukuranUji > lebarMaksimum && n > 0) {
                daftarBarisFix.push(barisKalimatSekarang);
                barisKalimatSekarang = barisKata[n] + ' ';
            } else {
                barisKalimatSekarang = ujiBaris;
            }
        }
        daftarBarisFix.push(barisKalimatSekarang);

        // Hitung titik awal Y agar jika multi-baris naik ke atas secara rapi
        let titikAwalY = canvas.height - paddingY - ((daftarBarisFix.length - 1) * tinggiBaris);

        ctx.translate(paddingX, titikAwalY);
        ctx.rotate(kemiringanRad);

        // Gambar teks per baris hasil wrap
        for (let i = 0; i < daftarBarisFix.length; i++) {
            ctx.fillText(daftarBarisFix[i].trim(), 0, i * tinggiBaris);
        }
        ctx.restore();
    }
}

// =========================================================================
// 7. EVENT LISTENER KONTROL INPUT
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

fontIncrease.addEventListener('click', () => {
    let ukuranSkrg = parseInt(fontSizeInput.value);
    if (ukuranSkrg < 200) {
        fontSizeInput.value = ukuranSkrg + 2;
        gambarUlangSistemWatermark();
    }
});

fontDecrease.addEventListener('click', () => {
    let ukuranSkrg = parseInt(fontSizeInput.value);
    if (ukuranSkrg > 6) {
        fontSizeInput.value = ukuranSkrg - 2;
        gambarUlangSistemWatermark();
    }
});

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
// 8. QUICK TEMPLATES
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
        } else if (isiTombol === 'Template Footer') {
            const dateObj = new Date();
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            
            watermarkText.value = `Digunakan untuk [keperluan] kepada [pihak penerima] pada [${yyyy}${mm}${dd}]`;
            watermarkStyle.value = 'footer';
            
            opacitySlider.value = 75;
            opacityVal.innerText = '75%';
            fontSizeInput.value = 14; 
            rotationSlider.value = 0;
            rotationVal.innerText = '0°';
            
            colorDots.forEach(d => d.classList.remove('active'));
            colorDots[1].classList.add('active'); 
            warnaRGB = '0, 0, 0';
        } else {
            watermarkText.value = isiTombol;
        }
        gambarUlangSistemWatermark();
    });
});

// =========================================================================
// 9. EVENT RESET SYSTEM
// =========================================================================
btnReset.addEventListener('click', () => {
    watermarkText.value = 'DOKUMEN COPY';
    watermarkStyle.value = 'center'; 
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
// 10. EXPORT / DOWNLOAD FILE
// =========================================================================
btnSave.addEventListener('click', () => {
    const canvas = document.getElementById('papanWatermark');
    if (!canvas || !gambarAsliObj) {
        alert('Maaf, silakan masukkan dokumen terlebih dahulu.');
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
