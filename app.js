// ==========================================
// 1. MENGAMBIL ELEMEN-ELEMEN HTML (DOM)
// ==========================================
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const documentPreview = document.getElementById('documentPreview');

// ==========================================
// 2. LOGIKA KLIK UNTUK MEMILIH FILE
// ==========================================

// Jika area upload diklik, otomatis memicu input file yang tersembunyi
uploadZone.addEventListener('click', () => {
    fileInput.click();
});

// Ketika user sudah memilih file dari komputer/HP mereka
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    prosesFileYangDipilih(file);
});

// ==========================================
// 3. LOGIKA DRAG & DROP (SERET DAN LEPAS FILE)
// ==========================================

// Efek visual saat file melayang di atas area upload (bikin highlight)
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#2e7d32';
    uploadZone.style.backgroundColor = '#f0fdf4';
});

// Efek visual kembali normal jika file batal dilepas
uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '#b4c6d8';
    uploadZone.style.backgroundColor = '#f8fafc';
});

// Ketika file dilepas di area upload
uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#b4c6d8';
    uploadZone.style.backgroundColor = '#f8fafc';

    const file = e.dataTransfer.files[0];
    prosesFileYangDipilih(file);
});

// ==========================================
// 4. FUNGSI UNTUK MEMPROSES & MENAMPILKAN FILE
// ==========================================
function prosesFileYangDipilih(file) {
    if (!file) return;

    // Bersihkan isi kotak preview lama
    documentPreview.innerHTML = '';

    // Cek apakah yang dimasukkan adalah file Gambar (PNG/JPG)
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        // Saat file selesai dibaca oleh sistem browser
        reader.onload = function(event) {
            // Buat elemen gambar baru secara gaib di memori
            const img = document.createElement('img');
            img.src = event.target.result;
            
            // Atur gaya agar gambar pas secara otomatis (Auto Fit) di kotak preview
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '4px';
            img.id = 'uploadedImage'; // Beri tanda ID untuk nanti kita beri watermark

            // Masukkan gambar tersebut ke dalam kotak pratinjau di layar
            documentPreview.appendChild(img);
        };

        // Mulai membaca file gambar
        reader.readAsDataURL(file);

    } else if (file.type === 'application/pdf') {
        // Penanganan untuk file PDF (akan kita pasang alat bantunya di langkah selanjutnya)
        documentPreview.innerHTML = `<p style="color: #2c3e50;">📄 File PDF berhasil dimuat: <strong>${file.name}</strong>.<br><span style="font-size: 0.85rem; color: #7f8c8d;">(Logika render pratinjau PDF akan diaktifkan di tahap berikutnya).</span></p>`;
    } else {
        // Jika user memasukkan file selain gambar/pdf (misal .docx atau .xlsx)
        documentPreview.innerHTML = '<p style="color: #e74c3c;">❌ Format file tidak didukung! Sila gunakan PNG, JPG, atau PDF.</p>';
    }
}
