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

// Variabel global untuk menyimpan data gambar yang sedang dibuka
let gambarAsliObj = null; 

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
                // Setelah gambar sukses dimuat di memori, buat papan gambar (Canvas)
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

    documentPreview.innerHTML = ''; // Bersihkan tulisan panduan lama

    const canvas = document.createElement('canvas');
    canvas.id = 'papanWatermark';
    
    // Samakan ukuran papan dengan ukuran asli dokumen/foto agar kualitas tidak pecah
    canvas.width = gambarAsliObj.width;
    canvas.height = gambarAsliObj.height;

    // Atur gaya tampilan di layar agar pas secara otomatis (Auto Fit)
    canvas.style.maxWidth = '100%';
    canvas.style.maxHeight = '100%';
    canvas.style.objectFit = 'contain';

    documentPreview.appendChild(canvas);

    // Jalankan fungsi cetak teks watermark pertama kali
    gambarUlangWatermark();
}

// ==========================================
// 5. FUNGSI UTAMA: MENGGAMBAR WATERMARK (REAL-TIME)
// ==========================================
function gambarUlangWatermark() {
    const canvas = document.getElementById('papanWatermark');
    if (!canvas || !gambarAsliObj) return;

    const ctx = canvas.getContext('2d');

    // Langkah A: Bersihkan papan dan gambar ulang foto asli sebagai latar belakang
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(gambarAsliObj, 0, 0);

    // Langkah B: Ambil nilai-nilai dari tombol setingan di panel kanan
    const teks = watermarkText.value;
    const ukuranFont = parseInt(fontSizeInput.value) || 32;
    const transparansi = opacitySlider.value / 100; // Ubah skala 10-100 jadi 0.1 - 1.0
    const kemiringan = (rotationSlider.value * Math.PI) / 180; // Ubah derajat ke rumus sudut matematika

    // Langkah C: Atur gaya tulisan watermark
    ctx.font = `bold ${ukuranFont}px Arial, sans-serif`;
    ctx.fillStyle = `rgba(255, 0, 0, ${transparansi})`; // Sementara warna merah bawaan default dulu
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Langkah D: Cetak sesuai Pola/Style Penempatan
    const pola = watermarkStyle.value;

    if (pola === 'center') {
        // --- CABANG 1: TEKS DI TENGAH ---
        ctx.save();
        // Pindahkan titik pusat gambar ke tengah-tengah papan
        ctx.translate(canvas.width / 2, canvas.height / 2);
        // Putar papan sesuai slider kemiringan
        ctx.rotate(kemiringan);
        // Cetak teks tepat di titik tengah (0,0)
        ctx.fillText(teks, 0, 0);
        ctx.restore();
    } else {
        // Catatan: Untuk Cabang 2 (Tersebar) dan Cabang 3 (Footer) akan aktif setelah ini
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(kemiringan);
        ctx.fillText(teks + " (Pola Belum Aktif)", 0, 0);
        ctx.restore();
    }
}

// ==========================================
// 6. MENGHUBUNGKAN TOMBOL SETINGAN AGAR RESPONSIV
// ==========================================

// Setiap kali teks diketik, slider digeser, atau ukuran font diganti, langsung gambar ulang!
watermarkText.addEventListener('input', gambarUlangWatermark);
opacitySlider.addEventListener('input', gambarUlangWatermark);
fontSizeInput.addEventListener('input', gambarUlangWatermark);
rotationSlider.addEventListener('input', gambarUlangWatermark);
watermarkStyle.addEventListener('change', gambarUlangWatermark);
