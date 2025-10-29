// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./store.db');

db.serialize(() => {
    console.log("Membuat tabel...");
    // 1. Tabel Produk (termasuk stock)
    db.run(`CREATE TABLE IF NOT EXISTS Produk (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_produk TEXT NOT NULL,
        harga INTEGER NOT NULL,
        stock INTEGER NOT NULL
    )`);

    // 2. Tabel Pembelian
    db.run(`CREATE TABLE IF NOT EXISTS Pembelian (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produk_id INTEGER,
        jumlah INTEGER NOT NULL,
        total_harga INTEGER NOT NULL,
        tanggal_pembelian DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL,
        FOREIGN KEY (produk_id) REFERENCES Produk(id)
    )`);

    console.log("Tabel berhasil dibuat.");

    // Mengisi 10 produk awal (jalankan sekali saja)
    const products = [
        { nama: "Buku Tulis", harga: 5000, stock: 100 },
        { nama: "Pensil 2B", harga: 2000, stock: 150 },
        { nama: "Penghapus", harga: 1000, stock: 200 },
        { nama: "Penggaris 30cm", harga: 3000, stock: 80 },
        { nama: "Spidol Hitam", harga: 8000, stock: 50 },
        { nama: "Kertas HVS A4", harga: 45000, stock: 30 },
        { nama: "Stapler", harga: 15000, stock: 40 },
        { nama: "Isi Stapler", harga: 4000, stock: 100 },
        { nama: "Map Plastik", harga: 2500, stock: 120 },
        { nama: "Cutter", harga: 10000, stock: 60 }
    ];

    const stmt = db.prepare("INSERT INTO Produk (nama_produk, harga, stock) VALUES (?, ?, ?)");
    
    // Cek dulu apakah produk sudah ada
    db.get("SELECT COUNT(*) as count FROM Produk", (err, row) => {
        if (row.count === 0) {
            console.log("Memasukkan data produk awal...");
            for (const p of products) {
                stmt.run(p.nama, p.harga, p.stock);
            }
            stmt.finalize();
            console.log("10 produk berhasil ditambahkan.");
        } else {
            console.log("Data produk sudah ada.");
        }
    });
});

db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Setup database selesai. Koneksi ditutup.');
});