// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;
const db = new sqlite3.Database('./store.db');

// Setup Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// ==================
//      ROUTES
// ==================

/**
 * Rute Utama (GET /)
 * Menampilkan halaman admin utama dengan 3 bagian:
 * 1. Form Input Pembelian
 * 2. Daftar Produk & Stock
 * 3. Riwayat Pembelian
 */
app.get('/', (req, res) => {
    // Ambil semua data secara paralel
    const queryProduk = "SELECT * FROM Produk ORDER BY nama_produk ASC";
    const queryPembelian = `
        SELECT p.nama_produk, b.id, b.jumlah, b.total_harga, b.status, 
               STRFTIME('%Y-%m-%d %H:%M', b.tanggal_pembelian) as tanggal
        FROM Pembelian b
        JOIN Produk p ON b.produk_id = p.id
        ORDER BY b.tanggal_pembelian DESC
        LIMIT 20
    `;

    db.all(queryProduk, [], (err, products) => {
        if (err) throw err;
        db.all(queryPembelian, [], (err, purchases) => {
            if (err) throw err;
            res.render('index', { 
                products: products, 
                purchases: purchases,
                error: null 
            });
        });
    });
});

/**
 * Rute Input Pembelian (POST /beli)
 * Memproses form input pembelian baru.
 */
app.post('/beli', (req, res) => {
    const { produk_id, jumlah } = req.body;
    const jumlahBeli = parseInt(jumlah);

    db.get("SELECT * FROM Produk WHERE id = ?", [produk_id], (err, product) => {
        if (err) throw err;

        // 1. Validasi: Cek apakah produk ada
        if (!product) {
            return res.redirect('/'); // Seharusnya ada pesan error, tapi kita sederhanakan
        }

        // 2. Validasi: Cek stock
        if (product.stock < jumlahBeli) {
            // Jika stok tidak cukup, render ulang halaman dengan pesan error
            const queryProduk = "SELECT * FROM Produk ORDER BY nama_produk ASC";
            const queryPembelian = `
                SELECT p.nama_produk, b.id, b.jumlah, b.total_harga, b.status,
                       STRFTIME('%Y-%m-%d %H:%M', b.tanggal_pembelian) as tanggal
                FROM Pembelian b JOIN Produk p ON b.produk_id = p.id
                ORDER BY b.tanggal_pembelian DESC LIMIT 20
            `;
            db.all(queryProduk, [], (err, products) => {
                db.all(queryPembelian, [], (err, purchases) => {
                    res.render('index', {
                        products: products,
                        purchases: purchases,
                        error: `Stock ${product.nama_produk} tidak mencukupi (sisa ${product.stock})`
                    });
                });
            });
            return;
        }

        // 3. Proses Transaksi (Database Transaction)
        const total_harga = product.harga * jumlahBeli;
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            try {
                // Kurangi stock
                db.run(
                    "UPDATE Produk SET stock = stock - ? WHERE id = ?", 
                    [jumlahBeli, produk_id]
                );
                
                // Masukkan ke tabel pembelian
                db.run(
                    "INSERT INTO Pembelian (produk_id, jumlah, total_harga, status) VALUES (?, ?, ?, ?)",
                    [produk_id, jumlahBeli, total_harga, 'Berhasil']
                );
                
                db.run("COMMIT");
                res.redirect('/');
            } catch (e) {
                db.run("ROLLBACK");
                console.error("Transaksi gagal:", e);
                res.redirect('/'); // Tampilkan error jika perlu
            }
        });
    });
});

/**
 * Rute Cancel Pembelian (POST /cancel/:id)
 * Membatalkan pembelian dan mengembalikan stock.
 */
app.post('/cancel/:id', (req, res) => {
    const pembelian_id = req.params.id;

    // 1. Ambil data pembelian yang mau dibatalkan
    db.get("SELECT * FROM Pembelian WHERE id = ? AND status = 'Berhasil'", [pembelian_id], (err, purchase) => {
        if (err) throw err;

        // 2. Jika pembelian tidak ada atau sudah dibatalkan
        if (!purchase) {
            return res.redirect('/');
        }

        // 3. Proses Transaksi (Kembalikan stock & ubah status)
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            try {
                // Ubah status pembelian
                db.run(
                    "UPDATE Pembelian SET status = 'Dibatalkan' WHERE id = ?", 
                    [pembelian_id]
                );

                // Kembalikan stock ke produk
                db.run(
                    "UPDATE Produk SET stock = stock + ? WHERE id = ?",
                    [purchase.jumlah, purchase.produk_id]
                );
                
                db.run("COMMIT");
                res.redirect('/');
            } catch (e) {
                db.run("ROLLBACK");
                console.error("Transaksi pembatalan gagal:", e);
                res.redirect('/');
            }
        });
    });
});

// Jalankan Server
app.listen(port, () => {
    console.log(`Server admin toko berjalan di http://localhost:${port}`);
});