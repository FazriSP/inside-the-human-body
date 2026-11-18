import {
  QuizQuestionSchema,
  type QuizQuestion,
} from '@/content/schema/kuis.schema';

const RAW_QUIZ_QUESTIONS: QuizQuestion[] = [
  // ============================================================================
  // A. PILIHAN GANDA (MULTIPLE CHOICE — 6 SOAL)
  // ============================================================================
  {
    id: 'pg-rangka-1',
    tipe: 'pilihan-ganda',
    sistem: 'rangka',
    tingkatKesulitan: 'dasar',
    pertanyaan:
      'Hubungan antara ruas tulang leher pertama (Atlas / C1) dan ruas tulang leher kedua (Aksis / C2) yang memungkinkan kepala menggeleng ke kiri dan ke kanan merupakan contoh dari...',
    targetStructureId: 'ruas-leher-atlas-axis',
    pilihan: [
      { id: 'sendi-putar', teks: 'Sendi Putar (Articulatio trochoidea)' },
      { id: 'sendi-engsel', teks: 'Sendi Engsel (Ginglymus)' },
      { id: 'sendi-peluru', teks: 'Sendi Peluru (Articulatio spheroidea)' },
      { id: 'sendi-mati', teks: 'Sendi Mati / Sutura (Synarthrosis)' },
    ],
    jawabanBenarId: 'sendi-putar',
    pembahasan:
      'Ruas Atlas (C1) berputar mengelilingi tonjolan dens milik Aksis (C2) sebagai poros putar, sehingga diklasifikasikan sebagai sendi putar (pivot joint).',
  },
  {
    id: 'pg-rangka-2',
    tipe: 'pilihan-ganda',
    sistem: 'rangka',
    tingkatKesulitan: 'menengah',
    pertanyaan:
      'Tulang pipa terpanjang dan terkuat pada tubuh manusia yang di bagian ujung bonggolnya (epifisis) mengandung sumsum merah penghasil sel darah merah adalah...',
    targetStructureId: 'tulang-tungkai-bawah',
    pilihan: [
      { id: 'femur', teks: 'Tulang Paha (Femur)' },
      { id: 'clavicula', teks: 'Tulang Selangka (Clavicula)' },
      { id: 'mandibula', teks: 'Tulang Rahang Bawah (Mandibula)' },
      { id: 'sternum', teks: 'Tulang Dada (Sternum)' },
    ],
    jawabanBenarId: 'femur',
    pembahasan:
      'Femur (tulang paha) adalah tulang pipa terbesar dan terkuat penopang beban tubuh, dengan rongga spongiosa epifisis yang aktif menjalankan hematopoiesis (pembentukan sel darah).',
  },
  {
    id: 'pg-peredaran-1',
    tipe: 'pilihan-ganda',
    sistem: 'peredaran-darah',
    tingkatKesulitan: 'dasar',
    pertanyaan:
      'Mengapa dinding otot miokardium pada Bilik Kiri (Ventriculus sinister) sekitar tiga kali lebih tebal dibandingkan dinding Bilik Kanan?',
    targetStructureId: 'bilik-kiri',
    pilihan: [
      {
        id: 'pompa-sistemik',
        teks: 'Bilik Kiri harus memompa darah bertekanan tinggi (~120 mmHg) ke seluruh tubuh melalui Aorta',
      },
      {
        id: 'tampung-vena',
        teks: 'Bilik Kiri menampung seluruh darah balik dari Vena Kava Superior dan Inferior',
      },
      {
        id: 'dekat-paru',
        teks: 'Bilik Kiri memompa darah kaya CO2 menuju paru-paru yang berjarak sangat dekat',
      },
      {
        id: 'pacu-jantung',
        teks: 'Bilik Kiri memuat Nodus Sinoatrial (SA Node) sebagai pusat pacu jantung',
      },
    ],
    jawabanBenarId: 'pompa-sistemik',
    pembahasan:
      'Bilik Kiri adalah pompa utama peredaran darah besar (sistemik) yang harus melawan tahanan pembuluh darah dari kepala hingga ujung kaki, sedangkan Bilik Kanan hanya memompa ke paru-paru di sebelahnya.',
  },
  {
    id: 'pg-peredaran-2',
    tipe: 'pilihan-ganda',
    sistem: 'peredaran-darah',
    tingkatKesulitan: 'analisis-klinis',
    pertanyaan:
      'Manakah pernyataan berikut yang BENAR mengenai kandungan gas darah di dalam pembuluh Arteri Pulmonalis dan Vena Pulmonalis pada orang dewasa sehat?',
    targetStructureId: 'pembuluh-pulmonal',
    pilihan: [
      {
        id: 'arteri-co2-vena-o2',
        teks: 'Arteri Pulmonalis membawa darah kaya CO2 ke paru-paru, sedangkan Vena Pulmonalis membawa darah kaya O2 ke Serambi Kiri',
      },
      {
        id: 'keduanya-o2',
        teks: 'Baik Arteri Pulmonalis maupun Vena Pulmonalis membawa darah kaya oksigen (HbO2)',
      },
      {
        id: 'arteri-o2-vena-co2',
        teks: 'Arteri Pulmonalis membawa darah kaya O2 dari Bilik Kiri, sedangkan Vena Pulmonalis membawa darah kaya CO2 ke Serambi Kanan',
      },
      {
        id: 'keduanya-co2',
        teks: 'Kedua pembuluh tersebut hanya mengangkut darah miskin oksigen menuju jaringan otot jantung',
      },
    ],
    jawabanBenarId: 'arteri-co2-vena-o2',
    pembahasan:
      'Definisi arteri adalah pembuluh yang keluar dari jantung (Bilik Kanan → Arteri Pulmonalis membawa darah miskin O2 ke paru-paru), sedangkan vena adalah pembuluh yang menuju jantung (Vena Pulmonalis membawa darah kaya O2 dari paru-paru ke Serambi Kiri).',
  },
  {
    id: 'pg-pernapasan-1',
    tipe: 'pilihan-ganda',
    sistem: 'pernapasan',
    tingkatKesulitan: 'menengah',
    pertanyaan:
      'Cincin tulang rawan hialin penyusun Trakea (batang tenggorokan) tidak melingkar penuh 360°, melainkan berbentuk huruf C yang terbuka di sisi belakang. Apa fungsi fisiologis struktur tersebut?',
    targetStructureId: 'trakea',
    pilihan: [
      {
        id: 'esofagus-menelan',
        teks: 'Memberi ruang bagi kerongkongan (esofagus) tepat di belakang trakea agar dapat mengembang saat menelan makanan',
      },
      {
        id: 'pertukaran-gas',
        teks: 'Memungkinkan difusi langsung gas O2 dan CO2 menembus dinding belakang trakea',
      },
      {
        id: 'pita-suara',
        teks: 'Menjadi tempat perlekatan pita suara untuk menghasilkan getaran fonasi',
      },
      {
        id: 'katup-makanan',
        teks: 'Melipat ke bawah untuk menutup saluran napas saat refleks batuk berlangsung',
      },
    ],
    jawabanBenarId: 'esofagus-menelan',
    pembahasan:
      'Dinding belakang trakea terdiri dari otot polos trakealis yang lentur (tanpa tulang rawan keras) sehingga bolus makanan di dalam esofagus di belakangnya dapat lewat dengan lancar.',
  },
  {
    id: 'pg-pernapasan-2',
    tipe: 'pilihan-ganda',
    sistem: 'pernapasan',
    tingkatKesulitan: 'analisis-klinis',
    pertanyaan:
      'Saat fase inspirasi pernapasan perut berlangsung, kontraksi otot diafragma menyebabkan kubah diafragma mendatar. Perubahan fisika apakah yang langsung memicu udara luar mengalir masuk ke alveolus?',
    targetStructureId: 'paru-paru-kanan',
    pilihan: [
      {
        id: 'boyle-turun',
        teks: 'Volume rongga toraks membesar sehingga tekanan intrapulmonal turun menjadi lebih rendah daripada tekanan udara atmosfer luar',
      },
      {
        id: 'boyle-naik',
        teks: 'Volume rongga toraks menyempit sehingga tekanan intrapulmonal melonjak di atas tekanan atmosfer',
      },
      {
        id: 'suhu-naik',
        teks: 'Suhu di dalam rongga hidung meningkat drastis sehingga menarik molekul nitrogen masuk',
      },
      {
        id: 'kolaps-bronkus',
        teks: 'Lempeng tulang rawan bronkus menutup rapat untuk memompa udara secara vakum',
      },
    ],
    jawabanBenarId: 'boyle-turun',
    pembahasan:
      'Sesuai Hukum Boyle (P1·V1 = P2·V2), peningkatan volume rongga dada saat diafragma mendatar menurunkan tekanan udara di dalam alveolus (~758 mmHg vs atmosfer 760 mmHg) sehingga udara mengalir masuk.',
  },

  // ============================================================================
  // B. TUNJUK PADA MODEL 3D (3D POINT-AND-CLICK CHALLENGE — 6 SOAL)
  // ============================================================================
  {
    id: 't3d-rangka-sternum',
    tipe: 'tunjuk-3d',
    sistem: 'rangka',
    tingkatKesulitan: 'dasar',
    modePanggung: 'tubuh-utuh',
    lapisanAktif: ['rangka'],
    targetStructureId: 'tulang-dada',
    kameraAwal: {
      position: [0, 1.32, 0.72],
      target: [0, 1.28, 0.02],
    },
    pertanyaan:
      'Tantangan Tunjuk 3D: Klik langsung pada Tulang Dada (Sternum) — tulang pipih di garis tengah depan dada tempat melekatnya tulang rawan rusuk sejati!',
    petunjukVisual:
      'Perhatikan garis tengah bagian depan sangkar tulang rusuk pada model 3D di tengah layar, lalu klik tulang pipih vertikal tersebut.',
    pembahasan:
      'Tepat! Tulang Dada (Sternum) berada di garis tengah anterior toraks (terdiri atas manubrium, korpus, dan prosesus xifoideus) dan melindungi jantung di belakangnya.',
  },
  {
    id: 't3d-rangka-bahu',
    tipe: 'tunjuk-3d',
    sistem: 'rangka',
    tingkatKesulitan: 'menengah',
    modePanggung: 'tubuh-utuh',
    lapisanAktif: ['rangka'],
    targetStructureId: 'tulang-selangka-belikat',
    kameraAwal: {
      position: [0.18, 1.38, 0.72],
      target: [0, 1.34, 0],
    },
    pertanyaan:
      'Tantangan Tunjuk 3D: Klik langsung pada struktur Gelang Bahu (Tulang Selangka / Clavicula atau Tulang Belikat / Scapula) pada model 3D!',
    petunjukVisual:
      'Cari tulang melengkung horizontal di atas rusuk pertama (antara leher dan pangkal lengan atas) atau lempeng tulang segitiga di punggung atas.',
    pembahasan:
      'Benar! Gelang bahu (Clavicula dan Scapula) menghubungkan tulang lengan atas (Humerus) dengan rangka aksial.',
  },
  {
    id: 't3d-peredaran-aorta',
    tipe: 'tunjuk-3d',
    sistem: 'peredaran-darah',
    tingkatKesulitan: 'dasar',
    modePanggung: 'tubuh-utuh',
    lapisanAktif: ['peredaran-darah'],
    targetStructureId: 'aorta',
    kameraAwal: {
      position: [0.08, 1.25, 0.64],
      target: [0, 1.22, 0],
    },
    pertanyaan:
      'Tantangan Tunjuk 3D: Klik langsung pada pembuluh Aorta (pembuluh nadi terbesar yang melengkung di atas jantung dan turun di sepanjang tulang belakang menuju perut)!',
    petunjukVisual:
      'Klik pembuluh arteri besar berwarna merah yang keluar dari atas jantung, melengkung (arkus aorta), atau batangnya yang memanjang turun ke rongga perut.',
    pembahasan:
      'Tepat! Aorta adalah arteri elastis terbesar tubuh yang menyalurkan darah kaya oksigen dari Bilik Kiri ke seluruh cabang peredaran darah sistemik.',
  },
  {
    id: 't3d-jantung-mitral',
    tipe: 'tunjuk-3d',
    sistem: 'peredaran-darah',
    tingkatKesulitan: 'analisis-klinis',
    modePanggung: 'isolasi-organ',
    organIsolasiId: 'jantung',
    lapisanAktif: ['peredaran-darah'],
    targetStructureId: 'katup-jantung',
    targetSubStructureId: 'jantung-katup-mitral',
    kameraAwal: {
      position: [0.18, 1.28, 0.62],
      target: [0, 1.22, 0],
    },
    pertanyaan:
      'Tantangan Isolasi Organ 3D: Pada model Jantung beresolusi tinggi ini, klik langsung pada Katup Bikuspidalis / Mitral (Valva mitralis) yang berada di antara Serambi Kiri dan Bilik Kiri!',
    petunjukVisual:
      'Gunakan Mode Sinar-X (sudah diaktifkan otomatis) dan klik cincin katup berwarna kuning-emas di sisi kiri jantung (antara ruang serambi kiri atas dan bilik kiri bawah).',
    pembahasan:
      'Luar biasa! Katup Bikuspidalis (Mitral) memiliki dua daun katup yang menjaga aliran darah kaya oksigen satu arah dari Serambi Kiri menuju Bilik Kiri.',
  },
  {
    id: 't3d-pernapasan-paru-kanan',
    tipe: 'tunjuk-3d',
    sistem: 'pernapasan',
    tingkatKesulitan: 'dasar',
    modePanggung: 'tubuh-utuh',
    lapisanAktif: ['pernapasan'],
    targetStructureId: 'paru-paru-kanan',
    kameraAwal: {
      position: [0, 1.32, 0.68],
      target: [0, 1.3, 0],
    },
    pertanyaan:
      'Tantangan Tunjuk 3D: Klik langsung pada Paru-paru Kanan (Pulmo dexter) yang memiliki 3 gelambir (lobus superior, medius, dan inferior)!',
    petunjukVisual:
      'Ingat posisi anatomis: sisi KANAN tubuh subjek berada di sebelah KIRI layar ketika Anda menatap model dari depan (anterior).',
    pembahasan:
      'Tepat sekali! Dalam posisi anatomis standar, Paru-paru Kanan berada di sisi kanan tubuh (kiri pengamat dari depan) dan terdiri atas 3 lobus.',
  },
  {
    id: 't3d-laring-epiglotis',
    tipe: 'tunjuk-3d',
    sistem: 'pernapasan',
    tingkatKesulitan: 'menengah',
    modePanggung: 'isolasi-organ',
    organIsolasiId: 'laring',
    lapisanAktif: ['pernapasan'],
    targetStructureId: 'epiglotis-laring',
    targetSubStructureId: 'laring-epiglotis',
    kameraAwal: {
      position: [0.22, 1.28, 0.64],
      target: [0, 1.22, 0],
    },
    pertanyaan:
      'Tantangan Isolasi Organ 3D: Pada model Laring ini, klik langsung pada Tulang Rawan Epiglotis (Cartilago epiglottica) yang berfungsi menutup jalan napas saat menelan!',
    petunjukVisual:
      'Klik struktur tulang rawan berbentuk daun berwarna kuning-emas yang menjulang paling atas di puncak rangka laring.',
    pembahasan:
      'Benar! Epiglotis adalah tulang rawan elastis berbentuk daun di puncak laring yang melipat menutup glotis saat kita menelan makanan.',
  },

  // ============================================================================
  // C. URUTKAN ALUR FISIOLOGIS (SEQUENCE ORDERING — 3 SOAL)
  // ============================================================================
  {
    id: 'urut-sirkulasi-pulmonal',
    tipe: 'urutkan-alur',
    sistem: 'peredaran-darah',
    tingkatKesulitan: 'menengah',
    targetStructureId: 'pembuluh-pulmonal',
    pertanyaan:
      'Urutkan tahapan Peredaran Darah Kecil (Sirkulasi Pulmonal) berikut ini secara kronologis mulai dari masuknya darah miskin oksigen ke jantung kanan hingga tiba di Serambi Kiri!',
    langkahUrut: [
      {
        id: 'step-1-vena-kava',
        label: 'Vena Kava Superior & Inferior bermuara ke Serambi Kanan',
      },
      {
        id: 'step-2-trikuspid-bilik',
        label: 'Darah melewati Katup Trikuspidalis masuk ke Bilik Kanan',
      },
      {
        id: 'step-3-arteri-pulmonalis',
        label: 'Bilik Kanan memompa darah melewati Katup Pulmonal ke Arteri Pulmonalis',
      },
      {
        id: 'step-4-kapiler-alveolus',
        label: 'Pertukaran gas (pelepasan CO2 & pengikatan O2) di Kapiler Alveolus Paru-paru',
      },
      {
        id: 'step-5-vena-pulmonalis',
        label: 'Darah kaya O2 mengalir melalui Vena Pulmonalis masuk ke Serambi Kiri',
      },
    ],
    pembahasan:
      'Alur Peredaran Darah Kecil dimulai dari Serambi Kanan → Katup Trikuspidalis → Bilik Kanan → Katup Pulmonal → Arteri Pulmonalis → Kapiler Alveolus Paru-paru → Vena Pulmonalis → Serambi Kiri.',
  },
  {
    id: 'urut-konduksi-jantung',
    tipe: 'urutkan-alur',
    sistem: 'peredaran-darah',
    tingkatKesulitan: 'analisis-klinis',
    targetStructureId: 'serambi-kanan',
    pertanyaan:
      'Urutkan jalur perambatan impuls listrik pada Sistem Konduksi Intrinsik Jantung dari pencetusan impuls pertama hingga kontraksi otot bilik (sistol ventrikel)!',
    langkahUrut: [
      {
        id: 'konduksi-1-sa',
        label: 'Nodus Sinoatrial (SA Node) di dinding atas Serambi Kanan mencetuskan impuls',
      },
      {
        id: 'konduksi-2-atrium',
        label: 'Impuls menyebar ke dinding Serambi Kanan & Kiri memicu sistol atrium',
      },
      {
        id: 'konduksi-3-av',
        label: 'Nodus Atrioventrikular (AV Node) menerima dan menjeda impuls sejenak',
      },
      {
        id: 'konduksi-4-his',
        label: 'Impuls melaju melalui Berkas His dan Cabang Berkas di Sekat Antarbilik',
      },
      {
        id: 'konduksi-5-purkinje',
        label: 'Serabut Purkinje merangsang kontraksi serentak miokardium Bilik Kanan & Kiri',
      },
    ],
    pembahasan:
      'Impuls detak jantung normal selalu merambat berurutan dari Nodus SA (pacemaker) → miokardium atrium → Nodus AV → Berkas His → Serabut Purkinje di dinding ventrikel.',
  },
  {
    id: 'urut-jalur-napas',
    tipe: 'urutkan-alur',
    sistem: 'pernapasan',
    tingkatKesulitan: 'dasar',
    targetStructureId: 'percabangan-bronkus',
    pertanyaan:
      'Urutkan saluran pernapasan manusia yang dilalui oleh udara inspirasi mulai dari masuknya udara luar hingga mencapai tempat difusi gas!',
    langkahUrut: [
      {
        id: 'napas-1-hidung',
        label: 'Rongga Hidung (penyaringan, penghangatan, dan pelembapan udara)',
      },
      {
        id: 'napas-2-faring-laring',
        label: 'Faring & Laring (melewati katup Epiglotis dan celah pita suara)',
      },
      {
        id: 'napas-3-trakea',
        label: 'Trakea / Batang Tenggorokan (cincin tulang rawan huruf C hingga Karina)',
      },
      {
        id: 'napas-4-bronkus',
        label: 'Bronkus Utama → Bronkus Lobaris → Bronkus Segmentalis',
      },
      {
        id: 'napas-5-alveolus',
        label: 'Bronkiolus → Kantung Alveolus (difusi gas O2 ke kapiler darah)',
      },
    ],
    pembahasan:
      'Udara inspirasi mengalir berurutan melalui Rongga Hidung → Faring → Laring → Trakea → Bronkus (Utama, Lobaris, Segmentalis) → Bronkiolus → Alveolus.',
  },
];

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = RAW_QUIZ_QUESTIONS.map(
  (item) => QuizQuestionSchema.parse(item),
);
