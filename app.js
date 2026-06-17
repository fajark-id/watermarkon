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

// Variabel Global
let gambarAsliObj = null; 
let warnaRGB = '255, 0, 0'; // Default: Merah (Format: R, G, B)

// Membuat input warna tersembunyi khusus untuk tombol kustom 🎨
const hiddenColorInput = document.createElement('input');
hiddenColorInput.type = 'color';
hiddenColorInput.value = '#2e7d32'; // Default warna kustom awal (Hijau)

// ==========================================
// 2. LOGIKA UTAMA AMBIL FILE (KLIK & DRAG-DROP)
// ==========================================
uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    prosesFileYangDipilih(e.target.files[0]);
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#2e7d32';
    uploadZone.style.backgroundColor = '#f0fdf4';
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '#b4c6d8';
    uploadZone.style.backgroundColor = '#f8fafc';
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#b4c6d8';
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
        documentPreview.innerHTML = `<p style="color: #2c3e50;">📄 File PDF berhasil dimuat: <strong>${file.name}</strong>.<br><span style="font-size: 0.85rem; color: #7f8c8d;">(Logika render PDF akan diaktifkan setelah fitur gambar beres).</span></p>`;
    } else {
        documentPreview.innerHTML = '<p style="color: #e74c3c;">❌ Format file tidak didukung!</p>';
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

    // Menggambar ulang dokumen asli di latar belakang
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(gambarAsliObj, 0, 0);

    // Mengambil nilai dari komponen kontrol
    const teks = watermarkText.value;
    const ukuranFont = parseInt(fontSizeInput.value) || 32;
    const transparansi = opacitySlider.value / 100; 
    const kemiringan = (rotationSlider.value * Math.PI) / 180; 

    // Atur gaya tulisan menggunakan variabel warnaRGB yang dinamis
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
        // Pola Cabang 2 & 3 akan kita integrasikan di langkah berikutnya
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(kemiringan);
        ctx.fillText(teks + " (Pola Belum Aktif)", 0, 0);
        ctx.restore();
    }
}

// ==========================================
// 6. MENGHUBUNGKAN TOMBOL SETINGAN & PALET WARNA
// ==========================================
watermarkText.addEventListener('input', gambarUlangWatermark);
opacitySlider.addEventListener('input', gambarUlangWatermark);
fontSizeInput.addEventListener('input', gambarUlangWatermark);
rotationSlider.addEventListener('input', gambarUlangWatermark);
watermarkStyle.addEventListener('change', gambarUlangWatermark);

// Logika Klik pada Bulatan Warna
colorCircles.forEach((circle, index) => {
    circle.addEventListener('click', () => {
        // Hilangkan efek lingkaran aktif dari semua tombol warna
        colorCircles.forEach(c => c.classList.remove('active'));
        // Berikan efek lingkaran aktif ke tombol yang diklik
        circle.classList.add('active');

        // Ganti nilai warna berdasarkan tombol yang dipilih
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
            // Jika memilih palet kustom 🎨, pancing input warna bawaan sistem keluar
            hiddenColorInput.click();
        }
    });
});

// Ketika user selesai memilih warna dari jendela kustom pop-up
hiddenColorInput.addEventListener('input', (e) => {
    const hex = e.target.value; // Hasil berbentuk Hex (#ff0000)
    
    // Konversi nilai Hex ke format RGB agar serasi dengan opacity canvas
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    warnaRGB = `${r}, ${g}, ${b}`;
    gambarUlangWatermark();
});
