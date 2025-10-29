# Admin Toko Sederhana (Node.js)

Ini adalah proyek admin page sederhana yang dibuat menggunakan Node.js, Express, dan EJS, dengan database SQLite. Aplikasi ini memungkinkan admin untuk mengelola stok dan mencatat transaksi pembelian.

## Fitur Utama

* **Input Pembelian:** Mencatat pembelian baru dan secara otomatis mengurangi stok produk.
* **Pembatalan Pembelian:** Membatalkan pembelian yang sudah ada dan mengembalikan stok produk.
* **Manajemen Stok:** Menampilkan daftar semua produk beserta sisa stoknya.
* **Riwayat Transaksi:** Melihat 20 transaksi pembelian terakhir (berhasil maupun dibatalkan).

## Teknologi

* **Backend:** Node.js, Express.js
* **View Engine:** EJS (Embedded JavaScript)
* **Database:** SQLite3

## Panduan Instalasi dan Penggunaan

**Prasyarat:** Anda harus memiliki [Node.js](https://nodejs.org/) (yang sudah termasuk npm) terinstal di komputer Anda.

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/muhamademiralfani/admin-toko.git](https://github.com/muhamademiralfani/admin-toko.git)
    cd NAMA-REPOSITORI-ANDA
    ```

2.  **Install semua dependensi:**
    ```bash
    npm install
    ```
    Perintah ini akan menginstal `express`, `ejs`, dan `sqlite3` sesuai [package.json](package.json).

3.  **Setup Database (Hanya dijalankan sekali):**
    Jalankan skrip `database.js` untuk membuat file `store.db` dan mengisi 10 produk awal.
    ```bash
    node database.js
    ```
   

4.  **Jalankan Server:**
    Gunakan perintah start dari `package.json`.
    ```bash
    npm start
    ```

5.  **Buka Aplikasi:**
    Buka browser Anda dan kunjungi `http://localhost:3000`.