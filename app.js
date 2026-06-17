// ==========================================
// 1. MENGAMBIL ELEMEN-ELEMEN HTML (DOM)
// ==========================================
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const documentPreview = document.getElementById('documentPreview');

// Elemen Kontrol Watermark
const watermarkText = document.getElementById('watermarkText');
const opacitySlider = document.getElementById('opacitySlider');
const fontSizeInput = document.getElementById('fontSizeInput');
const rotationSlider = document.getElementById('rotationSlider');
const watermarkStyle = document.getElementById('watermarkStyle');
const colorCircles = document.querySelectorAll('.color-circle');

// Tombol Aksi & Template
const btnTemplates = document.querySelectorAll('.btn-template');
const btnReset = document.getElementById('btnReset');

// Variabel Global
let gambarAsliObj = null; 
let warnaRGB = '255, 0, 0'; // Default: Merah

// Input warna tersembunyi untuk tombol 🎨
const hiddenColorInput = document.createElement('input');
hiddenColorInput.type = 'color';
hiddenColorInput.value = '#dc2626';

// ==========================================
// 2. LOGIKA AMBIL FILE (KLIK & DRAG-DROP)
// ==========================================
uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    prosesFileYangDipilih(e.target.files[0]);
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#16a34a';
    uploadZone.style.backgroundColor = '#f0fdf4';
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '#cbd5e1';
    uploadZone.style.backgroundColor = '#f8fafc';
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#cbd5e1';
    uploadZone.style.backgroundColor = '#f8fafc';
    prosesFileYangDipilih(e.dataTransfer.files[0]);
});

// ==========================================
// 3. FUNGSI MEMPROSES FILE GAMBAR
// ==========================================
function prosesFileYangDipilih(file) {
    if (!file) return;
    documentPreview.innerHTML = '';

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            gambarAsliObj = new Image();
            gambarAsliObj.onload = function() {
                buatPapanPratinjau();
            };
            gambarAsliObj.src = event.target.result;
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        documentPreview.innerHTML = `<p style="color: #0f172a;">📄 File PDF berhasil dimuat: <strong>${file.name}</strong>.<br><span style="font-size: 0.85rem; color: #64748b;">(Render PDF akan aktif di tahap berikutnya).</span></p>`;
    } else {
        documentPreview.innerHTML = '<p style="color: #dc2626;">❌ Format file tidak didukung!</p>';
    }
}

// ==========================================
// 4. FUNGSI MEMBUAT PAPAN GAMBAR (CANVAS)
// ==========================================
function buatPapanPratinjau() {
    if (!gambarAsliObj) return;
    documentPreview.innerHTML = ''; 

    const canvas = document.createElement('canvas');
    canvas.id = 'papanWatermark';
    
    canvas.width = gambarAsliObj.width;
    canvas.height = gambarAsliObj.height;

    canvas.style.maxWidth = '100%';
    canvas.style.maxHeight = '100%';
    canvas.style.objectFit = 'contain';

    documentPreview.appendChild(canvas);
    gambarUlangWatermark();
}

// ==========================================
// 5. FUNGSI UTAMA: MENGGAMBAR WATERMARK (REAL-TIME)
// ==========================================
function gambarUlangWatermark() {
    const canvas = document.getElementById('papanWatermark');
    if (!canvas || !gambarAsliObj) return;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(gambarAsliObj, 0, 0);

    const teks = watermarkText.value;
    const ukuranFont = parseInt(fontSizeInput.value) || 32;
    const transparansi = opacitySlider.value / 100; 
    const kemiringan = (rotationSlider.value * Math.PI) / 180; 

    ctx.font = `bold ${ukuranFont}px Arial, sans-serif`;
    ctx.fillStyle = `rgba(${warnaRGB}, ${transparansi})`; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const pola = watermarkStyle.value;

    if (pola === 'center') {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(kemiringan);
        ctx.fillText(teks, 0, 0);
        ctx.restore();
    } else {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(kemiringan);
        ctx.fillText(teks + " (Pola Belum Aktif)", 0, 0);
        ctx.restore();
    }
}

// ==========================================
// 6. MENGHUBUNGKAN EVENT KONTROL & WARNA
// ==========================================
watermarkText.addEventListener('input', gambarUlangWatermark);
opacitySlider.addEventListener('input', gambarUlangWatermark);
fontSizeInput.addEventListener('input', gambarUlangWatermark);
rotationSlider.addEventListener('input', gambarUlangWatermark);
watermarkStyle.addEventListener('change', gambarUlangWatermark);

colorCircles.forEach((circle, index) => {
    circle.addEventListener('click', () => {
        colorCircles.forEach(c => c.classList.remove('active'));
        circle.classList.add('active');

        if (index === 0) {
            warnaRGB = '255, 0, 0'; // Merah
            gambarUlangWatermark();
        } else if (index === 1) {
            warnaRGB = '0, 0, 0'; // Hitam
            gambarUlangWatermark();
        } else if (index === 2) {
            warnaRGB = '0, 0, 255'; // Biru
            gambarUlangWatermark();
        } else if (index === 3) {
            hiddenColorInput.click();
        }
    });
});

hiddenColorInput.addEventListener('input', (e) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    warnaRGB = `${r}, ${g}, ${b}`;
    gambarUlangWatermark();
});

// ==========================================
// 7. FITUR BARU: LOGIKA TOMBOL TEMPLATE TEKS
// ==========================================
btnTemplates.forEach(btn => {
    btn.addEventListener('click', () => {
        const isiTombol = btn.innerText;

        if (isiTombol === '+ Tanggal') {
            // Ambil tanggal hari ini secara otomatis (Format Indo: DD-MM-YYYY)
            const hariIni = new Date();
            const tgl = String(hariIni.getDate()).padStart(2, '0');
            const bln = String(hariIni.getMonth() + 1).padStart(2, '0');
            const thn = hariIni.getFullYear();
            
            // Tambahkan tanggal di ujung teks yang sudah ada
            watermarkText.value += ` ${tgl}-${bln}-${thn}`;
        } else {
            // Ganti total teks dengan template instant
            watermarkText.value = isiTombol;
        }

        // Gambar ulang agar teks baru langsung muncul di layar
        gambarUlangWatermark();
    });
});

// ==========================================
// 8. FITUR BARU: LOGIKA TOMBOL RESET (ULANGI)
// ==========================================
btnReset.addEventListener('click', () => {
    // Kembalikan semua nilai input ke standar awal
    watermarkText.value = 'DOKUMEN COPY';
    opacitySlider.value = 50;
    fontSizeInput.value = 32;
    rotationSlider.value = -30;
    watermarkStyle.value = 'center';
    warnaRGB = '255, 0, 0'; // Kembali ke merah

    // Reset tombol warna aktif ke lingkaran merah (index 0)
    colorCircles.forEach(c => c.classList.remove('active'));
    colorCircles[0].classList.add('active');

    // Gambar ulang kondisi bersih ini ke canvas
    gambarUlangWatermark();
});
