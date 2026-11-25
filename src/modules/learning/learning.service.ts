// src/modules/learning/learning.service.ts
// Layanan modul belajar, kuis interaktif, dan evaluasi hasil dengan pemberian XP atomik

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface LessonStep {
  stepNumber: number;
  title: string;
  description: string;
  badge?: string;
  iconType: 'eye' | 'hand' | 'lock' | 'bell' | 'receipt' | 'shield' | 'wallet';
}

export interface LessonBenefit {
  title: string;
  desc: string;
  iconType: 'speed' | 'wallet' | 'shield' | 'receipt' | 'bell';
}

export interface LessonDetail {
  id: string;
  title: string;
  subtitle?: string;
  topic: string;
  durationMinutes: number;
  xpReward: number;
  contentMd: string; // Fallback string
  conceptTitle?: string;
  conceptDescription?: string;
  benefits?: LessonBenefit[];
  practicalStepsTitle?: string;
  practicalSteps?: LessonStep[];
  goldenRule?: {
    title: string;
    description: string;
    warningNote: string;
  };
  quiz: QuizQuestion[];
}

export const SAMPLE_LESSONS: LessonDetail[] = [
  {
    id: 'mengenal-qris-aman',
    title: 'Mengenal QRIS & Cara Pasang Stiker Aman',
    subtitle: 'Panduan lengkap menerima pembayaran digital tanpa ribet dan menjaga kode QR toko dari stiker palsu.',
    topic: 'Dasar QRIS',
    durationMinutes: 3,
    xpReward: 50,
    conceptTitle: 'Apa Sebenarnya QRIS Itu?',
    conceptDescription:
      'QRIS (Quick Response Code Indonesian Standard) adalah standar pembayaran digital resmi nasional dari Bank Indonesia. Cukup menempelkan 1 stiker kode QR, warung Anda langsung bisa menerima pembayaran dari semua aplikasi dompet digital (GoPay, OVO, DANA, ShopeePay) dan mobile banking mana pun (BRI, BCA, Mandiri, BNI, dll).',
    benefits: [
      {
        title: '1 Stiker untuk Semua Pembeli',
        desc: 'Tidak perlu menempelkan banyak kode QR berbeda yang membingungkan kasir.',
        iconType: 'wallet',
      },
      {
        title: 'Bebas Pusing Uang Kembalian',
        desc: 'Pembeli membayar pas hingga satuan rupiah terkecil tanpa perlu cari recehan.',
        iconType: 'speed',
      },
      {
        title: 'Standar Resmi Bank Indonesia',
        desc: 'Pembayaran digital aman yang diawasi langsung oleh otoritas perbankan nasional.',
        iconType: 'shield',
      },
    ],
    practicalStepsTitle: '3 Aturan Emas Pemasangan Stiker QRIS yang Aman di Toko',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Letakkan di Depan Pandangan Kasir',
        description:
          'Tempelkan stiker QRIS tepat di meja tempat Anda berjaga melayani pembeli. Hindari meletakkannya di sudut luar warung yang sepi atau sulit Anda awasi.',
        badge: 'Pengawasan Penuh',
        iconType: 'eye',
      },
      {
        stepNumber: 2,
        title: 'Raba Permukaan Stiker Secara Berkala',
        description:
          'Setiap pagi saat buka toko, usap stiker QRIS Anda. Pastikan tidak ada stiker kode QR orang lain yang sengaja ditempelkan menimpa stiker resmi toko Anda.',
        badge: 'Cek Fisik Rutin',
        iconType: 'hand',
      },
      {
        stepNumber: 3,
        title: 'Simpan ke Dalam Toko Saat Malam Tutup',
        description:
          'Jika Anda menggunakan tent card (papan meja akrilik), bawa masuk ke dalam ruangan toko yang terkunci setiap kali toko tutup malam hari.',
        badge: 'Simpan Aman',
        iconType: 'lock',
      },
    ],
    goldenRule: {
      title: 'Kunci Utama Keamanan Kasir',
      description:
        'Sebelum menyerahkan belanjaan ke pembeli, selalu pastikan notifikasi atau saldo bertambah di aplikasi ponsel Anda sendiri.',
      warningNote: 'Jangan hanya percaya pada tangkapan layar (screenshot) di layar ponsel pembeli!',
    },
    contentMd: `
### Apa itu QRIS?
QRIS (Quick Response Code Indonesian Standard) adalah standar nasional pembayaran digital di Indonesia. Cukup dengan satu stiker kode QR, warung Anda bisa menerima pembayaran dari semua dompet digital dan mobile banking.

### Tips Aman Menempelkan Stiker QRIS:
1. **Letakkan di tempat yang terlihat kasir**: Tempelkan di dekat tempat Anda berjaga sehingga mudah diawasi.
2. **Raba stiker secara berkala**: Pastikan tidak ada stiker kode QR lain yang sengaja ditempelkan orang asing menutupi stiker asli Anda.
3. **Simpan saat tutup**: Jika warung Anda menggunakan stand tent card di luar, simpan ke dalam saat toko tutup.
    `,
    quiz: [
      {
        id: 'q1',
        question: 'Di mana posisi paling aman menaruh stiker kode QRIS di warung?',
        options: [
          'Di tiang luar warung yang sepi pembeli',
          'Di meja kasir dekat pengawasan langsung pemilik',
          'Di balik pintu toko yang tertutup rapat',
        ],
        correctOptionIndex: 1,
        explanation:
          'Stiker QRIS harus selalu berada di dekat meja kasir dan dalam pengawasan pemilik agar tidak bisa ditimpa atau dirusak orang lain.',
      },
      {
        id: 'q2',
        question: 'Mengapa Anda disarankan meraba permukaan stiker QRIS secara berkala?',
        options: [
          'Agar stiker tetap mengkilap',
          'Mendeteksi apakah ada stiker palsu orang asing yang sengaja ditempel menimpa stiker asli',
          'Untuk menghitung berapa kali kode QR telah dipindai',
        ],
        correctOptionIndex: 1,
        explanation:
          'Meraba stiker secara fisik membantu memastikan tidak ada stiker palsu yang ditempelkan menumpuk stiker resmi warung Anda.',
      },
      {
        id: 'q3',
        question: 'Apa kepanjangan dari QRIS yang menjadi standar pembayaran nasional?',
        options: [
          'Quick Response Code Indonesian Standard',
          'Quick Retail Indonesia System',
          'Quality Receipt Indonesian Standard',
        ],
        correctOptionIndex: 0,
        explanation:
          'QRIS adalah singkatan dari Quick Response Code Indonesian Standard yang ditetapkan oleh Bank Indonesia.',
      },
      {
        id: 'q4',
        question: 'Apa yang sebaiknya dilakukan terhadap standing akrilik QRIS saat toko tutup malam hari?',
        options: [
          'Dibiarkan di meja luar agar terlihat orang lewat',
          'Disimpan ke dalam ruangan toko yang terkunci',
          'Ditempel di pagar depan warung',
        ],
        correctOptionIndex: 1,
        explanation:
          'Menyimpan papan QRIS di dalam ruangan terkunci mencegah pihak tidak bertanggung jawab menempelkan stiker palsu saat toko tutup.',
      },
      {
        id: 'q5',
        question: 'Apakah satu stiker QRIS resmi bisa menerima pembayaran dari aplikasi dompet digital dan bank yang berbeda?',
        options: [
          'Tidak bisa, harus punya satu stiker untuk tiap bank',
          'Bisa, cukup satu stiker QRIS untuk semua aplikasi dompet digital dan mobile banking',
          'Hanya bisa untuk satu merek dompet digital saja',
        ],
        correctOptionIndex: 1,
        explanation:
          'Keunggulan utama QRIS adalah interoperabilitas: satu kode QR dapat dipindai dari berbagai aplikasi pembayaran resmi.',
      },
    ],
  },
  {
    id: 'waspada-penipuan-qris',
    title: 'Waspada Penipuan & Cara Cek Notifikasi Masuk',
    subtitle: 'Kenali modus bukti bayar palsu dan pastikan uang transaksi benar-benar masuk ke kas usaha.',
    topic: 'Keamanan Transaksi',
    durationMinutes: 2,
    xpReward: 50,
    conceptTitle: 'Mengapa Screenshot Pembeli Tidak Boleh Langsung Dipercaya?',
    conceptDescription:
      'Tangkapan layar (screenshot) bukti transfer sangat mudah dipalsukan menggunakan aplikasi edit foto atau menggunakan struk transaksi lama. Penjual yang langsung percaya berisiko mengalami kerugian karena barang sudah dibawa pembeli padahal uangnya belum pernah masuk ke rekening warung.',
    benefits: [
      {
        title: 'Notifikasi Ponsel Sendiri Adalah Kunci',
        desc: 'Bunyi lonceng dan notifikasi di HP Anda adalah satu-satunya bukti pembayaran yang sah.',
        iconType: 'bell',
      },
      {
        title: 'Mutasi Transaksi Real-Time',
        desc: 'Riwayat uang masuk dapat dicek seketika di aplikasi perbankan atau dompet digital Anda.',
        iconType: 'receipt',
      },
      {
        title: 'Cegah Kerugian Kas Usaha',
        desc: 'Melindungi kas harian warung dari pembeli nakal dan memastikan pendapatan toko aman.',
        iconType: 'shield',
      },
    ],
    practicalStepsTitle: '3 Langkah Verifikasi Pembayaran yang Benar & Aman',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Tunggu Notifikasi Masuk di Ponsel Anda',
        description:
          'Dengarkan bunyi lonceng atau cek bilah notifikasi di ponsel kasir Anda. Setiap pembayaran sukses selalu memunculkan pemberitahuan resmi.',
        badge: 'Cek HP Kasir',
        iconType: 'bell',
      },
      {
        stepNumber: 2,
        title: 'Buka Menu Riwayat Mutasi Rekening',
        description:
          'Bila sinyal lambat atau notifikasi belum berbunyi, langsung buka aplikasi merchant Anda dan cek menu riwayat transaksi masuk hari ini.',
        badge: 'Cek Mutasi Langsung',
        iconType: 'receipt',
      },
      {
        stepNumber: 3,
        title: 'Cocokkan Nominal Belanjaan',
        description:
          'Pastikan angka rupiah yang masuk sama persis dengan total belanjaan sebelum Anda menyerahkan kantong belanjaan ke pembeli.',
        badge: 'Cocokkan Angka',
        iconType: 'shield',
      },
    ],
    goldenRule: {
      title: 'Rahasia Nomor PIN & Kode OTP Anda',
      description:
        'Petugas Bank, Bank Indonesia, maupun tim Pindaiin TIDAK PERNAH meminta nomor PIN kartu, kata sandi, atau kode OTP SMS Anda.',
      warningNote: 'PIN dan OTP adalah kunci rahasia pribadi yang tidak boleh dibagikan kepada siapa pun!',
    },
    contentMd: `
### Cara Memastikan Uang QRIS Benar Masuk
Jangan hanya percaya pada tangkapan layar (screenshot) pembeli! Gambar tersebut bisa saja hasil editan atau transaksi masa lalu.

### Langkah Verifikasi yang Benar:
1. **Periksa Notifikasi di Ponsel Anda Sendiri**: Tunggu notifikasi atau SMS masuk dari aplikasi merchant Anda.
2. **Cek Riwayat Masuk**: Buka mutasi atau riwayat transaksi di aplikasi merchant Anda sendiri.
3. **Cocokkan Nominal**: Pastikan nominal rupiah yang masuk sesuai dengan belanjaan pembeli sebelum pembeli membawa barang.
    `,
    quiz: [
      {
        id: 'q1',
        question: 'Apa yang harus Anda lakukan saat pembeli menunjukkan screenshot sukses bayar di ponselnya?',
        options: [
          'Langsung percaya dan membiarkan pembeli membawa pergi barang belanjaan',
          'Memeriksa notifikasi atau riwayat mutasi di ponsel toko Anda sendiri terlebih dahulu',
          'Meminta nomor kartu ATM dan PIN pembeli',
        ],
        correctOptionIndex: 1,
        explanation:
          'Pemilik usaha harus selalu memeriksa notifikasi atau mutasi di aplikasinya sendiri sebelum menyerahkan barang dagangan.',
      },
      {
        id: 'q2',
        question: 'Apakah aplikasi Pindaiin atau petugas perbankan boleh meminta nomor PIN dan OTP Anda?',
        options: [
          'Boleh jika pembeli tidak membayar belanjaan',
          'Boleh saat jam kerja saja',
          'Sama sekali TIDAK BOLEH, PIN dan kode OTP bersifat rahasia pribadi',
        ],
        correctOptionIndex: 2,
        explanation:
          'Nomor PIN dan OTP adalah informasi rahasia yang tidak boleh pernah dibagikan kepada siapa pun, termasuk pihak bank atau pengelola aplikasi.',
      },
      {
        id: 'q3',
        question: 'Jika notifikasi belum berbunyi padahal pembeli mengaku sudah membayar, langkah paling tepat adalah?',
        options: [
          'Meminta pembeli pergi begitu saja',
          'Membuka aplikasi merchant di ponsel Anda dan mengecek menu riwayat mutasi hari ini',
          'Meminta password mobile banking pembeli',
        ],
        correctOptionIndex: 1,
        explanation:
          'Mengecek menu riwayat mutasi di aplikasi merchant Anda sendiri memastikan dana benar-benar masuk meski notifikasi suara terlambat.',
      },
      {
        id: 'q4',
        question: 'Apa risiko jika penjual hanya mengandalkan screenshot bukti bayar di layar HP pembeli?',
        options: [
          'Baterai ponsel penjual cepat habis',
          'Screenshot mudah diedit atau memakai bukti transaksi lama sehingga uang belum tentu masuk',
          'Stiker QRIS menjadi cepat pudar',
        ],
        correctOptionIndex: 1,
        explanation:
          'Gambar tangkapan layar sangat mudah direkayasa; hanya mutasi di aplikasi merchant Anda yang menjadi bukti sah.',
      },
      {
        id: 'q5',
        question: 'Selain mengecek status sukses, hal penting apa lagi yang wajib dicocokkan pada mutasi masuk?',
        options: [
          'Warna baju pembeli',
          'Nominal rupiah harus sama persis dengan total belanjaan',
          'Merek ponsel yang dipakai pembeli',
        ],
        correctOptionIndex: 1,
        explanation:
          'Pembeli bisa saja salah mengetik nominal; pastikan angka rupiah yang masuk sesuai dengan total belanja.',
      },
    ],
  },
  {
    id: 'kelola-keuangan-qris',
    title: 'Tips Pengelolaan Keuangan & Kas Toko QRIS',
    subtitle: 'Manfaatkan pencatatan otomatis transaksi digital untuk pembukuan usaha yang rapi dan terukur.',
    topic: 'Manajemen Keuangan',
    durationMinutes: 2,
    xpReward: 50,
    conceptTitle: 'Pisahkan Uang Toko dari Uang Dapur Rumah Tangga',
    conceptDescription:
      'Keunggulan utama pembayaran QRIS adalah seluruh uang dagangan langsung tersimpan rapi di rekening usaha. Pedagang tidak lagi mencampur uang modal belanja barang dengan uang dapur, sehingga keuntungan bersih toko dapat dihitung dengan akurat setiap pekannya.',
    benefits: [
      {
        title: 'Riwayat Uang Masuk Otomatis',
        desc: 'Tidak perlu mencatat manual satu per satu di buku tulis lusuh yang mudah hilang.',
        iconType: 'receipt',
      },
      {
        title: 'Mengetahui Produk Terlaris',
        desc: 'Membantu melihat tren waktu belanja paling ramai dan barang yang paling diminati.',
        iconType: 'speed',
      },
      {
        title: 'Buka Peluang Modal Usaha',
        desc: 'Rekam jejak mutasi transaksi digital mempermudah persetujuan bantuan modal usaha.',
        iconType: 'wallet',
      },
    ],
    practicalStepsTitle: '3 Kebiasaan Pintar Mengelola Transaksi QRIS',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Rekap Transaksi Setiap Sore Hari',
        description:
          'Luangkan waktu 2 menit saat tutup toko untuk mencocokkan total transaksi di Pindaiin dengan mutasi bank Anda.',
        badge: 'Rekap 2 Menit',
        iconType: 'receipt',
      },
      {
        stepNumber: 2,
        title: 'Ambil Hadiah Bonus dari Poin XP',
        description:
          'Setiap kali mencatat transaksi dan menyelesaikan misi, tukarkan poin dengan perlengkapan usaha nyata di Katalog Hadiah.',
        badge: 'Klaim Hadiah',
        iconType: 'wallet',
      },
      {
        stepNumber: 3,
        title: 'Aktif Tawarkan Pembayaran QRIS',
        description:
          'Sapa pembeli dengan ramah: "Bisa bayar pakai QRIS ya Bu/Pak!". Semakin sering digunakan, semakin terbiasa pelanggan Anda.',
        badge: 'Rutin Tawarkan',
        iconType: 'shield',
      },
    ],
    goldenRule: {
      title: 'Toko Modern, Pelanggan Nyaman',
      description:
        'Menyediakan QRIS membuat toko Anda tampak profesional, modern, dan menjadi pilihan utama pembeli muda maupun perantau.',
      warningNote: 'Jaga kode QR tetap bersih, terang, dan mudah dipindai kamera ponsel.',
    },
    contentMd: `
### Tips Mengelola Kas Toko dengan QRIS:
1. **Pisahkan rekening usaha**: Jangan mencampur uang belanja dapur dengan modal toko.
2. **Rekap harian**: Luangkan 2 menit di sore hari untuk melihat total transaksi masuk.
3. **Kumpulkan poin**: Catat laporan di Pindaiin untuk mendapatkan reward merchandise usaha.
    `,
    quiz: [
      {
        id: 'q1',
        question: 'Apa manfaat utama memisahkan rekening hasil jualan QRIS dengan uang pribadi?',
        options: [
          'Agar saldo tampak banyak saja',
          'Memudahkan menghitung keuntungan bersih usaha tanpa terpakai untuk belanja dapur',
          'Mendapatkan bunga pinjaman lebih tinggi',
        ],
        correctOptionIndex: 1,
        explanation:
          'Pemisahan rekening mencegah modal usaha terpakai untuk konsumsi pribadi dan membuat arus kas toko terukur dengan rapi.',
      },
      {
        id: 'q2',
        question: 'Bagaimana cara terbaik membiasakan pelanggan menggunakan pembayaran QRIS di toko Anda?',
        options: [
          'Memaksa semua pembeli tanpa opsi uang tunai',
          'Memasang stiker QRIS di kasir dan aktif menawarkan dengan ramah bahwa toko menerima pembayaran digital',
          'Menyembunyikan kode QR di dalam laci kasir',
        ],
        correctOptionIndex: 1,
        explanation:
          'Stiker yang terlihat jelas dan keramahan penjual dalam menawarkan pembayaran QRIS adalah kunci utama adopsi berkelanjutan.',
      },
      {
        id: 'q3',
        question: 'Kapan waktu yang disarankan untuk merekap total transaksi QRIS harian di toko?',
        options: [
          'Setahun sekali saat libur lebaran',
          'Setiap sore atau saat toko akan tutup selama sekitar 2 menit',
          'Tidak perlu direkap sama sekali',
        ],
        correctOptionIndex: 1,
        explanation:
          'Rekap singkat setiap sore membantu mencocokkan catatan penjualan harian dengan mutasi rekening.',
      },
      {
        id: 'q4',
        question: 'Apa manfaat rekam jejak mutasi transaksi digital QRIS bagi perkembangan UMKM?',
        options: [
          'Mempermudah pengajuan bantuan atau pembiayaan modal usaha karena arus kas tercatat rapi',
          'Menghapus kewajiban membayar kulakan barang',
          'Membuat harga barang otomatis naik dua kali lipat',
        ],
        correctOptionIndex: 0,
        explanation:
          'Catatan mutasi digital menjadi bukti riwayat usaha yang sehat saat mengajukan pembiayaan atau program pembinaan.',
      },
      {
        id: 'q5',
        question: 'Apa fungsi catatan transaksi QRIS yang dikumpulkan di aplikasi Pindaiin?',
        options: [
          'Mengganti PIN rekening bank',
          'Membantu memantau aktivitas usaha sekaligus mengumpulkan poin XP untuk ditukar hadiah',
          'Membagikan saldo toko ke orang lain',
        ],
        correctOptionIndex: 1,
        explanation:
          'Pencatatan rutin di Pindaiin membantu pembiasaan pembukuan sekaligus memberi poin XP untuk ditukar perlengkapan usaha.',
      },
    ],
  },
  {
    id: 'biaya-admin-mdr-qris',
    title: 'Pahami Biaya MDR & Pencairan Dana QRIS ke Rekening',
    subtitle: 'Ketahui kapan transaksi bebas biaya potongan dan bagaimana jadwal uang masuk ke rekening usaha Anda.',
    topic: 'Transparansi Biaya',
    durationMinutes: 3,
    xpReward: 50,
    conceptTitle: 'Apa Itu MDR dan Bagaimana Aturannya untuk UMKM?',
    conceptDescription:
      'MDR (Merchant Discount Rate) adalah biaya jasa pemrosesan transaksi QRIS yang sangat kecil. Untuk usaha mikro (UMI), transaksi bernilai kecil mendapat keringanan khusus sesuai ketentuan Bank Indonesia, dan dana penjualan langsung diteruskan ke rekening bank atau dompet merchant Anda sesuai jadwal penyelesaian (settlement).',
    benefits: [
      {
        title: 'Biaya Jelas & Terstandar',
        desc: 'Tidak ada pungutan liar; seluruh tarif mengikuti aturan resmi Bank Indonesia.',
        iconType: 'shield',
      },
      {
        title: 'Otomatis Masuk Rekening',
        desc: 'Anda tidak perlu menagih manual ke aplikasi pembeli, dana diproses otomatis.',
        iconType: 'wallet',
      },
      {
        title: 'Rekap Potongan Transparan',
        desc: 'Riwayat mutasi menampilkan nominal kotor dan bersih dengan jelas.',
        iconType: 'receipt',
      },
    ],
    practicalStepsTitle: '3 Hal Penting Soal Biaya & Pencairan Dana QRIS',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Kenali Kategori Usaha Anda Saat Daftar',
        description:
          'Pastikan usaha Anda terdaftar sesuai skala (Usaha Mikro/Kecil) saat mendaftar QRIS resmi agar memperoleh tarif MDR yang sesuai ketentuan.',
        badge: 'Sesuai Skala',
        iconType: 'shield',
      },
      {
        stepNumber: 2,
        title: 'Cek Jadwal Pencairan (Settlement) Aplikasi',
        description:
          'Setiap penyedia QRIS memiliki jadwal cair dana ke rekening (ada yang seketika, H+1, atau sesuai jam kliring). Kenali jadwal di aplikasi Anda.',
        badge: 'Paham Jadwal',
        iconType: 'receipt',
      },
      {
        stepNumber: 3,
        title: 'Jangan Membebankan Biaya Tambahan ke Pembeli',
        description:
          'Sesuai aturan Bank Indonesia, pedagang tidak diperbolehkan menaikkan harga barang khusus untuk pembeli yang membayar memakai QRIS.',
        badge: 'Harga Sama',
        iconType: 'wallet',
      },
    ],
    goldenRule: {
      title: 'Harga Tunai dan QRIS Tetap Sama',
      description:
        'Memberikan harga yang sama untuk tunai dan QRIS menjaga kepercayaan pembeli agar mau terus berbelanja di warung Anda.',
      warningNote: 'Hindari meminta tambahan biaya admin di luar harga barang kepada pembeli.',
    },
    contentMd: `
### Memahami MDR & Pencairan QRIS:
1. **Tarif Resmi**: Biaya MDR mengikuti standar Bank Indonesia sesuai kategori usaha.
2. **Jadwal Cair**: Periksa jadwal pencairan dana di aplikasi merchant Anda (seketika atau H+1).
3. **Harga Adil**: Jual barang dengan harga yang sama baik tunai maupun QRIS.
    `,
    quiz: [
      {
        id: 'q1',
        question: 'Bolehkah pedagang menaikkan harga barang khusus bagi pembeli yang membayar menggunakan QRIS?',
        options: [
          'Boleh, agar untung lebih besar',
          'Tidak boleh, harga barang untuk tunai dan QRIS harus tetap sama',
          'Boleh jika pembeli tidak memperhatikan',
        ],
        correctOptionIndex: 1,
        explanation:
          'Sesuai ketentuan Bank Indonesia, pedagang tidak diperbolehkan membebankan biaya tambahan kepada pembeli yang menggunakan QRIS.',
      },
      {
        id: 'q2',
        question: 'Apa yang perlu dicek pedagang agar tidak panik saat uang QRIS belum langsung pindah ke rekening bank?',
        options: [
          'Membuang stiker QRIS',
          'Mengecek jadwal pencairan (settlement) pada aplikasi penyedia QRIS resmi yang digunakan',
          'Menghapus aplikasi toko',
        ],
        correctOptionIndex: 1,
        explanation:
          'Beberapa penyedia QRIS mencairkan saldo secara berkala (misalnya H+1 atau jam tertentu), sementara status transaksi sukses sudah tercatat di riwayat merchant.',
      },
      {
        id: 'q3',
        question: 'Apa yang dimaksud dengan MDR pada transaksi QRIS?',
        options: [
          'Biaya jasa pemrosesan transaksi resmi sesuai ketentuan Bank Indonesia',
          'Denda keterlambatan buka warung',
          'Bonus tunai dari pembeli',
        ],
        correctOptionIndex: 0,
        explanation:
          'MDR (Merchant Discount Rate) adalah biaya jasa pemrosesan resmi yang besarannya diatur oleh Bank Indonesia berdasarkan skala usaha.',
      },
      {
        id: 'q4',
        question: 'Mengapa penting memastikan kategori usaha terdaftar sesuai skala usaha mikro saat membuat QRIS?',
        options: [
          'Agar nama warung lebih panjang',
          'Agar mendapatkan skema tarif MDR yang sesuai ketentuan untuk usaha mikro',
          'Supaya tidak perlu memasang stiker',
        ],
        correctOptionIndex: 1,
        explanation:
          'Pendaftaran kategori usaha yang tepat memastikan pedagang menerima tarif resmi yang paling sesuai dengan skala usahanya.',
      },
      {
        id: 'q5',
        question: 'Di mana pedagang dapat melihat rincian nominal kotor dan bersih setelah pencairan QRIS?',
        options: [
          'Di menu riwayat mutasi atau laporan settlement pada aplikasi merchant resmi',
          'Di ponsel milik pembeli',
          'Di struk belanja toko lain',
        ],
        correctOptionIndex: 0,
        explanation:
          'Aplikasi merchant resmi menyediakan rincian mutasi dana masuk dan potongan biaya secara transparan.',
      },
    ],
  },
  {
    id: 'melayani-pembeli-cepat-qris',
    title: 'Trik Antrean Cepat & Ramah saat Jam Ramai',
    subtitle: 'Layani lebih banyak pelanggan tanpa bingung uang kembalian ketika warung sedang padat pembeli.',
    topic: 'Pelayanan Pelanggan',
    durationMinutes: 2,
    xpReward: 40,
    conceptTitle: 'QRIS Membuat Transaksi Jam Ramai Lebih Lancar',
    conceptDescription:
      'Saat jam sibuk pagi atau sore, mencari uang receh kembalian sering membuat antrean menumpuk. Dengan QRIS, pembeli cukup memindai kode QR, mengetik total belanjaan yang Anda sebutkan, lalu kasir tinggal mengecek notifikasi masuk.',
    benefits: [
      {
        title: 'Antrean Mengalir Cepat',
        desc: 'Tidak perlu membuka laci kasir berkali-kali untuk menghitung uang kembalian.',
        iconType: 'speed',
      },
      {
        title: 'Minim Salah Hitung',
        desc: 'Nominal dibayar pas hingga rupiah terkecil, mengurangi risiko salah kembalian.',
        iconType: 'receipt',
      },
      {
        title: 'Tangan Tetap Higienis',
        desc: 'Cocok untuk usaha makanan dan minuman karena tidak perlu memegang uang kertas saat menyajikan.',
        iconType: 'shield',
      },
    ],
    practicalStepsTitle: '3 Trik Kasir Cekatan Memakai QRIS',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Sebutkan Total Belanja dengan Jelas',
        description:
          'Ucapkan angka total dengan tegas, misalnya: "Totalnya dua puluh tiga ribu ya, Kak. Bisa langsung scan QRIS di depan."',
        badge: 'Komunikasi Jelas',
        iconType: 'bell',
      },
      {
        stepNumber: 2,
        title: 'Aktifkan Suara Notifikasi Kasir',
        description:
          'Pastikan volume notifikasi ponsel kasir cukup terdengar di tengah keramaian warung sehingga Anda tahu uang masuk tanpa bolak-balik membuka layar.',
        badge: 'Suara Aktif',
        iconType: 'bell',
      },
      {
        stepNumber: 3,
        title: 'Siapkan QRIS di Tempat Mudah Dijangkau',
        description:
          'Pastikan posisi stiker atau papan akrilik tidak terhalang toples atau barang dagangan agar kamera ponsel pembeli langsung fokus memindai.',
        badge: 'Akses Mudah',
        iconType: 'eye',
      },
    ],
    goldenRule: {
      title: 'Cepat Tetap Harus Teliti',
      description:
        'Meski warung sedang ramai, biasakan tetap melirik nominal pada notifikasi masuk di ponsel Anda sebelum menyerahkan pesanan.',
      warningNote: 'Volume suara notifikasi yang jelas membantu kasir bekerja cepat sekaligus aman.',
    },
    contentMd: `
### Trik Melayani Pembeli dengan QRIS saat Ramai:
1. **Sebutkan nominal dengan jelas** agar pembeli tidak salah ketik.
2. **Nyalakan suara notifikasi** di ponsel toko agar langsung terdengar saat pembayaran berhasil.
3. **Pastikan area QRIS bebas halangan** supaya kamera pembeli cepat memindai.
    `,
    quiz: [
      {
        id: 'q1',
        question: 'Apa keuntungan utama QRIS bagi penjual makanan/minuman saat jam ramai?',
        options: [
          'Bisa melayani lebih cepat tanpa repot uang kembalian dan lebih higienis',
          'Tidak perlu menyiapkan dagangan',
          'Ponsel tidak perlu menyala sama sekali',
        ],
        correctOptionIndex: 0,
        explanation:
          'QRIS mempercepat transaksi karena pembeli membayar pas dan penjual makanan tidak perlu sering menyentuh uang tunai.',
      },
      {
        id: 'q2',
        question: 'Pengaturan ponsel apa yang sangat membantu kasir saat melayani antrean panjang?',
        options: [
          'Mematikan seluruh suara ponsel',
          'Mengaktifkan suara notifikasi pembayaran masuk agar langsung terdengar',
          'Menurunkan kecerahan layar hingga gelap',
        ],
        correctOptionIndex: 1,
        explanation:
          'Suara notifikasi memudahkan kasir mengetahui pembayaran berhasil sambil tetap melayani pelanggan berikutnya.',
      },
      {
        id: 'q3',
        question: 'Bagaimana cara mencegah pembeli salah mengetik nominal saat membayar di jam ramai?',
        options: [
          'Menyebutkan total belanjaan dengan suara jelas dan tegas sebelum pembeli memindai',
          'Membiarkan pembeli menebak sendiri harganya',
          'Menuliskan nominal di kertas terpisah yang disembunyikan',
        ],
        correctOptionIndex: 0,
        explanation:
          'Menyebutkan total harga dengan jelas membuat pembeli langsung mengetik nominal yang tepat.',
      },
      {
        id: 'q4',
        question: 'Di mana posisi stiker QRIS agar pembeli cepat memindai tanpa menghalangi antrean?',
        options: [
          'Di balik toples kerupuk yang tinggi',
          'Di area depan kasir yang terang, tegak, dan tidak terhalang barang dagangan',
          'Di bagian bawah meja kasir',
        ],
        correctOptionIndex: 1,
        explanation:
          'Kode QR yang terlihat jelas dan tidak terhalang barang membuat kamera ponsel pembeli langsung fokus dalam sekali arah.',
      },
      {
        id: 'q5',
        question: 'Meski antrean sedang ramai, kebiasaan apa yang tidak boleh dilewatkan kasir?',
        options: [
          'Tetap melirik notifikasi dan nominal masuk di ponsel kasir sebelum menyerahkan pesanan',
          'Mengabaikan semua notifikasi sampai malam',
          'Meminta pembeli mengirim ulang dua kali',
        ],
        correctOptionIndex: 0,
        explanation:
          'Cepat melayani tetap harus disertai ketelitian memeriksa notifikasi masuk agar tidak terjadi selisih kas.',
      },
    ],
  },
  {
    id: 'mengatasi-kendala-sinyal-qris',
    title: 'Solusi Saat Sinyal Lambat atau Transaksi Tertunda',
    subtitle: 'Langkah tenang menghadapi pembayaran tertunda di daerah sinyal lemah agar tidak merugikan kedua pihak.',
    topic: 'Penanganan Kendala',
    durationMinutes: 3,
    xpReward: 60,
    conceptTitle: 'Mengapa Notifikasi Terkadang Terlambat Muncul?',
    conceptDescription:
      'Di wilayah dengan sinyal internet yang naik-turun, notifikasi pembayaran kadang terlambat beberapa detik hingga menit. Penjual perlu tahu cara memeriksa status secara tenang tanpa membuat pembeli tersinggung maupun toko merugi.',
    benefits: [
      {
        title: 'Tetap Tenang Saat Gangguan',
        desc: 'Punya panduan langkah jelas saat jaringan operator sedang lambat.',
        iconType: 'shield',
      },
      {
        title: 'Hindari Pembayaran Ganda',
        desc: 'Tahu kapan harus menunggu status atau mengecek mutasi sebelum scan ulang.',
        iconType: 'receipt',
      },
      {
        title: 'Cegah Salah Paham Pembeli',
        desc: 'Komunikasi sopan menjaga hubungan baik dengan pelanggan sekitar.',
        iconType: 'wallet',
      },
    ],
    practicalStepsTitle: '3 Langkah Mengatasi Kendala Sinyal & Pending',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Segarkan Halaman Riwayat di Aplikasi Anda',
        description:
          'Jika notifikasi belum berbunyi setelah 15 detik, buka aplikasi merchant Anda dan tarik layar ke bawah (refresh) untuk memuat mutasi terbaru.',
        badge: 'Cek Mutasi',
        iconType: 'receipt',
      },
      {
        stepNumber: 2,
        title: 'Cek Status "Sedang Diproses" di HP Pembeli',
        description:
          'Jika di aplikasi pembeli tertulis "Pending / Diproses", jangan buru-buru meminta scan ulang agar saldo pembeli tidak terpotong dua kali.',
        badge: 'Jangan Scan Dobel',
        iconType: 'eye',
      },
      {
        stepNumber: 3,
        title: 'Catat Kontak Jika Transaksi Masih Menggantung',
        description:
          'Bila jaringan benar-benar putus, mintalah pembayaran tunai jika pembeli bersedia, atau catat nama dan nomor WA pelanggan tetap sambil menunggu status selesai.',
        badge: 'Solusi Aman',
        iconType: 'lock',
      },
    ],
    goldenRule: {
      title: 'Jangan Kembalikan Uang Tunai Sebelum Mutasi Jelas',
      description:
        'Jika pembeli mengaku saldo terpotong tapi statusnya gagal atau belum masuk ke riwayat merchant, dana yang gagal biasanya otomatis kembali ke saldo pembeli oleh sistem.',
      warningNote: 'Selalu cek riwayat mutasi di aplikasi Anda sebelum mengambil keputusan.',
    },
    contentMd: `
### Menghadapi Sinyal Lambat saat Transaksi QRIS:
1. **Refresh riwayat transaksi** di aplikasi merchant Anda.
2. **Jangan langsung scan ulang** jika status di HP pembeli masih tertulis *diproses/pending*.
3. **Gunakan tunai sebagai cadangan** apabila jaringan internet sedang gangguan total.
    `,
    quiz: [
      {
        id: 'q1',
        question: 'Apa yang sebaiknya dilakukan jika status pembayaran di ponsel pembeli tertulis "Diproses/Pending"?',
        options: [
          'Langsung menyuruh pembeli scan ulang berkali-kali',
          'Menunggu sejenak dan menyegarkan (refresh) riwayat transaksi di aplikasi merchant Anda',
          'Mematikan ponsel toko',
        ],
        correctOptionIndex: 1,
        explanation:
          'Menyegarkan riwayat transaksi mencegah pembeli membayar dua kali untuk satu transaksi yang sedang diproses jaringan.',
      },
      {
        id: 'q2',
        question: 'Jika saldo pembeli terpotong namun transaksi berstatus GAGAL, apa yang biasanya terjadi?',
        options: [
          'Pedagang harus mengganti dengan uang tunai dari laci kasir',
          'Sistem penyedia pembayaran akan mengembalikan dana secara otomatis ke rekening/dompet pembeli',
          'Uang hilang selamanya',
        ],
        correctOptionIndex: 1,
        explanation:
          'Transaksi berstatus gagal tidak masuk ke rekening pedagang dan sistem perbankan/dompet digital akan mengembalikan dana ke pengirim.',
      },
      {
        id: 'q3',
        question: 'Mengapa pedagang tidak disarankan langsung menyuruh pembeli scan ulang saat status masih "Diproses"?',
        options: [
          'Karena dapat membuat saldo pembeli terpotong dua kali jika transaksi pertama ternyata berhasil',
          'Karena stiker QRIS hanya bisa dipakai sekali sehari',
          'Karena kamera ponsel akan rusak',
        ],
        correctOptionIndex: 0,
        explanation:
          'Menunggu sebentar dan menyegarkan mutasi mencegah terjadinya pembayaran ganda.',
      },
      {
        id: 'q4',
        question: 'Apa opsi cadangan paling aman bila jaringan internet di lokasi sedang gangguan total?',
        options: [
          'Tetap menyerahkan barang tanpa kepastian bayar',
          'Menawarkan pembayaran tunai sementara atau mencatat kontak pelanggan tetap sambil menunggu status jelas',
          'Meminta PIN rekening pembeli',
        ],
        correctOptionIndex: 1,
        explanation:
          'Pembayaran tunai menjadi cadangan paling aman ketika koneksi data tidak stabil.',
      },
      {
        id: 'q5',
        question: 'Sebelum memutuskan mengembalikan uang ke pembeli yang mengaku terpotong ganda, apa yang harus dilakukan?',
        options: [
          'Langsung memberikan uang tunai dari kasir tanpa mengecek apa pun',
          'Memastikan kedua transaksi benar-benar tercatat masuk pada riwayat mutasi di aplikasi merchant Anda',
          'Menutup warung seketika',
        ],
        correctOptionIndex: 1,
        explanation:
          'Pengembalian hanya dilakukan bila terbukti di mutasi aplikasi merchant Anda memang ada dua dana masuk untuk satu pesanan.',
      },
    ],
  },
  {
    id: 'promo-katalog-whatsapp-qris',
    title: 'Promosi Warung Pakai Foto Produk & QRIS via WhatsApp',
    subtitle: 'Jangkau pelanggan tetangga dan desa sekitar dengan pesanan antar dan pembayaran QRIS praktis.',
    topic: 'Pengembangan Usaha',
    durationMinutes: 3,
    xpReward: 60,
    conceptTitle: 'Jualan Tidak Hanya Menunggu Pembeli Datang ke Toko',
    conceptDescription:
      'Pelanggan tetap di sekitar desa sering memesan sembako, jajanan, atau makanan lewat WhatsApp. Dengan membagikan foto produk yang jelas dan menerima pembayaran QRIS, omzet warung bisa bertambah tanpa harus buka cabang baru.',
    benefits: [
      {
        title: 'Pelanggan Bisa Pesan dari Rumah',
        desc: 'Cocok untuk ibu rumah tangga, pekerja, atau warga yang sedang sibuk.',
        iconType: 'speed',
      },
      {
        title: 'Pembayaran Lunas Sebelum Diantar',
        desc: 'Pesanan dibayar lewat QRIS sebelum kurir atau penjual mengantarkan barang.',
        iconType: 'wallet',
      },
      {
        title: 'Catatan Pesanan Lebih Rapi',
        desc: 'Daftar belanjaan dan bukti bayar tercatat jelas di aplikasi.',
        iconType: 'receipt',
      },
    ],
    practicalStepsTitle: '3 Cara Jitu Promosi Warung Lewat WhatsApp',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Foto Produk dengan Cahaya Terang',
        description:
          'Ambil foto barang dagangan atau menu makanan hari ini di tempat terang, lalu cantumkan harga yang jelas pada keterangannya.',
        badge: 'Foto Jelas',
        iconType: 'eye',
      },
      {
        stepNumber: 2,
        title: 'Bagikan di Status WA & Grup Warga',
        description:
          'Unggah info stok segar atau paket hemat di Status WhatsApp setiap pagi dan tuliskan bahwa warung menerima pembayaran tunai maupun QRIS.',
        badge: 'Promosi Rutin',
        iconType: 'bell',
      },
      {
        stepNumber: 3,
        title: 'Kirim Gambar QRIS Resmi Saat Pembeli Deal',
        description:
          'Saat pesanan disepakati, kirim gambar kode QRIS resmi toko Anda dan pastikan notifikasi uang masuk sebelum barang dikirim.',
        badge: 'Bayar Aman',
        iconType: 'shield',
      },
    ],
    goldenRule: {
      title: 'Pastikan Dana Masuk Sebelum Pesanan Dikirim',
      description:
        'Untuk transaksi jarak jauh via WhatsApp, selalu verifikasi mutasi di aplikasi merchant Anda sebelum kurir berangkat mengantar.',
      warningNote: 'Jangan pernah membagikan kode OTP atau PIN saat melayani pesanan lewat WhatsApp.',
    },
    contentMd: `
### Promosi Warung Lewat WhatsApp & QRIS:
1. **Foto dagangan yang menarik** dengan harga yang jelas.
2. **Update Status WhatsApp** secara rutin tiap pagi.
3. **Kirim QRIS resmi toko** untuk pembayaran pesanan antar dan cek mutasi sebelum kirim barang.
    `,
    quiz: [
      {
        id: 'q1',
        question: 'Kapan waktu terbaik mengantar pesanan WhatsApp yang dibayar menggunakan QRIS?',
        options: [
          'Segera antar sebelum pembeli membayar',
          'Setelah pembayaran terkonfirmasi masuk di riwayat mutasi aplikasi merchant Anda',
          'Keesokan harinya tanpa mengecek mutasi',
        ],
        correctOptionIndex: 1,
        explanation:
          'Memastikan dana sudah masuk di riwayat merchant sebelum pengiriman melindungi toko dari risiko pesanan tidak dibayar.',
      },
      {
        id: 'q2',
        question: 'Informasi apa yang sebaiknya selalu dicantumkan saat mempromosikan produk di Status WhatsApp?',
        options: [
          'PIN mobile banking pemilik toko',
          'Foto produk yang jelas, harga, dan informasi bahwa toko menerima QRIS',
          'Nomor KTP seluruh pembeli',
        ],
        correctOptionIndex: 1,
        explanation:
          'Foto yang jelas, harga transparan, dan opsi pembayaran QRIS memudahkan calon pembeli langsung memesan.',
      },
      {
        id: 'q3',
        question: 'Bagaimana tips mengambil foto dagangan agar menarik perhatian calon pembeli di WhatsApp?',
        options: [
          'Foto di tempat gelap agar misterius',
          'Gunakan cahaya terang dan latar yang rapi sehingga produk terlihat segar dan jelas',
          'Kirim foto yang buram tanpa keterangan harga',
        ],
        correctOptionIndex: 1,
        explanation:
          'Foto yang terang dan jelas meningkatkan kepercayaan pembeli untuk memesan dari rumah.',
      },
      {
        id: 'q4',
        question: 'Apakah gambar kode QRIS resmi toko boleh dikirimkan ke pembeli yang memesan lewat WhatsApp?',
        options: [
          'Boleh, agar pembeli bisa memindai dari galeri ponselnya untuk melunasi pesanan',
          'Tidak boleh, kode QR hanya boleh dilihat di warung',
          'Harus diganti dengan mengirim foto kartu ATM',
        ],
        correctOptionIndex: 0,
        explanation:
          'Pembeli dapat mengimpor gambar QRIS resmi toko Anda melalui fitur pilih gambar di aplikasi dompet digital atau mobile banking mereka.',
      },
      {
        id: 'q5',
        question: 'Apa hal yang dilarang dilakukan saat melayani pesanan pelanggan lewat WhatsApp?',
        options: [
          'Mengirim foto menu harian',
          'Membagikan kode OTP atau PIN akun kepada siapa pun dengan alasan apa pun',
          'Menginformasikan total harga pesanan',
        ],
        correctOptionIndex: 1,
        explanation:
          'Kode OTP dan PIN bersifat sangat rahasia dan tidak pernah diperlukan untuk menerima pembayaran.',
      },
    ],
  },
  {
    id: 'qris-dinamis-vs-statis',
    title: 'Bedanya QRIS Statis & QRIS Dinamis untuk Toko',
    subtitle: 'Kenali jenis kode QR yang paling pas untuk warung harian agar tidak salah pilih cara bayar.',
    topic: 'Dasar QRIS',
    durationMinutes: 3,
    xpReward: 50,
    conceptTitle: 'Statis Pakai Stiker, Dinamis Muncul Nominal Otomatis',
    conceptDescription:
      'QRIS Statis adalah stiker atau papan QR tetap di meja kasir—pembeli mengetik sendiri nominal belanjanya. Sedangkan QRIS Dinamis dibuat langsung dari aplikasi kasir atau mesin EDC sehingga nominal belanja sudah otomatis muncul di layar pembeli.',
    benefits: [
      {
        title: 'Stiker Statis Hemat Biaya',
        desc: 'Cocok untuk warung kecil karena tidak butuh mesin EDC atau printer khusus.',
        iconType: 'wallet',
      },
      {
        title: 'QR Dinamis Anti Salah Ketik',
        desc: 'Nominal langsung terisi otomatis sehingga pembeli tinggal konfirmasi bayar.',
        iconType: 'shield',
      },
      {
        title: 'Bisa Dipakai Sesuai Kebutuhan',
        desc: 'Pedagang bisa memulai dari stiker statis lalu naik ke QR dinamis saat toko makin ramai.',
        iconType: 'speed',
      },
    ],
    practicalStepsTitle: '3 Tips Memilih & Memakai Jenis QRIS di Toko',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Gunakan QRIS Statis untuk Transaksi Cepat',
        description:
          'Tempel stiker QRIS Statis di meja kasir untuk melayani pembelian harian dengan cepat tanpa perlu mengetik tagihan di ponsel kasir.',
        badge: 'Praktis Harian',
        iconType: 'wallet',
      },
      {
        stepNumber: 2,
        title: 'Coba QRIS Dinamis untuk Belanja Banyak',
        description:
          'Jika aplikasi merchant Anda punya fitur buat kode QR per transaksi, gunakan untuk belanja nominal besar agar pembeli tidak salah ketik angka nol.',
        badge: 'Nominal Tepat',
        iconType: 'receipt',
      },
      {
        stepNumber: 3,
        title: 'Selalu Cek Ulang Angka Masuk',
        description:
          'Baik memakai stiker statis maupun QR dinamis, selalu pastikan nominal yang masuk di notifikasi aplikasi Anda sudah sesuai.',
        badge: 'Wajib Cek',
        iconType: 'shield',
      },
    ],
    goldenRule: {
      title: 'Pilih yang Paling Nyaman untuk Toko Anda',
      description:
        'Tidak perlu memaksakan alat mahal; stiker QRIS statis resmi sudah sangat mumpuni untuk memulai transaksi digital di warung.',
      warningNote: 'Pastikan nama toko yang muncul di layar pembeli sesuai dengan nama warung Anda.',
    },
    contentMd: 'QRIS Statis memakai stiker tetap di meja kasir, sedangkan QRIS Dinamis memunculkan nominal tagihan secara otomatis per transaksi.',
    quiz: [
      {
        id: 'q1',
        question: 'Apa ciri utama dari QRIS Statis yang biasa ditempel di meja warung?',
        options: [
          'Kode QR berubah-ubah setiap detik',
          'Satu stiker QR tetap dan pembeli mengetik sendiri nominal belanjanya',
          'Hanya bisa dipakai satu kali saja',
        ],
        correctOptionIndex: 1,
        explanation: 'Pada QRIS Statis, stiker kode QR selalu sama dan pembeli memasukkan sendiri jumlah rupiah yang dibayar.',
      },
      {
        id: 'q2',
        question: 'Apa keunggulan utama menggunakan QRIS Dinamis dari aplikasi kasir?',
        options: [
          'Nominal belanja langsung terisi otomatis sehingga mengurangi salah ketik',
          'Tidak memerlukan koneksi internet sama sekali',
          'Pembeli tidak perlu memakai ponsel',
        ],
        correctOptionIndex: 0,
        explanation: 'QRIS Dinamis menyertakan nominal tagihan di dalam kode QR sehingga pembeli tinggal menekan bayar.',
      },
      {
        id: 'q3',
        question: 'Jenis QRIS mana yang paling praktis dan hemat biaya untuk warung kelontong pemula?',
        options: [
          'QRIS Statis berbentuk stiker atau papan akrilik meja',
          'Mesin kasir besar berharga puluhan juta',
          'Kartu kredit khusus',
        ],
        correctOptionIndex: 0,
        explanation: 'QRIS Statis sangat mudah dipasang dan tidak membutuhkan perangkat tambahan selain ponsel pemilik.',
      },
      {
        id: 'q4',
        question: 'Saat pembeli memindai QRIS Statis, hal apa yang harus mereka periksa di layar ponselnya?',
        options: [
          'Nama toko penerima dan nominal yang diketik sudah benar',
          'Nomor seri stiker',
          'Kapasitas memori HP kasir',
        ],
        correctOptionIndex: 0,
        explanation: 'Pembeli perlu memastikan nama merchant yang muncul benar-benar nama toko Anda.',
      },
      {
        id: 'q5',
        question: 'Apakah QRIS Statis maupun Dinamis tetap membutuhkan pengecekan notifikasi di HP toko?',
        options: [
          'Tidak perlu jika memakai QR dinamis',
          'Ya, keduanya tetap wajib dicek di notifikasi atau mutasi aplikasi toko Anda',
          'Hanya dicek sebulan sekali',
        ],
        correctOptionIndex: 1,
        explanation: 'Verifikasi di aplikasi merchant sendiri tetap menjadi aturan utama keamanan kasir.',
      },
    ],
  },
  {
    id: 'cek-keaslian-stiker-qris',
    title: 'Cara Cek Rutin Keamanan & Keaslian Stiker QRIS',
    subtitle: 'Kebiasaan 30 detik setiap pagi untuk memastikan stiker QRIS warung tidak ditukar atau ditimpa.',
    topic: 'Keamanan Transaksi',
    durationMinutes: 2,
    xpReward: 50,
    conceptTitle: 'Lindungi Pintu Masuk Uang Digital Toko Anda',
    conceptDescription:
      'Stiker QRIS di meja kasir adalah pintu masuk uang penjualan Anda. Penipuan penempelan stiker QR palsu biasanya terjadi saat kasir lengah atau di luar jam buka toko. Pemeriksaan fisik rutin setiap pagi sangat efektif mencegah kerugian.',
    benefits: [
      {
        title: 'Deteksi Dini Stiker Palsu',
        desc: 'Langsung ketahuan jika ada stiker asing menempel di atas kode QR asli.',
        iconType: 'shield',
      },
      {
        title: 'Cukup 30 Detik Tiap Pagi',
        desc: 'Mudah dijadikan rutinitas saat membuka pintu warung atau lap meja kasir.',
        iconType: 'speed',
      },
      {
        title: 'Uang Pasti Masuk Rekening Sendiri',
        desc: 'Menjamin setiap pemindaian pembeli mengarah ke rekening usaha Anda.',
        iconType: 'wallet',
      },
    ],
    practicalStepsTitle: '3 Cek Fisik Stiker QRIS Setiap Buka Toko',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Raba Permukaan Kode QR',
        description:
          'Usap bagian kotak kode QR. Jika terasa ada lapisan kertas atau stiker baru yang menumpuk, segera periksa dan kelupas.',
        badge: 'Raba Rutin',
        iconType: 'hand',
      },
      {
        stepNumber: 2,
        title: 'Cocokkan NMID & Nama Toko',
        description:
          'Periksa nama warung dan kode NMID yang tercetak di bawah kode QRIS masih sama dengan data pendaftaran resmi Anda.',
        badge: 'Cek NMID',
        iconType: 'eye',
      },
      {
        stepNumber: 3,
        title: 'Tes Scan Sekali Jika Ragu',
        description:
          'Jika merasa posisi stiker berubah, arahkan kamera aplikasi pembayaran Anda sendiri untuk memastikan nama penerima yang muncul benar.',
        badge: 'Uji Mandiri',
        iconType: 'shield',
      },
    ],
    goldenRule: {
      title: 'Lap & Cek Stiker Sebelum Melayani Pembeli Pertama',
      description:
        'Jadikan pengecekan stiker QRIS bagian dari rutinitas bersih-bersih meja kasir setiap pagi.',
      warningNote: 'Jangan membiarkan orang tidak dikenal menempelkan materi promosi di dekat kode QRIS Anda.',
    },
    contentMd: 'Periksa permukaan stiker QRIS setiap pagi dengan meraba kode QR, mencocokkan nama toko & NMID, dan melakukan tes scan bila curiga.',
    quiz: [
      {
        id: 'q1',
        question: 'Kapan waktu terbaik melakukan pemeriksaan fisik stiker QRIS di warung?',
        options: [
          'Setiap pagi saat membuka toko sebelum melayani pembeli pertama',
          'Setahun sekali',
          'Hanya saat stiker sobek parah',
        ],
        correctOptionIndex: 0,
        explanation: 'Mengecek setiap pagi memastikan stiker aman sebelum transaksi hari itu dimulai.',
      },
      {
        id: 'q2',
        question: 'Apa tanda fisik jika stiker QRIS Anda kemungkinan ditimpa stiker palsu?',
        options: [
          'Terdapat lapisan kertas tambahan yang menumpuk atau tepian stiker tidak rata saat diraba',
          'Warnanya tampak bersih dan mengkilap',
          'Terletak di samping kalkulator',
        ],
        correctOptionIndex: 0,
        explanation: 'Meraba permukaan stiker dengan jari mudah mendeteksi adanya tempelan stiker baru di atas stiker lama.',
      },
      {
        id: 'q3',
        question: 'Apa yang bisa dilakukan jika Anda ragu apakah kode QRIS masih mengarah ke rekening toko Anda?',
        options: [
          'Mencoba scan memakai aplikasi pembayaran Anda sendiri untuk melihat nama toko yang muncul',
          'Membuang meja kasir',
          'Meminjamkan ponsel ke pembeli',
        ],
        correctOptionIndex: 0,
        explanation: 'Melakukan uji scan mandiri langsung memperlihatkan nama merchant tujuan sebelum tombol bayar ditekan.',
      },
      {
        id: 'q4',
        question: 'Identitas apa yang tercetak resmi di stiker QRIS di bawah nama toko?',
        options: [
          'Kode NMID (National Merchant ID)',
          'PIN ATM pemilik toko',
          'Password email toko',
        ],
        correctOptionIndex: 0,
        explanation: 'Setiap merchant QRIS resmi memiliki kode NMID unik yang tercetak pada stiker.',
      },
      {
        id: 'q5',
        question: 'Jika menemukan stiker palsu menempel di papan QRIS warung, tindakan pertama yang harus dilakukan adalah?',
        options: [
          'Membiarkannya agar tidak repot',
          'Segera melepas stiker palsu tersebut dan memastikan kode QR asli tidak rusak',
          'Tetap menerima pembayaran dari stiker palsu itu',
        ],
        correctOptionIndex: 1,
        explanation: 'Stiker palsu harus segera dilepas agar pembayaran pembeli tidak masuk ke rekening pelaku penipuan.',
      },
    ],
  },
  {
    id: 'atur-modal-dan-keuntungan',
    title: 'Hitung Untung Bersih Harian dari Mutasi QRIS',
    subtitle: 'Cara sederhana memisahkan modal kulakan, biaya operasional, dan laba bersih dari laporan QRIS.',
    topic: 'Manajemen Keuangan',
    durationMinutes: 3,
    xpReward: 60,
    conceptTitle: 'Omzet Ramai Belum Tentu Untung Besar Jika Tidak Dihitung',
    conceptDescription:
      'Banyak pedagang merasa jualannya laris tetapi uangnya habis tanpa bekas. Dengan melihat total uang masuk QRIS di aplikasi, Anda bisa langsung menyisihkan dana untuk belanja stok besok dan menghitung berapa keuntungan bersih hari ini.',
    benefits: [
      {
        title: 'Modal Kulakan Terjaga',
        desc: 'Uang belanja stok tidak terpakai untuk pengeluaran rumah tangga mendadak.',
        iconType: 'wallet',
      },
      {
        title: 'Tahu Laba Sebenarnya',
        desc: 'Memudahkan melihat apakah penjualan minggu ini naik atau turun.',
        iconType: 'receipt',
      },
      {
        title: 'Lebih Tenang Mengatur Kas',
        desc: 'Keputusan menambah barang dagangan jadi lebih terukur.',
        iconType: 'shield',
      },
    ],
    practicalStepsTitle: '3 Langkah Hitung Untung Harian dalam 3 Menit',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Catat Total Pemasukan Tunai + QRIS',
        description:
          'Jumlahkan uang tunai di laci kasir (dikurangi modal kembalian pagi) dengan total mutasi QRIS hari ini.',
        badge: 'Gabung Omzet',
        iconType: 'receipt',
      },
      {
        stepNumber: 2,
        title: 'Sisihkan Pos Modal Belanja Besok',
        description:
          'Langsung pisahkan porsi uang modal barang yang terjual agar stok warung besok tetap aman terpenuhi.',
        badge: 'Amankan Modal',
        iconType: 'wallet',
      },
      {
        stepNumber: 3,
        title: 'Catat Sisa sebagai Laba & Tabungan Usaha',
        description:
          'Selisih setelah dikurangi modal dan biaya (plastik, bensin, listrik) adalah keuntungan bersih yang sebagian bisa ditabung.',
        badge: 'Sisih Untung',
        iconType: 'shield',
      },
    ],
    goldenRule: {
      title: 'Jangan Pernah Memakan Uang Modal Dagang',
      description:
        'Gunakan hanya bagian keuntungan bersih untuk kebutuhan pribadi, bukan seluruh uang penjualan yang masuk di rekening QRIS.',
      warningNote: 'Pisahkan rekening atau catatan antara uang modal toko dan uang rumah tangga.',
    },
    contentMd: 'Gabungkan pemasukan tunai dan mutasi QRIS setiap sore, sisihkan modal kulakan besok terlebih dahulu, lalu catat sisanya sebagai laba bersih.',
    quiz: [
      {
        id: 'q1',
        question: 'Apa langkah pertama menghitung pemasukan harian toko yang memakai tunai dan QRIS?',
        options: [
          'Hanya menghitung uang kertas di laci saja',
          'Menjumlahkan pemasukan tunai bersih dengan total mutasi QRIS masuk hari itu',
          'Menghitung perkiraan kira-kira saja',
        ],
        correctOptionIndex: 1,
        explanation: 'Menggabungkan tunai dan QRIS memberikan gambaran omzet toko yang sebenarnya.',
      },
      {
        id: 'q2',
        question: 'Mengapa uang modal barang yang terjual harus segera dipisahkan dari laba bersih?',
        options: [
          'Agar toko selalu punya dana untuk kulakan stok besok',
          'Supaya uang cepat habis',
          'Agar tidak perlu berjualan lagi',
        ],
        correctOptionIndex: 0,
        explanation: 'Jika uang modal ikut terpakai untuk kebutuhan pribadi, stok barang toko akan menyusut.',
      },
      {
        id: 'q3',
        question: 'Uang mana yang aman dipakai untuk kebutuhan rumah tangga pemilik warung?',
        options: [
          'Seluruh omzet penjualan hari itu',
          'Bagian dari keuntungan bersih setelah dikurangi modal dan biaya operasional',
          'Uang kembalian awal di laci kasir',
        ],
        correctOptionIndex: 1,
        explanation: 'Mengambil dari laba bersih menjaga kelangsungan modal usaha.',
      },
      {
        id: 'q4',
        question: 'Bagaimana QRIS membantu pedagang dalam menghitung pemasukan harian?',
        options: [
          'Mutasi masuk tercatat otomatis beserta jam dan nominalnya di aplikasi',
          'Menghapus seluruh pengeluaran toko',
          'Mengganti harga barang secara acak',
        ],
        correctOptionIndex: 0,
        explanation: 'Riwayat transaksi digital mempermudah rekap karena setiap rupiah tercatat otomatis.',
      },
      {
        id: 'q5',
        question: 'Apa contoh biaya operasional warung yang perlu ikut diperhitungkan saat menghitung laba bersih?',
        options: [
          'Biaya kantong plastik, listrik warung, atau ongkos angkut barang',
          'Harga beli HP pembeli',
          'Pajak kendaraan tetangga',
        ],
        correctOptionIndex: 0,
        explanation: 'Biaya operasional harian harus dikurangkan dari omzet kotor untuk mengetahui laba bersih.',
      },
    ],
  },
  {
    id: 'layani-pembeli-lansia-pemula',
    title: 'Membantu Pembeli Baru Mencoba Bayar Pakai QRIS',
    subtitle: 'Panduan sabar dan ramah membimbing pembeli yang baru pertama kali memindai QRIS di toko Anda.',
    topic: 'Pelayanan Pelanggan',
    durationMinutes: 2,
    xpReward: 40,
    conceptTitle: 'Penjual Ramah Bikin Pembeli Percaya Diri Pakai QRIS',
    conceptDescription:
      'Di daerah rural, masih banyak pembeli yang punya aplikasi dompet digital atau mobile banking tetapi belum terbiasa memindai QRIS. Bantuan singkat dan sopan dari kasir membuat mereka nyaman berbelanja lagi di toko Anda.',
    benefits: [
      {
        title: 'Pembeli Merasa Dihargai',
        desc: 'Pelayanan sabar membuat pelanggan senang dan loyal pada warung Anda.',
        iconType: 'shield',
      },
      {
        title: 'Makin Banyak Transaksi QRIS',
        desc: 'Pembeli yang terbantu sekali akan terbiasa memakai QRIS di kunjungan berikutnya.',
        iconType: 'speed',
      },
      {
        title: 'Minim Kesalahan Nominal',
        desc: 'Bimbingan singkat memastikan pembeli mengetik angka yang tepat.',
        iconType: 'receipt',
      },
    ],
    practicalStepsTitle: '3 Cara Ramah Membantu Pembeli Pemula',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Tunjukkan Letak Menu Scan / Bayar',
        description:
          'Arahkan dengan sopan tanpa memegang HP pembeli secara paksa: "Pilih tombol Scan atau QRIS di tengah bawah ya, Bu."',
        badge: 'Arahkan Sopan',
        iconType: 'eye',
      },
      {
        stepNumber: 2,
        title: 'Sebutkan Nominal dengan Jelas',
        description:
          'Bantu memastikan angka nol tidak kurang atau lebih saat mereka mengetik total belanjaan di layar ponselnya.',
        badge: 'Cek Angka',
        iconType: 'receipt',
      },
      {
        stepNumber: 3,
        title: 'Jaga Privasi Saat Pembeli Masukkan PIN',
        description:
          'Palingkan pandangan sejenak saat pembeli mengetik PIN pembayaran di ponselnya agar mereka merasa aman dan nyaman.',
        badge: 'Jaga Privasi',
        iconType: 'lock',
      },
    ],
    goldenRule: {
      title: 'Hormati Privasi PIN Pembeli',
      description:
        'Jangan pernah menanyakan atau mengintip PIN pembayaran pembeli saat membantu mereka belajar memakai QRIS.',
      warningNote: 'Cukup pandu arah tombolnya dan biarkan pembeli mengetik PIN sendiri.',
    },
    contentMd: 'Bimbing pembeli baru dengan sopan: tunjukkan menu Scan, sebutkan nominal dengan jelas, dan jaga privasi saat mereka memasukkan PIN.',
    quiz: [
      {
        id: 'q1',
        question: 'Apa sikap terbaik saat melihat pembeli bingung mencari tombol bayar QRIS di aplikasinya?',
        options: [
          'Menertawakan pembeli dan menyuruhnya pulang',
          'Membimbing dengan ramah dari dekat tanpa memaksa memegang ponselnya',
          'Menanyakan PIN ATM pembeli agar kasir yang membayarkan',
        ],
        correctOptionIndex: 1,
        explanation: 'Bimbingan yang sabar dan sopan membuat pembeli merasa nyaman dan terbantu.',
      },
      {
        id: 'q2',
        question: 'Apa yang harus dilakukan kasir ketika pembeli mulai mengetik PIN di ponselnya?',
        options: [
          'Memperhatikan jari pembeli dengan saksama',
          'Menjaga privasi dengan tidak mengintip layar saat PIN diketik',
          'Mencatat PIN pembeli di buku kasir',
        ],
        correctOptionIndex: 1,
        explanation: 'Menjaga privasi PIN membangun rasa aman dan kepercayaan pelanggan.',
      },
      {
        id: 'q3',
        question: 'Mengapa penting membantu pembeli pemula memastikan jumlah angka nol saat mengetik nominal?',
        options: [
          'Agar pembeli tidak salah bayar kurang atau kelebihan nominal',
          'Agar kuota internet cepat habis',
          'Supaya proses pembayaran jadi lebih lama',
        ],
        correctOptionIndex: 0,
        explanation: 'Salah satu kesalahan umum pemula adalah kurang atau kelebihan mengetik angka nol.',
      },
      {
        id: 'q4',
        question: 'Apa dampak positif bagi warung jika berhasil membiasakan pelanggan sekitar membayar dengan QRIS?',
        options: [
          'Warung lebih hemat waktu mencari uang kembalian di kunjungan berikutnya',
          'Pelanggan tidak mau datang lagi',
          'Stok barang langsung habis tanpa dibayar',
        ],
        correctOptionIndex: 0,
        explanation: 'Pelanggan yang sudah terbiasa memakai QRIS mempercepat proses transaksi selanjutnya.',
      },
      {
        id: 'q5',
        question: 'Jika pembeli belum punya saldo digital yang cukup, apa yang sebaiknya ditawarkan kasir?',
        options: [
          'Tetap ramah menawarkan pembayaran tunai sebagai pilihan lain',
          'Memarahi pembeli di depan antrean',
          'Meminta password akun pembeli',
        ],
        correctOptionIndex: 0,
        explanation: 'QRIS melengkapi pembayaran tunai; selalu sediakan opsi tunai dengan sikap ramah.',
      },
    ],
  },
  {
    id: 'atur-notifikasi-suara-kasir',
    title: 'Mengaktifkan Suara Notifikasi & Pembaca Nominal Masuk',
    subtitle: 'Atur ponsel kasir agar berbunyi nyaring setiap ada pembayaran QRIS berhasil.',
    topic: 'Penanganan Kendala',
    durationMinutes: 2,
    xpReward: 50,
    conceptTitle: 'Telinga Kasir Jadi Pengawas Otomatis',
    conceptDescription:
      'Saat tangan kasir sibuk membungkus belanjaan atau meracik pesanan, fitur suara notifikasi di ponsel membuat Anda langsung tahu uang sudah masuk tanpa harus terus-menerus menyentuh layar.',
    benefits: [
      {
        title: 'Tidak Perlu Bolak-Balik Buka HP',
        desc: 'Tangan tetap leluasa melayani pembeli sambil memantau pembayaran.',
        iconType: 'speed',
      },
      {
        title: 'Langsung Tahu Pembayaran Masuk',
        desc: 'Bunyi notifikasi khas menandakan transaksi sukses diterima.',
        iconType: 'bell',
      },
      {
        title: 'Kurangi Risiko Lupa Cek',
        desc: 'Suara pemberitahuan mengingatkan kasir sebelum barang diserahkan.',
        iconType: 'shield',
      },
    ],
    practicalStepsTitle: '3 Pengaturan Ponsel Kasir yang Wajib Dicek',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Matikan Mode Senyap (Silent / DND)',
        description:
          'Pastikan ponsel toko tidak dalam mode senyap atau Jangan Ganggu (Do Not Disturb) saat jam operasional warung.',
        badge: 'Suara Aktif',
        iconType: 'bell',
      },
      {
        stepNumber: 2,
        title: 'Izinkan Notifikasi Aplikasi Merchant',
        description:
          'Buka pengaturan ponsel bagian Aplikasi, lalu pastikan izin notifikasi dan suara untuk aplikasi merchant Anda dalam posisi Aktif.',
        badge: 'Izin Notifikasi',
        iconType: 'shield',
      },
      {
        stepNumber: 3,
        title: 'Aktifkan Fitur Suara Nominal Jika Tersedia',
        description:
          'Beberapa aplikasi merchant modern atau kotak suara QRIS memiliki fitur pembaca nominal otomatis ("Pembayaran diterima..."). Aktifkan agar makin aman.',
        badge: 'Suara Nominal',
        iconType: 'bell',
      },
    ],
    goldenRule: {
      title: 'Pastikan Baterai & Volume Ponsel Kasir Terjaga',
      description:
        'Ponsel kasir yang kehabisan baterai atau dalam mode hening membuat Anda kehilangan pemberitahuan uang masuk secara langsung.',
      warningNote: 'Jika ada keraguan meski bunyi terdengar, tetap cek angka di layar riwayat aplikasi.',
    },
    contentMd: 'Pastikan ponsel kasir tidak dalam mode senyap, aktifkan izin notifikasi aplikasi merchant, dan manfaatkan fitur suara nominal bila tersedia.',
    quiz: [
      {
        id: 'q1',
        question: 'Mengapa ponsel kasir tidak boleh dibiarkan dalam mode senyap (silent) saat warung buka?',
        options: [
          'Agar kasir langsung mendengar bunyi notifikasi saat pembayaran QRIS masuk',
          'Agar layar ponsel lebih terang',
          'Agar stiker QRIS tidak lepas',
        ],
        correctOptionIndex: 0,
        explanation: 'Suara notifikasi memberi tahu kasir secara seketika ketika transaksi berhasil.',
      },
      {
        id: 'q2',
        question: 'Jika notifikasi aplikasi merchant tidak pernah muncul di layar atas HP, apa yang perlu diperiksa?',
        options: [
          'Pengaturan izin notifikasi aplikasi tersebut di menu Setelan/Settings ponsel',
          'Warna casing ponsel',
          'Jumlah foto di galeri',
        ],
        correctOptionIndex: 0,
        explanation: 'Izin notifikasi yang belum aktif di setelan HP sering menyebabkan pemberitahuan tidak muncul.',
      },
      {
        id: 'q3',
        question: 'Apa keuntungan fitur pembaca suara nominal otomatis (soundbox/voice alert) di kasir?',
        options: [
          'Menyebutkan nominal rupiah yang masuk sehingga kasir tidak perlu mendekati layar untuk mendengar angkanya',
          'Menggantikan seluruh stok barang warung',
          'Menghapus riwayat transaksi',
        ],
        correctOptionIndex: 0,
        explanation: 'Pembaca suara nominal membantu kasir memastikan nominal yang dibayar sesuai tanpa menghentikan pekerjaan.',
      },
      {
        id: 'q4',
        question: 'Apa yang harus tetap dilakukan jika bunyi notifikasi terdengar tetapi Anda ingin memastikan angka pastinya?',
        options: [
          'Mengecek riwayat mutasi di layar aplikasi merchant Anda',
          'Mengabaikannya saja',
          'Meminta pembeli mentransfer ulang',
        ],
        correctOptionIndex: 0,
        explanation: 'Melihat langsung nominal pada aplikasi memastikan tidak ada salah ketik dari pembeli.',
      },
      {
        id: 'q5',
        question: 'Mode apa di ponsel yang sering membuat semua notifikasi suara tidak berbunyi tanpa disadari?',
        options: [
          'Mode Jangan Ganggu (Do Not Disturb) atau Mode Hening',
          'Mode Kecerahan Otomatis',
          'Mode Rotasi Layar',
        ],
        correctOptionIndex: 0,
        explanation: 'Mode Jangan Ganggu memblokir bunyi notifikasi masuk sehingga sebaiknya dimatikan saat berjualan.',
      },
    ],
  },
  {
    id: 'catat-transaksi-di-pindaiin',
    title: 'Cara Lapor Aktivitas QRIS & Kumpulkan Poin Hadiah',
    subtitle: 'Catat transaksi QRIS harian di Pindaiin untuk memantau perkembangan usaha dan tukar hadiah.',
    topic: 'Pengembangan Usaha',
    durationMinutes: 2,
    xpReward: 50,
    conceptTitle: 'Setiap Catatan Transaksi Bernilai Poin XP',
    conceptDescription:
      'Selain membantu Anda membiasakan pembukuan digital, melaporkan aktivitas transaksi QRIS di menu Aktivitas Pindaiin akan memberi tambahan poin XP, lencana prestasi, dan kesempatan menukar hadiah perlengkapan usaha.',
    benefits: [
      {
        title: 'Pantau Progres Mingguan',
        desc: 'Lihat perkembangan jumlah transaksi nontunai toko Anda dari waktu ke waktu.',
        iconType: 'receipt',
      },
      {
        title: 'Kumpulkan Poin XP Otomatis',
        desc: 'Setiap laporan aktivitas dan verifikasi memberi tambahan poin di buku besar.',
        iconType: 'wallet',
      },
      {
        title: 'Tukar Hadiah Usaha',
        desc: 'Poin yang terkumpul dapat ditukar dengan pulsa, stand akrilik, atau voucher.',
        iconType: 'shield',
      },
    ],
    practicalStepsTitle: '3 Langkah Lapor Aktivitas QRIS di Pindaiin',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Buka Menu Aktivitas di Bagian Bawah',
        description:
          'Setelah toko tutup atau di waktu senggang, buka tab Aktivitas pada aplikasi Pindaiin Anda.',
        badge: 'Menu Aktivitas',
        iconType: 'eye',
      },
      {
        stepNumber: 2,
        title: 'Isi Jumlah Transaksi QRIS Hari Ini',
        description:
          'Masukkan jumlah transaksi QRIS yang benar-benar masuk sesuai riwayat aplikasi merchant Anda hari tersebut.',
        badge: 'Isi Jujur',
        iconType: 'receipt',
      },
      {
        stepNumber: 3,
        title: 'Klaim Misi & Tukar Poin di Katalog Hadiah',
        description:
          'Cek menu Misi untuk melihat tantangan yang selesai, lalu tukarkan poin XP Anda di Katalog Hadiah.',
        badge: 'Raih Hadiah',
        iconType: 'wallet',
      },
    ],
    goldenRule: {
      title: 'Laporkan Data Sesuai Kenyataan di Kasir',
      description:
        'Pelaporan yang jujur membantu tim pendamping memahami kebutuhan nyata UMKM sekaligus menjaga akun Anda tetap terpercaya.',
      warningNote: 'Jangan memasukkan data rahasia seperti PIN atau saldo rekening saat melapor.',
    },
    contentMd: 'Laporkan jumlah transaksi QRIS harian di menu Aktivitas Pindaiin secara jujur untuk memantau progres dan mengumpulkan poin hadiah.',
    quiz: [
      {
        id: 'q1',
        question: 'Di menu mana pedagang melaporkan jumlah transaksi QRIS harian di aplikasi Pindaiin?',
        options: [
          'Menu Aktivitas',
          'Menu Keluar Akun',
          'Halaman Login',
        ],
        correctOptionIndex: 0,
        explanation: 'Menu Aktivitas disediakan khusus untuk mencatat dan melaporkan transaksi QRIS harian.',
      },
      {
        id: 'q2',
        question: 'Apa keuntungan rutin melaporkan aktivitas transaksi QRIS di Pindaiin?',
        options: [
          'Mendapatkan catatan perkembangan usaha sekaligus poin XP yang bisa ditukar hadiah',
          'Mengubah harga barang di warung secara otomatis',
          'Menghapus akun pelanggan',
        ],
        correctOptionIndex: 0,
        explanation: 'Pencatatan rutin membantu pembiasaan pembukuan dan memberi reward XP.',
      },
      {
        id: 'q3',
        question: 'Berdasarkan data apa jumlah transaksi harian sebaiknya dilaporkan?',
        options: [
          'Jumlah transaksi QRIS yang benar-benar tercatat masuk di aplikasi merchant Anda',
          'Angka tebakan acak',
          'Jumlah pengunjung yang hanya lewat depan toko',
        ],
        correctOptionIndex: 0,
        explanation: 'Data laporan harus sesuai kenyataan mutasi masuk agar akurat dan lolos verifikasi.',
      },
      {
        id: 'q4',
        question: 'Di mana poin XP yang sudah terkumpul dapat ditukarkan oleh pedagang?',
        options: [
          'Di menu Katalog Hadiah / Reward',
          'Di mesin cuci',
          'Di buku tulis biasa',
        ],
        correctOptionIndex: 0,
        explanation: 'Poin XP dapat ditukar dengan berbagai hadiah perlengkapan usaha di Katalog Hadiah.',
      },
      {
        id: 'q5',
        question: 'Data apa yang TIDAK boleh pernah dimasukkan atau dibagikan saat melaporkan aktivitas?',
        options: [
          'PIN, password mobile banking, atau kode OTP',
          'Tanggal transaksi',
          'Jumlah transaksi harian',
        ],
        correctOptionIndex: 0,
        explanation: 'PIN, password, dan OTP adalah data rahasia yang tidak pernah diminta oleh Pindaiin.',
      },
    ],
  },
  {
    id: 'jaga-akun-dan-data-pribadi',
    title: 'Lindungi Akun Toko dari Modus Penipuan Telepon & Link',
    subtitle: 'Kenali ciri-ciri penipu yang mengaku petugas bank atau aplikasi dan cara menolak dengan tegas.',
    topic: 'Keamanan Transaksi',
    durationMinutes: 3,
    xpReward: 60,
    conceptTitle: 'Waspada Tautan Palsu & Panggilan Mengaku Petugas',
    conceptDescription:
      'Penipu sering menelepon atau mengirim pesan WhatsApp dengan mengaku sebagai petugas bank, pengelola QRIS, atau panitia hadiah, lalu meminta kode OTP atau menyuruh menekan tautan (link) aneh. Menjaga kerahasiaan data adalah benteng utama saldo usaha Anda.',
    benefits: [
      {
        title: 'Saldo Usaha Tetap Aman',
        desc: 'Mencegah pengambilalihan akun dompet digital atau mobile banking toko.',
        iconType: 'shield',
      },
      {
        title: 'Kenali Ciri Penipuan',
        desc: 'Langsung sadar saat ada pesan mendesak atau iming-iming hadiah palsu.',
        iconType: 'bell',
      },
      {
        title: 'Berani Menolak & Blokir',
        desc: 'Tahu langkah cepat memutus komunikasi dengan pelaku penipuan.',
        iconType: 'shield',
      },
    ],
    practicalStepsTitle: '3 Aturan Anti Penipuan Telepon & Tautan',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Jangan Pernah Sebutkan Kode OTP SMS/WA',
        description:
          'Kode OTP berisi 4–6 angka yang masuk ke SMS atau WhatsApp adalah kunci masuk akun Anda. Siapa pun yang memintanya dipastikan berniat buruk.',
        badge: 'Rahasia Mutlak',
        iconType: 'lock',
      },
      {
        stepNumber: 2,
        title: 'Jangan Klik Tautan Mencurigakan',
        description:
          'Abaikan pesan berisi link pembaruan tarif QRIS, blokir rekening, atau pencairan hadiah mendadak dari nomor tak dikenal.',
        badge: 'Cek Sumber',
        iconType: 'eye',
      },
      {
        stepNumber: 3,
        title: 'Konfirmasi Hanya ke Nomor Resmi Bank',
        description:
          'Jika ragu, tutup teleponnya lalu hubungi langsung call center resmi bank atau datang ke kantor cabang terdekat.',
        badge: 'Jalur Resmi',
        iconType: 'shield',
      },
    ],
    goldenRule: {
      title: 'Petugas Resmi Tidak Pernah Meminta OTP & PIN',
      description:
        'Tidak ada alasan teknis apa pun yang membolehkan petugas meminta kode OTP, PIN, atau kata sandi akun Anda.',
      warningNote: 'Segera tutup telepon dan blokir nomor pengirim jika ada yang memaksa meminta OTP.',
    },
    contentMd: 'Lindungi akun usaha dengan tidak pernah membagikan kode OTP, tidak menekan tautan mencurigakan, dan hanya menghubungi call center resmi bank.',
    quiz: [
      {
        id: 'q1',
        question: 'Jika ada orang menelepon mengaku petugas bank dan meminta kode OTP SMS untuk "pembaruan QRIS", apa yang harus dilakukan?',
        options: [
          'Langsung membacakan kode OTP-nya',
          'Menolak tegas, tidak memberikan kode OTP, dan segera menutup telepon',
          'Mengirimkan foto KTP dan kartu ATM',
        ],
        correctOptionIndex: 1,
        explanation: 'Petugas resmi bank tidak pernah meminta kode OTP; itu adalah ciri pasti penipuan.',
      },
      {
        id: 'q2',
        question: 'Mengapa kita tidak boleh sembarangan menekan tautan (link) dari nomor WhatsApp tak dikenal?',
        options: [
          'Karena tautan palsu bisa mengarahkan ke halaman tiruan untuk mencuri data login dan saldo',
          'Karena membuat baterai penuh',
          'Karena stiker QRIS bisa hilang',
        ],
        correctOptionIndex: 0,
        explanation: 'Tautan phishing dirancang menyerupai situs resmi untuk mencuri kredensial akun korban.',
      },
      {
        id: 'q3',
        question: 'Jika menerima pesan ancaman bahwa akun QRIS akan diblokir hari ini jika tidak mengisi formulir lewat link, langkah paling aman adalah?',
        options: [
          'Mengabaikan link tersebut dan mengecek langsung melalui aplikasi resmi atau call center resmi bank',
          'Langsung mengisi PIN dan password di formulir tersebut',
          'Meneruskan link ke semua tetangga',
        ],
        correctOptionIndex: 0,
        explanation: 'Pelaku sering memakai kepanikan agar korban terburu-buru mengisi data rahasia.',
      },
      {
        id: 'q4',
        question: 'Siapa saja yang boleh mengetahui PIN mobile banking atau dompet digital usaha Anda?',
        options: [
          'Hanya pemilik akun yang berwenang, tidak boleh dibagikan ke siapa pun termasuk petugas',
          'Semua pembeli di warung',
          'Pengirim pesan WhatsApp tak dikenal',
        ],
        correctOptionIndex: 0,
        explanation: 'PIN dan kata sandi adalah kunci pribadi yang harus dijaga kerahasiaannya.',
      },
      {
        id: 'q5',
        question: 'Jika telanjur menekan link mencurigakan atau curiga akun diakses orang lain, apa tindakan cepat yang perlu dilakukan?',
        options: [
          'Segera ganti password/PIN melalui aplikasi resmi dan hubungi call center resmi bank/penyedia QRIS',
          'Membiarkannya sampai seminggu',
          'Mematikan lampu toko',
        ],
        correctOptionIndex: 0,
        explanation: 'Mengganti PIN/password dan melapor ke kanal resmi mencegah kerugian lebih lanjut.',
      },
    ],
  },
  {
    id: 'paket-hemat-dan-diskon-qris',
    title: 'Strategi Paket Hemat untuk Menarik Pembeli QRIS',
    subtitle: 'Cara kreatif membuat paket bundel atau promo kecil tanpa merugi agar pembeli suka bayar QRIS.',
    topic: 'Pengembangan Usaha',
    durationMinutes: 3,
    xpReward: 60,
    conceptTitle: 'Paket Bundel Bikin Pembeli Belanja Lebih Banyak Sekali Scan',
    conceptDescription:
      'Alih-alih menurunkan harga secara acak, buatlah paket hemat berisi 2–3 barang yang saling melengkapi (misalnya paket sarapan atau paket bumbu dapur) dengan harga pas yang mudah dibayar memakai QRIS.',
    benefits: [
      {
        title: 'Nilai Belanja Per Pembeli Naik',
        desc: 'Pembeli yang tadinya beli 1 barang tertarik mengambil paket sekalian.',
        iconType: 'wallet',
      },
      {
        title: 'Stok Barang Cepat Berputar',
        desc: 'Barang pelengkap yang jarang dilirik ikut terjual dalam paket.',
        iconType: 'speed',
      },
      {
        title: 'Harga Paket Tetap Untung',
        desc: 'Margin keuntungan tetap dihitung aman sebelum paket ditawarkan.',
        iconType: 'shield',
      },
    ],
    practicalStepsTitle: '3 Langkah Membuat Paket Hemat Warung',
    practicalSteps: [
      {
        stepNumber: 1,
        title: 'Pasangkan Produk Laris dan Pelengkap',
        description:
          'Contoh: Kopi saset + gorengan, atau beras 2 kg + minyak goreng, dengan harga paket yang jelas dan menarik.',
        badge: 'Paket Pas',
        iconType: 'wallet',
      },
      {
        stepNumber: 2,
        title: 'Hitung Modal agar Tetap Untung',
        description:
          'Pastikan harga paket tetap berada di atas total modal kulakan sehingga warung selalu mendapat laba.',
        badge: 'Cek Margin',
        iconType: 'receipt',
      },
      {
        stepNumber: 3,
        title: 'Pajang Poster Kecil di Dekat QRIS',
        description:
          'Tulis di kertas rapi dekat stiker QRIS: "Paket Hemat Pagi Rp15.000 — Bisa Bayar QRIS!" agar langsung terbaca pembeli.',
        badge: 'Pajang Jelas',
        iconType: 'eye',
      },
    ],
    goldenRule: {
      title: 'Promo Harus Tetap Menghasilkan Laba',
      description:
        'Jangan membuat potongan harga yang lebih besar dari keuntungan barang; fokuslah pada paket nilai tambah.',
      warningNote: 'Harga promo berlaku sama adilnya baik untuk pembayaran tunai maupun QRIS.',
    },
    contentMd: 'Buat paket hemat berisi produk laris dan pelengkap dengan perhitungan modal yang aman, lalu pajang infonya di dekat stiker QRIS.',
    quiz: [
      {
        id: 'q1',
        question: 'Apa tujuan utama membuat paket hemat (bundling) di warung?',
        options: [
          'Meningkatkan jumlah barang yang dibeli pelanggan dalam satu kali transaksi dengan tetap menjaga untung',
          'Menghabiskan modal usaha secepatnya',
          'Membuat pembeli bingung memilih barang',
        ],
        correctOptionIndex: 0,
        explanation: 'Paket bundel mendorong pembeli mengambil lebih banyak produk sekaligus mempercepat perputaran stok.',
      },
      {
        id: 'q2',
        question: 'Sebelum menentukan harga paket hemat, hal apa yang wajib dihitung terlebih dahulu?',
        options: [
          'Total harga modal seluruh barang dalam paket agar harga jual tetap menghasilkan laba',
          'Harga barang di luar negeri',
          'Jumlah kendaraan yang lewat',
        ],
        correctOptionIndex: 0,
        explanation: 'Menghitung modal memastikan promo tidak membuat warung merugi.',
      },
      {
        id: 'q3',
        question: 'Di mana posisi paling strategis menaruh info tulisan Paket Hemat agar langsung terlihat saat membayar?',
        options: [
          'Di meja kasir dekat stiker QRIS yang mudah dibaca pembeli',
          'Di dalam gudang belakang yang terkunci',
          'Di bawah keset pintu',
        ],
        correctOptionIndex: 0,
        explanation: 'Meja kasir adalah titik fokus mata pembeli saat mengantre dan membayar.',
      },
      {
        id: 'q4',
        question: 'Contoh pasangan produk yang cocok dijadikan Paket Hemat di warung makan/kelontong adalah?',
        options: [
          'Minuman kopi + camilan/gorengan atau paket bumbu dapur lengkap',
          'Barang yang sudah kedaluwarsa',
          'Satu butir permen saja',
        ],
        correctOptionIndex: 0,
        explanation: 'Produk yang saling melengkapi kebutuhan sehari-hari paling diminati pembeli.',
      },
      {
        id: 'q5',
        question: 'Bagaimana sikap yang benar dalam menerapkan harga paket promo bagi pembeli tunai dan QRIS?',
        options: [
          'Memberlakukan harga promo yang adil tanpa membebankan biaya tambahan khusus untuk QRIS',
          'Menaikkan harga khusus untuk pembeli QRIS',
          'Menolak pembeli yang memakai QRIS',
        ],
        correctOptionIndex: 0,
        explanation: 'Harga yang adil dan tanpa biaya tambahan menjaga kepuasan pelanggan QRIS.',
      },
    ],
  },
];

export function evaluateQuiz(
  quiz: QuizQuestion[],
  userAnswers: Record<string, number>
): {
  score: number;
  totalQuestions: number;
  passed: boolean;
  correctCount: number;
} {
  let correctCount = 0;
  quiz.forEach((q) => {
    if (userAnswers[q.id] === q.correctOptionIndex) {
      correctCount += 1;
    }
  });

  const totalQuestions = quiz.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score >= 70; // Standar kelulusan kuis 70%

  return {
    score,
    totalQuestions,
    passed,
    correctCount,
  };
}

const STORAGE_KEY_LESSONS = 'digiumkm_lessons';

const LEGACY_LESSON_ID_MAP: Record<string, string> = {
  'd1111111-1111-1111-1111-111111111111': 'mengenal-qris-aman',
  'd2222222-2222-2222-2222-222222222222': 'waspada-penipuan-qris',
  'd3333333-3333-3333-3333-333333333333': 'kelola-keuangan-qris',
};

/**
 * Menghasilkan lessonId unik berformat slug yang rapi dan ramah URL dari judul modul.
 */
export function generateLessonId(title: string, existingIds: string[] = []): string {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/g, '');

  const prefix = baseSlug || 'modul-qris';
  if (!existingIds.includes(prefix)) {
    return prefix;
  }

  let counter = 2;
  while (existingIds.includes(`${prefix}-${counter}`)) {
    counter += 1;
  }
  return `${prefix}-${counter}`;
}

/**
 * Menggabungkan modul tersimpan dengan modul bawaan terbaru agar daftar di Admin dan Pusat Belajar selalu sinkron.
 */
export function mergeWithDefaultLessons(stored: LessonDetail[]): LessonDetail[] {
  const defaultMap = new Map(SAMPLE_LESSONS.map((s) => [s.id, s]));

  const normalized = stored.map((lesson) => {
    const mappedId = LEGACY_LESSON_ID_MAP[lesson.id];
    const currentId = mappedId || lesson.id;
    const sample = defaultMap.get(currentId);

    let updated = mappedId ? { ...lesson, id: mappedId } : lesson;
    // Jika modul bawaan masih punya soal kuis lebih sedikit (misal 2 soal dari versi lama), lengkapi ke 5 soal
    if (sample && (!updated.quiz || updated.quiz.length < sample.quiz.length)) {
      const existingQuizIds = new Set((updated.quiz || []).map((q) => q.id));
      const extraQuizzes = sample.quiz.filter((q) => !existingQuizIds.has(q.id));
      updated = {
        ...updated,
        quiz: [...(updated.quiz || []), ...extraQuizzes].slice(0, sample.quiz.length),
      };
    }
    return updated;
  });

  const existingIds = new Set(normalized.map((l) => l.id));
  const missingDefaults = SAMPLE_LESSONS.filter((sample) => !existingIds.has(sample.id));
  return [...normalized, ...missingDefaults];
}

/**
 * Mengambil daftar modul belajar dari penyimpanan lokal dengan sinkronisasi SAMPLE_LESSONS.
 */
export function getStoredLessons(): LessonDetail[] {
  if (typeof window === 'undefined') {
    return SAMPLE_LESSONS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LESSONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = mergeWithDefaultLessons(parsed);
        const changed =
          merged.length !== parsed.length ||
          parsed.some((l, i) => l.id !== merged[i]?.id || (l.quiz?.length || 0) !== (merged[i]?.quiz?.length || 0));
        if (changed) {
          localStorage.setItem(STORAGE_KEY_LESSONS, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch {
    // Abaikan jika parsing gagal
  }
  return SAMPLE_LESSONS;
}

/**
 * Menyimpan daftar modul belajar ke penyimpanan lokal dan menyiarkan pembaruan.
 */
export function saveStoredLessons(lessons: LessonDetail[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_LESSONS, JSON.stringify(lessons));
    window.dispatchEvent(new Event('digiumkm_lessons_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {
    // Abaikan jika kuota penyimpanan penuh
  }
}
