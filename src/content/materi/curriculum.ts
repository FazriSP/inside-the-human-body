import {
  CurriculumModuleSchema,
  type CurriculumModule,
} from '@/content/schema/kuis.schema';

const RAW_CURRICULUM_MODULES: CurriculumModule[] = [
  // ============================================================================
  // MODUL 1: SISTEM RANGKA
  // ============================================================================
  {
    id: 'modul-rangka',
    sistem: 'rangka',
    judulModul: 'Sistem Rangka & Sendi',
    capaianPembelajaran:
      'Memahami pembagian tulang rangka tubuh, jenis persendian, dan perannya dalam gerak serta perlindungan organ.',
    estimasiMenit: 10,
    subChapters: [
      {
        id: 'bab-rangka-1-aksial',
        kodeBab: '1.1',
        judul: 'Rangka Aksial (Sumbu Tubuh)',
        subjudulLatin: 'Skeleton axiale',
        ringkasanKonsep:
          'Rangka aksial terdiri atas 80 tulang yang membentuk sumbu utama tubuh untuk melindungi otak, sumsum saraf, jantung, dan paru-paru.',
        poinKunci: [
          'Tengkorak disatukan oleh sendi mati (sutura) untuk melindungi otak.',
          'Rahang bawah (mandibula) adalah satu-satunya tulang wajah yang bebas bergerak.',
          'Tulang dada (sternum) dan 12 pasang rusuk membentuk sangkar pelindung organ dada.',
        ],
        aplikasiKlinis:
          'Tulang rawan rusuk yang lentur memungkinkan kompresi dada aman saat pertolongan RJP (CPR).',
        relatedStructureIds: [
          'tulang-dahi',
          'tulang-ubun-ubun',
          'tulang-rahang-bawah',
          'ruas-leher-atlas-axis',
          'tulang-dada',
          'tulang-rusuk-sejati',
        ],
        deepLinkSimulasi: 'mekanisme-pernapasan',
      },
      {
        id: 'bab-rangka-2-apendikular',
        kodeBab: '1.2',
        judul: 'Rangka Apendikular (Alat Gerak)',
        subjudulLatin: 'Skeleton appendiculare',
        ringkasanKonsep:
          'Rangka apendikular mencakup 126 tulang bahu, panggul, lengan, dan tungkai yang bekerja sebagai pengungkit saat kita bergerak.',
        poinKunci: [
          'Gelang bahu memberi ruang gerak sangat luas bagi lengan.',
          'Lengan bawah memiliki tulang pengumpil (radius) dan hasta (ulna) untuk memutar tangan.',
          'Tulang paha (femur) adalah tulang terkuat dan terpanjang yang menopang berat badan.',
        ],
        aplikasiKlinis:
          'Sumsum tulang merah di dalam tulang paha, tulang lengan, dan tulang dada memproduksi sel darah merah baru.',
        relatedStructureIds: [
          'tulang-selangka-belikat',
          'tulang-lengan',
          'gelang-panggul',
          'tulang-tungkai-bawah',
        ],
      },
      {
        id: 'bab-rangka-3-persendian',
        kodeBab: '1.3',
        judul: 'Jenis Sendi dan Arah Gerak',
        subjudulLatin: 'Articulationes',
        ringkasanKonsep:
          'Sendi menghubungkan dua tulang atau lebih dan dilengkapi cairan pelumas sinovial agar tulang dapat bergerak tanpa bergesekan kasar.',
        poinKunci: [
          'Sendi Putar: Tulang leher Atlas & Aksis memungkinkan kepala menoleh ke kiri dan kanan.',
          'Sendi Peluru: Sendi bahu dan pinggul memungkinkan gerak bebas ke segala arah.',
          'Sendi Engsel: Sendi siku dan lutut bergerak satu arah seperti engsel pintu.',
        ],
        aplikasiKlinis:
          'Berkurangnya cairan sinovial atau menipisnya tulang rawan memicu nyeri sendi (osteoartritis).',
        relatedStructureIds: [
          'ruas-leher-atlas-axis',
          'tulang-selangka-belikat',
          'tulang-lengan',
          'tulang-tungkai-bawah',
        ],
      },
    ],
    glosarium: [
      {
        istilahID: 'Sutura',
        istilahLatin: 'Sutura cranii',
        definisi:
          'Sendi mati bergerigi yang menyatukan tulang-tulang tengkorak secara rapat.',
        structureId: 'tulang-ubun-ubun',
      },
      {
        istilahID: 'Sendi Putar Leher',
        istilahLatin: 'Articulatio atlantoaxialis',
        definisi:
          'Pertemuan tulang leher C1 (Atlas) dan C2 (Aksis) untuk gerakan memutar kepala.',
        structureId: 'ruas-leher-atlas-axis',
      },
      {
        istilahID: 'Rawan Kosta',
        istilahLatin: 'Cartilago costalis',
        definisi:
          'Tulang rawan elastis yang menyambungkan ujung tulang rusuk dengan tulang dada.',
        structureId: 'tulang-rusuk-sejati',
      },
      {
        istilahID: 'Asetabulum',
        istilahLatin: 'Acetabulum',
        definisi:
          'Lekuk sendi berbentuk mangkuk di tulang panggul tempat kepala tulang paha duduk.',
        structureId: 'gelang-panggul',
      },
    ],
  },

  // ============================================================================
  // MODUL 2: SISTEM PEREDARAN DARAH
  // ============================================================================
  {
    id: 'modul-peredaran-darah',
    sistem: 'peredaran-darah',
    judulModul: 'Sistem Peredaran Darah',
    capaianPembelajaran:
      'Memahami cara kerja 4 ruang dan katup jantung serta rute sirkulasi darah kecil dan besar di dalam tubuh.',
    estimasiMenit: 12,
    subChapters: [
      {
        id: 'bab-peredaran-1-ruang-katup',
        kodeBab: '2.1',
        judul: '4 Ruang Jantung & Katup Satu Arah',
        subjudulLatin: 'Camerae et Valvae cordis',
        ringkasanKonsep:
          'Jantung memiliki dua serambi (penerima darah) dan dua bilik (pemompa darah) dengan empat katup agar aliran darah selalu satu arah.',
        poinKunci: [
          'Jantung Kanan (Serambi & Bilik Kanan) memompa darah miskin oksigen menuju paru-paru.',
          'Jantung Kiri (Serambi & Bilik Kiri) memompa darah kaya oksigen ke seluruh tubuh dengan otot lebih tebal.',
          'Empat katup jantung menutup bergantian menciptakan bunyi detak "LUB–DUP" saat mencegah darah berbalik.',
        ],
        aplikasiKlinis:
          'Suara katup jantung yang bocor atau menyempit dapat didengar dokter lewat stetoskop sebagai bunyi murmur.',
        relatedStructureIds: [
          'serambi-kanan',
          'bilik-kanan',
          'serambi-kiri',
          'bilik-kiri',
          'katup-jantung',
        ],
        deepLinkOrganId: 'jantung',
        deepLinkSimulasi: 'detak-jantung',
      },
      {
        id: 'bab-peredaran-2-sirkulasi-ganda',
        kodeBab: '2.2',
        judul: 'Peredaran Darah Kecil & Besar',
        subjudulLatin: 'Circulatio duplex',
        ringkasanKonsep:
          'Darah manusia melewati jantung dua kali dalam satu siklus lengkap: ke paru-paru untuk mengambil oksigen, lalu ke seluruh tubuh.',
        poinKunci: [
          'Peredaran Kecil: Bilik Kanan → Arteri Pulmonalis → Paru-paru (ambil O₂) → Vena Pulmonalis → Serambi Kiri.',
          'Peredaran Besar: Bilik Kiri → Aorta → Seluruh Tubuh (beri O₂) → Vena Kava → Serambi Kanan.',
          'Arteri Pulmonalis membawa darah rendah O₂, sedangkan Vena Pulmonalis membawa darah tinggi O₂.',
        ],
        aplikasiKlinis:
          'Tekanan darah normal dewasa (~120/80 mmHg) diukur dari tekanan pompaan Bilik Kiri ke Aorta.',
        relatedStructureIds: [
          'aorta',
          'vena-kava',
          'pembuluh-pulmonal',
        ],
        deepLinkSimulasi: 'aliran-darah',
      },
      {
        id: 'bab-peredaran-3-koroner-konduksi',
        kodeBab: '2.3',
        judul: 'Listrik Jantung & Arteri Koroner',
        subjudulLatin: 'Systema conducens cordis',
        ringkasanKonsep:
          'Jantung berdetak otomatis berkat sinyal listrik alami dari Nodus SA, sementara Arteri Koroner menyuplai oksigen khusus bagi otot jantung.',
        poinKunci: [
          'Sinyal listrik mengalir berurutan: Nodus SA → Nodus AV → Berkas His → Serabut Purkinje.',
          'Arteri Koroner bercabang dari pangkal Aorta untuk memberi makan otot jantung agar terus memompa.',
        ],
        aplikasiKlinis:
          'Sumbatan plak lemak di Arteri Koroner menghambat suplai oksigen otot jantung dan memicu serangan jantung.',
        relatedStructureIds: [
          'arteri-koroner',
          'serambi-kanan',
          'bilik-kiri',
        ],
        deepLinkOrganId: 'jantung',
        deepLinkSimulasi: 'detak-jantung',
      },
    ],
    glosarium: [
      {
        istilahID: 'Miokardium',
        istilahLatin: 'Myocardium',
        definisi:
          'Lapisan otot tebal pembentuk dinding jantung, paling kuat pada bilik kiri.',
        structureId: 'bilik-kiri',
      },
      {
        istilahID: 'Nodus SA (Pacemaker)',
        istilahLatin: 'Nodus sinuatrialis',
        definisi:
          'Pemicu listrik alami di serambi kanan yang mengatur kecepatan detak jantung.',
        structureId: 'serambi-kanan',
      },
      {
        istilahID: 'Aorta',
        istilahLatin: 'Arcus aortae',
        definisi:
          'Pembuluh arteri utama terbesar yang menyalurkan darah kaya oksigen ke seluruh tubuh.',
        structureId: 'aorta',
      },
      {
        istilahID: 'Arteri Koroner',
        istilahLatin: 'Arteriae coronariae',
        definisi:
          'Pembuluh darah kecil di permukaan jantung yang mengalirkan oksigen ke otot jantung.',
        structureId: 'arteri-koroner',
      },
    ],
  },

  // ============================================================================
  // MODUL 3: SISTEM PERNAPASAN
  // ============================================================================
  {
    id: 'modul-pernapasan',
    sistem: 'pernapasan',
    judulModul: 'Sistem Pernapasan',
    capaianPembelajaran:
      'Memahami alur saluran napas, mekanisme napas dada dan perut, serta pertukaran oksigen dan karbon dioksida di paru-paru.',
    estimasiMenit: 10,
    subChapters: [
      {
        id: 'bab-pernapasan-1-saluran-konduksi',
        kodeBab: '3.1',
        judul: 'Hidung, Laring, dan Trakea',
        subjudulLatin: 'Tractus respiratorius',
        ringkasanKonsep:
          'Saluran pernapasan atas menyaring debu, menghangatkan udara, serta mencegah makanan masuk ke paru-paru sebelum udara tiba di bronkus.',
        poinKunci: [
          'Lendir dan bulu halus di rongga hidung menangkap debu serta menghangatkan udara luar.',
          'Katup Epiglotis di laring otomatis menutup saluran napas setiap kali kita menelan makanan.',
          'Cincin tulang rawan huruf C menjaga saluran trakea tetap terbuka dan tidak kempis.',
        ],
        aplikasiKlinis:
          'Silia (rambut getar halus) di trakea terus mendorong debu dan lendir ke atas agar bisa dibatukkan keluar.',
        relatedStructureIds: [
          'rongga-hidung',
          'epiglotis-laring',
          'trakea',
          'percabangan-bronkus',
        ],
        deepLinkOrganId: 'laring',
      },
      {
        id: 'bab-pernapasan-2-lobus-alveolus',
        kodeBab: '3.2',
        judul: 'Paru-paru & Pertukaran Gas Alveolus',
        subjudulLatin: 'Pulmones et Alveoli',
        ringkasanKonsep:
          'Paru-paru kanan terdiri atas 3 lobus dan paru-paru kiri 2 lobus (memberi ruang bagi jantung). Jutaan kantung alveolus menjadi tempat masuknya O₂ ke darah.',
        poinKunci: [
          'Dinding alveolus sangat tipis sehingga oksigen (O₂) cepat berdifusi ke pembuluh kapiler.',
          'Cairan surfaktan melapisi alveolus agar kantung udara tidak kempis saat mengembuskan napas.',
          'Karbon dioksida (CO₂) berpindah dari darah menuju alveolus untuk diembuskan ke luar tubuh.',
        ],
        aplikasiKlinis:
          'Pada radang paru-paru (pneumonia), cairan menumpuk di alveolus sehingga kadar oksigen darah menurun.',
        relatedStructureIds: [
          'paru-paru-kanan',
          'paru-paru-kiri',
          'percabangan-bronkus',
        ],
        deepLinkOrganId: 'paru-paru',
      },
      {
        id: 'bab-pernapasan-3-ventilasi',
        kodeBab: '3.3',
        judul: 'Pernapasan Dada vs Perut',
        subjudulLatin: 'Inspiratio et Expiratio',
        ringkasanKonsep:
          'Udara masuk saat volume rongga dada membesar dan tekanan paru turun (inspirasi), lalu keluar saat otot berelaksasi (ekspirasi).',
        poinKunci: [
          'Pernapasan Perut: Otot diafragma berkontraksi dan mendatar turun sehingga paru-paru mengembang vertikal.',
          'Pernapasan Dada: Otot antartulang rusuk mengangkat tulang rusuk dan tulang dada sehingga rongga dada melebar.',
          'Dalam keadaan santai, sekali napas manusia menghirup sekitar 500 mL udara (volume tidal).',
        ],
        aplikasiKlinis:
          'Pernapasan perut (diafragma) paling hemat energi saat istirahat atau menenangkan detak jantung.',
        relatedStructureIds: [
          'paru-paru-kanan',
          'paru-paru-kiri',
          'tulang-rusuk-sejati',
          'tulang-dada',
        ],
        deepLinkOrganId: 'trakea',
        deepLinkSimulasi: 'mekanisme-pernapasan',
      },
    ],
    glosarium: [
      {
        istilahID: 'Karina Trakea',
        istilahLatin: 'Carina tracheae',
        definisi:
          'Titik percabangan trakea menjadi bronkus utama kanan dan kiri di bagian dada atas.',
        structureId: 'trakea',
      },
      {
        istilahID: 'Insisura Kardiaka',
        istilahLatin: 'Incisura cardiaca',
        definisi:
          'Lekukan pada paru-paru kiri yang menyediakan tempat bagi ujung jantung.',
        structureId: 'paru-paru-kiri',
      },
      {
        istilahID: 'Surfaktan',
        istilahLatin: 'Surfactans pulmonale',
        definisi:
          'Lapisan pelumas di dalam alveolus agar paru mudah mengembang saat menarik napas.',
        structureId: 'paru-paru-kanan',
      },
      {
        istilahID: 'Epiglotis',
        istilahLatin: 'Epiglottis',
        definisi:
          'Katup tulang rawan di laring yang menutup jalan napas ketika menelan makanan.',
        structureId: 'epiglotis-laring',
      },
    ],
  },
];

export const CURRICULUM_MODULES: readonly CurriculumModule[] =
  RAW_CURRICULUM_MODULES.map((item) => CurriculumModuleSchema.parse(item));
