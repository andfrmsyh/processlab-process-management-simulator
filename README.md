# ProcessLab

## Simulator Interaktif Manajemen Proses Sistem Operasi

**Kelompok 3 · 2026**

ProcessLab adalah simulator pembelajaran berbasis web untuk membantu
pengguna memahami siklus hidup proses, penggunaan CPU, Process Control
Block (PCB), antrean proses, dan *context switching*. Seluruh simulasi
dijalankan di browser sebagai model edukasi; aplikasi ini tidak
mengelola proses Windows yang sebenarnya.

## 1. Fitur Utama

### Beranda dan navigasi

-   Halaman pengenalan ProcessLab.
-   Menu **Alur Proses**, **Simulator**, dan **Materi**.
-   Tombol akses cepat untuk membuka simulator dan materi pembelajaran.

### Visualisasi siklus hidup proses

ProcessLab menampilkan lima status proses: 1. **NEW** --- proses baru
dibuat. 2. **READY** --- proses siap dijalankan dan menunggu giliran
CPU. 3. **RUNNING** --- proses sedang menggunakan CPU simulasi. 4.
**WAITING** --- proses sedang menunggu I/O atau kejadian tertentu. 5.
**TERMINATED** --- proses telah selesai dan tidak dapat dijalankan
kembali.

Jumlah proses pada setiap status diperbarui secara langsung ketika
simulasi berubah.

### Laboratorium simulator

Pengguna dapat: - Membuat proses dengan nama sendiri. - Memindahkan
proses dari NEW ke READY. - Menjalankan proses dari READY ke RUNNING
ketika CPU kosong. - Menjalankan simulasi satu CPU Tick. - Melakukan
Context Switch dari proses RUNNING ke proses READY. - Memindahkan proses
RUNNING ke WAITING. - Mengembalikan proses WAITING ke READY. -
Mengakhiri proses yang sedang RUNNING. - Memilih proses yang sedang
menggunakan CPU untuk melihat detailnya. - Memuat skenario demo,
mengunduh laporan, dan mereset simulasi.

### Pemantauan dan pencatatan

Dashboard menampilkan: - Proses yang sedang menggunakan CPU. - Total
proses. - Total CPU Tick. - Jumlah Context Switch. - Informasi PCB: PID,
status, Program Counter (PC), Register AX, dan nama proses yang
dipilih. - Ready Queue dan Waiting Queue. - Activity Log yang mencatat
perubahan selama simulasi.

### Materi pembelajaran

Bagian Materi memuat sembilan modul: 1. Pengenalan ProcessLab. 2. Lima
Status Proses. 3. Process Control Block (PCB). 4. CPU Execution & Tick.
5. Context Switching. 6. Memahami Dashboard Simulator. 7. Praktik
Langsung. 8. Laporan & Troubleshooting. 9. Batasan & Pengembangan.

Modul disajikan dalam kartu yang dapat dibuka dan ditutup. Tersedia juga
contoh interaktif untuk memperlihatkan perubahan PC dan AX ketika CPU
Tick dijalankan.

## 2. Teknologi yang Digunakan

-   **HTML5** untuk struktur halaman.
-   **CSS3** untuk tampilan, tata letak, animasi, dan responsivitas.
-   **JavaScript** untuk logika simulasi dan interaksi.
-   **Google Fonts (Poppins)** untuk tipografi, dengan font cadangan
    jika font daring tidak tersedia.

HTML, CSS, dan JavaScript tertanam dalam satu file. Logika simulator
tidak membutuhkan framework, instalasi package, database, backend, atau
web server.

## 3. Cara Menjalankan

1.  Unduh atau clone repository.
2.  Pastikan file program utama bernama `index.html`.
3.  Buka `index.html` menggunakan browser modern, misalnya Google
    Chrome, Microsoft Edge, atau Brave.
4.  Klik **Buka Simulator** atau menu **Simulator** untuk menuju
    laboratorium.
5.  Klik **Siapkan Demo** untuk memuat skenario contoh, atau buat proses
    sendiri dengan tombol **+ Buat Proses**.

Program dapat dijalankan secara lokal dengan membuka file HTML langsung
di browser. Koneksi internet tidak diperlukan untuk logika simulasi.
Koneksi internet hanya membantu memuat font Poppins dari Google Fonts;
jika tidak tersedia, browser menggunakan font cadangan.

### Jika file masih bernama `.txt`

File teks yang berisi source code HTML tidak dapat dijalankan sebagai
halaman web hanya dengan dibuka sebagai `.txt`. Buka file tersebut di
Visual Studio Code, lalu gunakan **Save As** dan simpan dengan nama
`index.html`. Pastikan ekstensi akhirnya `.html`, bukan `.txt`.

## 4. Cara Menggunakan Simulator

### A. Membuat dan menjalankan proses

1.  Masukkan nama proses pada kolom nama proses.
2.  Klik **+ Buat Proses**. Proses baru akan berstatus NEW.
3.  Pilih proses tersebut, lalu klik **New → Ready**.
4.  Ketika CPU kosong, klik **Ready → Running**.
5.  Klik **Eksekusi 1 Tick** untuk menjalankan satu unit simulasi.
6.  Amati perubahan PC, AX, CPU Tick, PCB, dan Activity Log.

### B. Mencoba I/O

1.  Pastikan proses yang dipilih sedang RUNNING.
2.  Klik **Running → Waiting**.
3.  Pilih kembali proses tersebut jika diperlukan.
4.  Klik **Waiting → Ready** untuk menyimulasikan selesainya I/O.
5.  Jika CPU kosong, proses dapat dijalankan kembali melalui **Ready →
    Running**.

### C. Mencoba Context Switch

1.  Siapkan satu proses RUNNING.
2.  Siapkan setidaknya satu proses lain dengan status READY.
3.  Pilih proses READY yang akan menerima CPU.
4.  Klik **Context Switch** satu kali.
5.  Amati bahwa proses lama berubah menjadi READY dan proses target
    menjadi RUNNING.

**Penting:** memilih baris proses hanya mengubah proses yang sedang
dipantau. Memilih proses tidak dengan sendirinya memindahkan penggunaan
CPU. Perpindahan CPU terjadi ketika tombol **Context Switch**
dijalankan.

### D. Mengakhiri proses

Pilih proses yang sedang RUNNING, lalu klik **Selesaikan Proses**.
Statusnya berubah menjadi TERMINATED dan proses tersebut tidak dapat
dijalankan kembali dalam simulasi ini.

### E. Fungsi tombol

  -----------------------------------------------------------------------
  Tombol                              Fungsi
  ----------------------------------- -----------------------------------
  `+ Buat Proses`                     Membuat proses baru dengan status
                                      NEW.

  `New → Ready`                       Memindahkan proses NEW ke READY.

  `Ready → Running`                   Menjalankan proses READY jika CPU
                                      kosong.

  `Eksekusi 1 Tick`                   Menjalankan satu unit eksekusi
                                      simulasi.

  `Context Switch`                    Mengalihkan CPU dari proses RUNNING
                                      ke proses READY.

  `Running → Waiting`                 Memindahkan proses RUNNING ke
                                      WAITING.

  `Waiting → Ready`                   Mengembalikan proses WAITING ke
                                      READY.

  `Selesaikan Proses`                 Mengubah proses RUNNING menjadi
                                      TERMINATED.

  `Pilih Proses CPU`                  Memilih proses yang sedang
                                      menggunakan CPU untuk ditampilkan
                                      pada PCB.

  `Siapkan Demo`                      Mengganti simulasi aktif dengan
                                      skenario demo tiga proses.

  `Unduh Hasil`                       Mengunduh laporan simulasi dalam
                                      format TXT.

  `Reset`                             Menghapus proses, penghitung, dan
                                      riwayat simulasi.
  -----------------------------------------------------------------------

## 5. Aturan Simulasi

### CPU Tick, PC, dan AX

Setiap kali **Eksekusi 1 Tick** ditekan pada proses RUNNING: - PC
bertambah 1. - AX bertambah 3 dengan perhitungan modulo 256. - Jumlah
tick proses bertambah 1. - Total CPU Tick bertambah 1.

Rumus perubahan AX pada simulator:

`AX baru = (AX lama + 3) % 256`

Nilai PC dan AX merupakan angka ilustrasi yang dikelola JavaScript,
bukan pembacaan register CPU fisik.

### Context Switch

Context Switch hanya dapat dilakukan jika terdapat: - Satu proses yang
sedang RUNNING; dan - Sedikitnya satu proses berstatus READY.

Jika proses yang dipilih berstatus READY, proses tersebut menjadi target
perpindahan. Jika tidak, simulator menggunakan proses READY pertama yang
ditemukan. Proses RUNNING sebelumnya berubah menjadi READY, proses
target menjadi RUNNING, dan penghitung Context Switch bertambah satu.

Context Switch tidak menambah CPU Tick karena tindakan tersebut
merupakan perpindahan proses, bukan eksekusi satu tick.

### Batas data simulasi

-   Jumlah proses yang dapat dibuat dibatasi hingga **30 proses**.
-   Kolom nama proses menerima maksimal **40 karakter**.
-   Activity Log menyimpan maksimal **80 peristiwa terbaru** selama sesi
    berjalan.
-   PID dimulai dari 1001 dan kembali ke 1001 setelah Reset.
-   Data simulasi disimpan sementara di memori halaman browser, bukan di
    database atau penyimpanan permanen.

## 6. Skenario Demo Bawaan

Tombol **Siapkan Demo** memuat tiga proses berikut:

     PID Nama Proses      Status      PC   AX   Tick Proses
  ------ ---------------- --------- ---- ---- -------------
    1001 Editor Dokumen   RUNNING      8   24             8
    1002 Browser          READY        3    9             3
    1003 Pemutar Musik    WAITING      4   12             4

Kondisi awal demo: - Total proses: **3** - CPU Tick: **15** - Context
Switch: **0** - Proses yang menggunakan CPU: **Editor Dokumen** - Proses
yang dipilih: **Browser**

Setelah Browser dipilih dan tombol **Context Switch** ditekan satu
kali: - Editor Dokumen berubah dari RUNNING menjadi READY. - Browser
berubah dari READY menjadi RUNNING. - Pemutar Musik tetap WAITING. - CPU
saat ini menggunakan Browser (PID 1002). - Context Switch menjadi
**1**. - CPU Tick tetap **15** sampai tombol Eksekusi 1 Tick dijalankan.

## 7. Mengunduh Laporan Simulasi

Klik **Unduh Hasil** untuk membuat file:

`hasil_simulasi_kelompok_3.txt`

Laporan memuat: - Tanggal dan waktu pembuatan laporan. - Total proses. -
CPU Tick. - Jumlah Context Switch. - Data PCB setiap proses: PID, nama,
status, PC, AX, dan tick proses. - Riwayat aktivitas simulasi.

Laporan dibuat berdasarkan kondisi saat tombol diklik. Karena itu, hasil
laporan dapat berbeda antara satu sesi dan sesi lainnya.

Jika belum ada proses, simulator menampilkan pemberitahuan bahwa belum
ada hasil simulasi dan tidak membuat file laporan.

## 8. Batasan Program

ProcessLab merupakan simulator edukasi dengan batasan berikut: - Tidak
membaca, menjalankan, atau mengendalikan proses asli Windows. - Tidak
menggantikan Task Manager atau sistem operasi. - Memodelkan satu CPU
simulasi, sehingga hanya satu proses yang berstatus RUNNING pada satu
waktu. - Belum menerapkan penjadwalan otomatis lengkap seperti FCFS atau
Round Robin. - Nilai PID, PC, AX, dan tick merupakan data model untuk
pembelajaran. - Data sesi tidak disimpan secara permanen. Refresh atau
pemuatan ulang halaman akan mengembalikan simulasi ke kondisi awal.

FCFS, Round Robin, penjelasan visual tambahan, dan penyimpanan riwayat
merupakan ide pengembangan selanjutnya, bukan fitur yang sudah tersedia
pada versi ini.

## 9. Troubleshooting

  -----------------------------------------------------------------------
  Kendala                             Solusi
  ----------------------------------- -----------------------------------
  File terbuka sebagai teks/kode      Pastikan file disimpan dengan
                                      ekstensi `.html`, misalnya
                                      `index.html`.

  Tombol aksi tidak aktif             Periksa status proses yang dipilih
                                      dan kondisi CPU. Tombol hanya aktif
                                      jika syarat aksinya terpenuhi.

  Context Switch tidak dapat          Pastikan ada satu proses RUNNING
  dilakukan                           dan minimal satu proses READY.

  CPU masih Idle                      Buat proses, pindahkan ke READY,
                                      lalu jalankan dengan **Ready →
                                      Running**.

  Unduh Hasil tidak menghasilkan file Pastikan setidaknya satu proses
                                      sudah dibuat. Periksa folder
                                      unduhan dan izin unduhan browser.

  Data hilang setelah refresh         Data hanya tersimpan selama halaman
                                      berjalan. Unduh laporan TXT sebelum
                                      refresh jika hasil dibutuhkan.

  Font terlihat berbeda               Pastikan koneksi internet tersedia
                                      untuk memuat Poppins. Tanpa
                                      internet, browser memakai font
                                      cadangan.
  -----------------------------------------------------------------------

## 10. Struktur Repository yang Disarankan

``` text
processlab-process-management-simulator/
├── README.md
└── index.html
```

Gunakan satu file HTML final sebagai program utama. File
`KODE VSCODE LANGSUNG TEMPEL(2).txt` yang diperiksa bersama file HTML
berisi source code yang sama setelah perbedaan format baris diabaikan.
Karena itu, keduanya tidak perlu diunggah sebagai dua versi program yang
berbeda.

Untuk repository GitHub, disarankan: - Simpan dokumentasi ini sebagai
`README.md`. - Simpan program final sebagai `index.html`. - Hindari
mengunggah file backup atau salinan source code yang isinya duplikat ke
repository utama.

------------------------------------------------------------------------

**ProcessLab · Simulasi Sistem Operasi · Kelompok 3 · 2026**

Proyek pembelajaran mandiri untuk memahami manajemen proses, status
proses, PCB, CPU Tick, antrean, dan Context Switching.

---

## 6. Dokumentasi Visual

Bagian ini menampilkan dokumentasi visual dari aplikasi ProcessLab, mulai dari halaman beranda hingga simulasi manajemen proses dan pencatatan aktivitas.

### 6.1 Halaman Beranda

Tampilan utama ProcessLab yang memperkenalkan konsep manajemen proses dalam sistem operasi.

![Visualisasi Siklus Hidup Proses](assets/screenshots/02-laboratorium.png)

### 6.2 Visualisasi Siklus Hidup Proses

Bagian ini menampilkan lima status proses dalam sistem operasi, yaitu NEW, READY, RUNNING, WAITING, dan TERMINATED.

![Interactive Laboratory](assets/screenshots/02-laboratorium.png)

### 6.3 Simulasi Proses Berjalan

Menampilkan proses yang sedang menggunakan CPU beserta informasi Process Control Block (PCB), termasuk Process ID, Program Counter, dan Register AX.

![Running Process](assets/screenshots/03-running-process.png)

### 6.4 Process Queues

Visualisasi Ready Queue dan Waiting Queue untuk memperlihatkan proses yang menunggu giliran CPU maupun menunggu penyelesaian I/O.

![Process Queues](assets/screenshots/04-process-queues.png)

### 6.5 Activity Log

Riwayat aktivitas simulasi yang mencatat perubahan status proses, eksekusi instruksi, dan context switching.

![Activity Log](assets/screenshots/05-activity-log.png)
