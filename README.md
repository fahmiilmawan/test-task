# Accounting App

Aplikasi sederhana untuk manajemen akun dan transaksi keuangan, dibangun dengan Laravel, Inertia.js, dan React.

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

Berikut adalah langkah-langkah untuk menjalankan aplikasi ini menggunakan Docker.

### Prasyarat
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) harus sudah terinstal dan berjalan.

### Langkah-langkah

1.  **Clone Repository** (jika belum)
    ```bash
    git clone <repository-url>
    cd test-task
    ```

2.  **Setup Environment**
    Salin file `.env.example` menjadi `.env`.
    ```bash
    cp .env.example .env
    ```
    *Pastikan konfigurasi database di `.env` sesuai dengan Docker (DB_HOST=mysql, DB_USERNAME=sail, DB_PASSWORD=password).*

3.  **Jalankan Docker Container**
    Jalankan perintah berikut untuk membangun dan menyalakan container:
    ```bash
    docker compose up -d
    ```

4.  **Install Dependensi & Build Assets**
    Jalankan perintah berikut untuk menginstal dependensi PHP dan Node.js, serta melakukan build aset frontend di dalam container:
    ```bash
    docker compose exec app composer install
    docker compose exec app npm install
    docker compose exec app npm run build
    ```

5.  **Generate Application Key**
    ```bash
    docker compose exec app php artisan key:generate
    ```

6.  **Jalankan Migrasi Database**
    ```bash
    docker compose exec app php artisan migrate --seed
    ```

7.  **Akses Aplikasi**
    Buka browser dan akses alamat berikut:
    [http://localhost:8081](http://localhost:8081)

---

## 🏗️ Arsitektur Aplikasi

Aplikasi ini menggunakan arsitektur **Monolitik Modern** yang menggabungkan kekuatan Laravel sebagai backend framework dan React sebagai frontend library melalui Inertia.js.

### Teknologi Utama
-   **Backend**: Laravel 11 (PHP 8.2)
-   **Frontend**: React.js (via Inertia.js)
-   **Database**: MySQL 8.0
-   **Styling**: Tailwind CSS
-   **Containerization**: Docker Compose

### Struktur & Pola Desain

1.  **MVC (Model-View-Controller)**
    *   **Model**: Menggunakan Eloquent ORM untuk interaksi database (contoh: `Account`, `Transaction`).
    *   **View**: Menggunakan komponen React (`.jsx`) yang terletak di `resources/js/Pages`. Inertia.js bertindak sebagai jembatan, memungkinkan kita membuat SPA (Single Page Application) tanpa perlu membuat API terpisah secara manual.
    *   **Controller**: Menangani request HTTP dan mengembalikan respons Inertia (contoh: `TransactionController`, `DashboardController`).

2.  **Service Layer Pattern**
    *   Logika bisnis yang kompleks dipisahkan dari Controller ke dalam **Service Class**.
    *   Contoh: `AccountService` digunakan untuk menangani logika pembuatan kode akun otomatis (auto-generation based on prefix). Ini menjaga Controller tetap ramping ("Thin Controller").

3.  **Docker Environment**
    *   Aplikasi dibungkus dalam container Docker untuk memastikan konsistensi lingkungan pengembangan dan produksi.
    *   Menggunakan layanan `nginx` sebagai web server, `mysql` sebagai database, dan container `app` (PHP-FPM) untuk menjalankan aplikasi Laravel.

### Fitur Unggulan
-   **Manajemen Akun Berjenjang**: Mendukung akun Induk (Parent) dan Anak (Child).
-   **Normal Balance Logic**: Perhitungan saldo otomatis berdasarkan prefix akun (Aset/Beban vs Kewajiban/Ekuitas/Pendapatan).
-   **Dashboard Real-time**: Menampilkan ringkasan saldo seluruh akun.
