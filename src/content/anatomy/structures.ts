import {
  AnatomicalStructureSchema,
  type AnatomicalStructure,
} from '@/content/schema/anatomy.schema';

const RAW_STRUCTURES: AnatomicalStructure[] = [
  // ============================================================================
  // 1. SISTEM RANGKA (za-skeletal-full)
  // ============================================================================
  {
    id: 'tulang-dahi',
    namaID: 'Tulang Dahi',
    namaLatin: 'Os frontale',
    sistem: 'rangka',
    wilayah: 'kepala',
    lapisan: 'rangka',
    glbChunkId: 'za-skeletal-full',
    meshNodes: ['Frontal bone'],
    accuracy: 'anatomis',
    ringkasan:
      'Tulang pipih di bagian depan tempurung kepala (neurokranium) yang membentuk dahi serta atap rongga mata (orbita).',
    fungsi: [
      'Melindungi lobus frontalis otak besar dari benturan mekanis',
      'Membentuk bagian atas rongga mata dan memuat sinus frontalis',
    ],
    faktaKlinis:
      'Sinus di dalam tulang dahi dapat mengalami peradangan (sinusitis frontalis) yang memicu nyeri di atas alis.',
    kameraFokus: {
      position: [0, 1.66, 0.42],
      target: [0, 1.63, 0.04],
    },
  },
  {
    id: 'tulang-ubun-ubun',
    namaID: 'Tulang Ubun-ubun',
    namaLatin: 'Os parietale',
    sistem: 'rangka',
    wilayah: 'kepala',
    lapisan: 'rangka',
    glbChunkId: 'za-skeletal-full',
    meshNodes: ['Parietal bone.r', 'Parietal bone.l'],
    accuracy: 'anatomis',
    ringkasan:
      'Sepasang tulang kranium kanan dan kiri yang menyatu di sutura sagitalis dan membentuk atap serta dinding samping tengkorak.',
    fungsi: [
      'Melindungi korteks somatosensorik dan motorik otak besar',
      'Memberi permukaan perlekatan bagi otot temporalis pengunyah',
    ],
    faktaKlinis:
      'Pada bayi baru lahir, pertemuan tulang ubun-ubun dan tulang dahi masih berupa jaringan ikat lunak (ubun-ubun / fontanel) agar kepala mudah melewati jalan lahir.',
    kameraFokus: {
      position: [0.22, 1.68, 0.38],
      target: [0, 1.64, 0],
    },
  },
  {
    id: 'tulang-rahang-bawah',
    namaID: 'Tulang Rahang Bawah',
    namaLatin: 'Mandibula',
    sistem: 'rangka',
    wilayah: 'kepala',
    lapisan: 'rangka',
    glbChunkId: 'za-skeletal-full',
    meshNodes: ['Mandible'],
    accuracy: 'anatomis',
    ringkasan:
      'Satu-satunya tulang tengkorak wajah yang dapat bergerak bebas melalui sendi peluru-engsel temporomandibular (TMJ).',
    fungsi: [
      'Menopang deretan gigi bawah untuk proses pengunyahan (mastikasi)',
      'Bergerak membuka dan menutup mulut saat berbicara dan mengunyah',
    ],
    faktaKlinis:
      'Mandibula merupakan tulang terkuat dan terbesar pada bagian wajah manusia.',
    kameraFokus: {
      position: [0.16, 1.54, 0.36],
      target: [0, 1.53, 0.04],
    },
  },
  {
    id: 'ruas-leher-atlas-axis',
    namaID: 'Ruas Tulang Leher Atas (Atlas & Aksis)',
    namaLatin: 'Atlas (C1) et Axis (C2)',
    sistem: 'rangka',
    wilayah: 'leher',
    lapisan: 'rangka',
    glbChunkId: 'za-skeletal-full',
    meshNodes: ['Atlas (C1)', 'Axis (C2)'],
    accuracy: 'anatomis',
    ringkasan:
      'Dua ruas pertama tulang belakang leher (vertebra servikalis C1 dan C2) yang membentuk sendi putar (artikulatio atlantoaxialis).',
    fungsi: [
      'Atlas (C1) menopang tengkorak dan memungkinkan gerakan mengangguk',
      'Aksis (C2) memiliki tonjolan dens sebagai poros gerakan menggelengkan kepala',
    ],
    faktaKlinis:
      'Sendi antara Atlas dan Aksis adalah contoh klasik sendi putar (pivot joint) pada materi sistem gerak SMA.',
    kameraFokus: {
      position: [0.18, 1.5, -0.25],
      target: [0, 1.5, 0],
    },
  },
  {
    id: 'tulang-dada',
    namaID: 'Tulang Dada',
    namaLatin: 'Sternum',
    sistem: 'rangka',
    wilayah: 'dada',
    lapisan: 'rangka',
    glbChunkId: 'za-skeletal-full',
    meshNodes: ['Manubrium of sternum', 'Body of sternum'],
    accuracy: 'anatomis',
    ringkasan:
      'Tulang pipih memanjang di garis tengah depan dada yang terdiri atas hulu (manubrium), badan (korpus), dan taju pedang (prosesus xifoideus).',
    fungsi: [
      'Melindungi jantung dan pembuluh darah besar di mediastinum',
      'Menjadi tempat perlekatan tulang selangka dan tulang rawan iga sejati',
    ],
    faktaKlinis:
      'Bagian tengah sternum adalah titik tumpu kompresi dada saat tindakan Resusitasi Jantung Paru (RJP/CPR).',
    kameraFokus: {
      position: [0, 1.3, 0.52],
      target: [0, 1.28, 0.06],
    },
  },
  {
    id: 'tulang-rusuk-sejati',
    namaID: 'Tulang Rusuk Sejati',
    namaLatin: 'Costae verae (I–VII)',
    sistem: 'rangka',
    wilayah: 'dada',
    lapisan: 'rangka',
    glbChunkId: 'za-skeletal-full',
    meshNodes: [
      'First rib.r',
      'First rib.l',
      'Fifth rib.r',
      'Fifth rib.l',
      'Seventh rib.r',
      'Seventh rib.l',
      'Costal cartilage of first rib.r',
      'Costal cartilage of first rib.l',
      'Costal cartilage of fifth rib.r',
      'Costal cartilage of fifth rib.l',
      'Costal cartilage of seventh rib.r',
      'Costal cartilage of seventh rib.l',
    ],
    accuracy: 'anatomis',
    ringkasan:
      'Tujuh pasang tulang rusuk teratas yang ujung depannya melekat langsung ke tulang dada melalui tulang rawan kosta.',
    fungsi: [
      'Membentuk sangkar toraks pelindung paru-paru dan jantung',
      'Mengembang dan mengempis bersama otot antartulang rusuk saat pernapasan dada',
    ],
    faktaKlinis:
      'Elastisitas tulang rawan kosta memungkinkan rongga dada mengembang saat inspirasi tanpa mematahkan rusuk.',
    kameraFokus: {
      position: [0.28, 1.28, 0.58],
      target: [0, 1.26, 0],
    },
  },
  {
    id: 'tulang-selangka-belikat',
    namaID: 'Gelang Bahu (Tulang Selangka & Belikat)',
    namaLatin: 'Clavicula et Scapula',
    sistem: 'rangka',
    wilayah: 'anggota-gerak-atas',
    lapisan: 'rangka',
    glbChunkId: 'za-skeletal-full',
    meshNodes: ['Clavicle.r', 'Clavicle.l', 'Scapula.r', 'Scapula.l'],
    accuracy: 'anatomis',
    ringkasan:
      'Susunan tulang gelang bahu (cingulum pectorale) yang menghubungkan anggota gerak atas dengan rangka aksial.',
    fungsi: [
      'Menopang rentang gerak bebas sendi peluru bahu (artikulatio glenohumeralis)',
      'Menjadi tempat perlekatan otot-otot penggerak bahu dan lengan atas',
    ],
    faktaKlinis:
      'Tulang selangka (klavikula) termasuk tulang yang paling sering mengalami patah tulang (fraktur) saat seseorang jatuh menahan tubuh dengan lengan.',
    kameraFokus: {
      position: [0.25, 1.38, 0.56],
      target: [0, 1.35, 0],
    },
  },
  {
    id: 'tulang-lengan',
    namaID: 'Tulang Lengan Atas, Pengumpil & Hasta',
    namaLatin: 'Humerus, Radius et Ulna',
    sistem: 'rangka',
    wilayah: 'anggota-gerak-atas',
    lapisan: 'rangka',
    glbChunkId: 'za-skeletal-full',
    meshNodes: [
      'Humerus.r',
      'Humerus.l',
      'Radius.r',
      'Radius.l',
      'Ulna.r',
      'Ulna.l',
    ],
    accuracy: 'anatomis',
    ringkasan:
      'Rangkaian tulang pipa anggota gerak atas yang dihubungkan oleh sendi engsel siku serta sendi putar radioulnar.',
    fungsi: [
      'Humerus bekerja dengan otot bisep dan trisep untuk fleksi-ekstensi siku',
      'Radius dan ulna memungkinkan gerak menengadah (supinasi) dan menelungkup (pronasi) telapak tangan',
    ],
    faktaKlinis:
      'Tulang pengumpil (radius) sejajar dengan ibu jari, sedangkan tulang hasta (ulna) sejajar dengan jari kelingking.',
    kameraFokus: {
      position: [0.42, 1.12, 0.68],
      target: [0.2, 1.1, 0],
    },
  },
  {
    id: 'gelang-panggul',
    namaID: 'Gelang Panggul & Tulang Kelangkang',
    namaLatin: 'Os coxae, Os sacrum et Os coccygis',
    sistem: 'rangka',
    wilayah: 'panggul',
    lapisan: 'rangka',
    glbChunkId: 'za-skeletal-full',
    meshNodes: ['Hip bone.r', 'Hip bone.l', 'Sacrum', 'Coccyx'],
    accuracy: 'anatomis',
    ringkasan:
      'Cincin tulang kokoh di dasar batang tubuh yang menyatukan tulang usus (ilium), tulang duduk (iskium), tulang kemaluan (pubis), sakrum, dan tulang ekor.',
    fungsi: [
      'Menyalurkan berat tubuh bagian atas ke kedua tungkai bawah saat berdiri dan berjalan',
      'Melindungi organ-organ di dalam rongga panggul',
    ],
    faktaKlinis:
      'Lekukan asetabulum pada tulang panggul membentuk sendi peluru yang sangat stabil bersama kepala tulang paha (femur).',
    kameraFokus: {
      position: [0, 0.9, 0.65],
      target: [0, 0.88, 0],
    },
  },
  {
    id: 'tulang-tungkai-bawah',
    namaID: 'Tulang Paha, Tempurung Lutut, Kering & Betis',
    namaLatin: 'Femur, Patella, Tibia et Fibula',
    sistem: 'rangka',
    wilayah: 'anggota-gerak-bawah',
    lapisan: 'rangka',
    glbChunkId: 'za-skeletal-full',
    meshNodes: [
      'Femur.r',
      'Femur.l',
      'Patella.r',
      'Patella.l',
      'Tibia.r',
      'Tibia.l',
      'Fibula.r',
      'Fibula.l',
    ],
    accuracy: 'anatomis',
    ringkasan:
      'Tulang-tulang pipa utama tungkai bawah. Femur adalah tulang terpanjang, terbesar, dan terkuat di dalam tubuh manusia.',
    fungsi: [
      'Menopang seluruh beban tubuh saat berdiri, berjalan, berlari, dan melompat',
      'Patela melindungi sendi lutut dan meningkatkan daya ungkit tendon kuadrisep',
    ],
    faktaKlinis:
      'Sumsum merah di ujung proksimal tulang paha (femur) aktif memproduksi sel darah merah sepanjang masa pertumbuhan.',
    kameraFokus: {
      position: [0.22, 0.52, 0.98],
      target: [0, 0.5, 0],
    },
  },

  // ============================================================================
  // 2. SISTEM PEREDARAN DARAH (za-cardiovascular-core + hra-heart)
  // ============================================================================
  {
    id: 'serambi-kanan',
    namaID: 'Serambi Kanan Jantung',
    namaLatin: 'Atrium cordis dextrum',
    sistem: 'peredaran-darah',
    wilayah: 'dada',
    lapisan: 'peredaran-darah',
    glbChunkId: 'za-cardiovascular-core',
    detailGlbChunkId: 'hra-heart',
    meshNodes: ['Right atrium'],
    detailMeshNodes: ['VH_M_right_cardiac_atrium'],
    accuracy: 'anatomis',
    ringkasan:
      'Ruang jantung kanan atas berdinding relatif tipis yang menerima darah miskin oksigen (kaya CO2) dari seluruh tubuh.',
    fungsi: [
      'Menerima darah balik sistemik dari vena kava superior, vena kava inferior, dan sinus koronarius',
      'Memompa darah melewati katup trikuspidalis menuju bilik kanan',
      'Memuat nodus sinoatrial (SA node) sebagai pacu jantung alami (pacemaker)',
    ],
    faktaKlinis:
      'Nodus SA di dinding serambi kanan mencetuskan impuls listrik otomatis sekitar 60–100 kali per menit saat istirahat.',
    kameraFokus: {
      position: [-0.08, 1.3, 0.36],
      target: [0.02, 1.29, 0],
    },
  },
  {
    id: 'bilik-kanan',
    namaID: 'Bilik Kanan Jantung',
    namaLatin: 'Ventriculus cordis dexter',
    sistem: 'peredaran-darah',
    wilayah: 'dada',
    lapisan: 'peredaran-darah',
    glbChunkId: 'za-cardiovascular-core',
    detailGlbChunkId: 'hra-heart',
    meshNodes: [
      'Right ventricle',
      'Anterior papillary muscle of right ventricle',
      'Inferior papillary muscle of right ventricle',
      'Septal papillary muscle of right ventricle',
    ],
    detailMeshNodes: ['VH_M_heart_right_ventricle'],
    accuracy: 'anatomis',
    ringkasan:
      'Ruang jantung kanan bawah yang memompa darah miskin oksigen menuju paru-paru melalui peredaran darah kecil (sirkulasi pulmonal).',
    fungsi: [
      'Memompa darah melewati katup semilunaris pulmonal ke trunkus pulmonalis',
      'Otot papilaris dan korda tendinea menahan katup trikuspid agar tidak berbalik saat sistol',
    ],
    faktaKlinis:
      'Dinding otot bilik kanan lebih tebal daripada serambi, namun sekitar tiga kali lebih tipis dibandingkan bilik kiri karena hanya memompa darah ke paru-paru yang bertekanan rendah.',
    kameraFokus: {
      position: [0.04, 1.27, 0.35],
      target: [0.02, 1.28, 0],
    },
  },
  {
    id: 'serambi-kiri',
    namaID: 'Serambi Kiri Jantung',
    namaLatin: 'Atrium cordis sinistrum',
    sistem: 'peredaran-darah',
    wilayah: 'dada',
    lapisan: 'peredaran-darah',
    glbChunkId: 'za-cardiovascular-core',
    detailGlbChunkId: 'hra-heart',
    meshNodes: ['Left atrium'],
    detailMeshNodes: ['VH_M_left_cardiac_atrium'],
    accuracy: 'anatomis',
    ringkasan:
      'Ruang jantung kiri atas di bagian posterior yang menerima darah bersih kaya oksigen dari paru-paru kanan dan kiri.',
    fungsi: [
      'Menerima darah kaya O2 melalui empat vena pulmonalis (dua kanan dan dua kiri)',
      'Mengalirkan darah melewati katup bikuspidalis (mitral) menuju bilik kiri',
    ],
    faktaKlinis:
      'Vena pulmonalis yang bermuara ke serambi kiri adalah satu-satunya vena pada orang dewasa yang membawa darah kaya oksigen.',
    kameraFokus: {
      position: [0.14, 1.31, 0.34],
      target: [0.03, 1.29, 0],
    },
  },
  {
    id: 'bilik-kiri',
    namaID: 'Bilik Kiri Jantung',
    namaLatin: 'Ventriculus cordis sinister',
    sistem: 'peredaran-darah',
    wilayah: 'dada',
    lapisan: 'peredaran-darah',
    glbChunkId: 'za-cardiovascular-core',
    detailGlbChunkId: 'hra-heart',
    meshNodes: ['Left ventricle', 'Inferior papillary muscle of left ventricle'],
    detailMeshNodes: ['VH_M_heart_left_ventricle', 'VH_M_interventricular_septum'],
    accuracy: 'anatomis',
    ringkasan:
      'Ruang jantung dengan lapisan otot miokardium paling tebal yang memompa darah kaya oksigen ke seluruh tubuh (peredaran darah besar).',
    fungsi: [
      'Memompa darah bertekanan tinggi melewati katup aorta menuju aorta asendens',
      'Menghasilkan tekanan darah sistolik yang terukur pada pemeriksaan tensimeter',
    ],
    faktaKlinis:
      'Ketebalan miokardium bilik kiri mencapai 8–12 mm agar mampu melawan tahanan pembuluh darah sistemik dari kepala hingga ujung kaki.',
    kameraFokus: {
      position: [0.16, 1.26, 0.35],
      target: [0.03, 1.27, 0],
    },
  },
  {
    id: 'katup-jantung',
    namaID: 'Kompleks Katup Jantung',
    namaLatin: 'Valvae cordis',
    sistem: 'peredaran-darah',
    wilayah: 'dada',
    lapisan: 'peredaran-darah',
    glbChunkId: 'za-cardiovascular-core',
    detailGlbChunkId: 'hra-heart',
    meshNodes: [
      'Left coronary leaflet',
      'Right coronary leaflet',
      'Non-coronary leaflet',
    ],
    detailMeshNodes: [
      'VH_M_mitral_valve',
      'VH_M_tricuspid_valve',
      'VH_M_aortic_valve',
      'VH_M_pulmonary_valve',
    ],
    accuracy: 'anatomis',
    ringkasan:
      'Empat katup satu arah (trikuspid, pulmonal, mitral/bikuspid, dan aorta) yang memastikan darah mengalir searah tanpa arus balik (regurgitasi).',
    fungsi: [
      'Katup atrioventrikular (trikuspid & mitral) mencegah darah kembali ke serambi saat kontraksi bilik (bunyi jantung "lub")',
      'Katup semilunar (pulmonal & aorta) mencegah darah kembali ke bilik saat relaksasi/diastol (bunyi jantung "dup")',
    ],
    faktaKlinis:
      'Bunyi detak jantung yang terdengar lewat stetoskop berasal dari penutupan daun-daun katup jantung.',
    kameraFokus: {
      position: [0.06, 1.29, 0.32],
      target: [0.02, 1.29, 0],
    },
  },
  {
    id: 'aorta',
    namaID: 'Aorta (Pembuluh Nadi Utama)',
    namaLatin: 'Aorta',
    sistem: 'peredaran-darah',
    wilayah: 'dada',
    lapisan: 'peredaran-darah',
    glbChunkId: 'za-cardiovascular-core',
    meshNodes: ['Ascending aorta', 'Thoracic aorta', 'Abdominal aorta'],
    accuracy: 'anatomis',
    ringkasan:
      'Arteri elastis terbesar di dalam tubuh yang keluar dari bilik kiri jantung, melengkung di rongga dada, dan turun hingga rongga perut.',
    fungsi: [
      'Menyalurkan darah kaya oksigen dari bilik kiri ke seluruh cabang arteri sistemik',
      'Dinding elastisnya meredam lonjakan tekanan saat sistol dan mempertahankan aliran darah saat diastol (efek Windkessel)',
    ],
    faktaKlinis:
      'Tekanan darah tinggi (hipertensi) kronis memaksa dinding aorta bekerja ekstra keras dan dapat menurunkan kelenturannya.',
    kameraFokus: {
      position: [0.1, 1.22, 0.58],
      target: [0, 1.2, 0],
    },
  },
  {
    id: 'vena-kava',
    namaID: 'Vena Kava Superior & Inferior',
    namaLatin: 'Vena cava superior et inferior',
    sistem: 'peredaran-darah',
    wilayah: 'dada',
    lapisan: 'peredaran-darah',
    glbChunkId: 'za-cardiovascular-core',
    meshNodes: [
      'Superior vena cava',
      'Inferior vena cava (thoracic part)',
      'Inferior vena cava (abdominal part)',
      'Right brachiocephalic vein',
      'Left brachiocephalic vein',
    ],
    accuracy: 'anatomis',
    ringkasan:
      'Dua pembuluh balik utama terbesar yang mengumpulkan darah miskin oksigen dari tubuh bagian atas dan bawah menuju serambi kanan jantung.',
    fungsi: [
      'Vena kava superior mengalirkan darah balik dari kepala, leher, lengan, dan dada atas',
      'Vena kava inferior mengalirkan darah balik dari tungkai, panggul, dan organ perut',
    ],
    faktaKlinis:
      'Aliran darah di dalam vena dibantu oleh kontraksi otot rangka di sekitarnya serta dorongan tekanan negatif rongga dada saat menarik napas.',
    kameraFokus: {
      position: [-0.14, 1.22, 0.58],
      target: [0, 1.2, 0],
    },
  },
  {
    id: 'pembuluh-pulmonal',
    namaID: 'Arteri & Vena Pulmonalis',
    namaLatin: 'Truncus pulmonalis et Venae pulmonales',
    sistem: 'peredaran-darah',
    wilayah: 'dada',
    lapisan: 'peredaran-darah',
    glbChunkId: 'za-cardiovascular-core',
    meshNodes: [
      'Pulmonary trunk',
      'Bifurcation of pulmonary trunk',
      'Right pulmonary artery',
      'Left pulmonary artery',
      'Right superior pulmonary vein',
      'Right inferior pulmonary vein',
      'Left superior pulmonary vein',
      'Left inferior pulmonary vein',
    ],
    accuracy: 'anatomis',
    ringkasan:
      'Pembuluh penghubung jantung dan paru-paru pada peredaran darah kecil (sirkulasi pulmonal).',
    fungsi: [
      'Arteri pulmonalis membawa darah kaya CO2 dari bilik kanan ke kapiler alveolus paru-paru',
      'Vena pulmonalis membawa darah kaya O2 dari paru-paru kembali ke serambi kiri jantung',
    ],
    faktaKlinis:
      'Dalam kurikulum Biologi SMA, arteri pulmonalis adalah pengecualian penting karena merupakan satu-satunya arteri yang mengangkut darah miskin oksigen.',
    kameraFokus: {
      position: [0, 1.32, 0.42],
      target: [0, 1.31, 0],
    },
  },
  {
    id: 'arteri-koroner',
    namaID: 'Pembuluh Darah Koroner Jantung',
    namaLatin: 'Arteriae coronariae et Sinus coronarius',
    sistem: 'peredaran-darah',
    wilayah: 'dada',
    lapisan: 'peredaran-darah',
    glbChunkId: 'za-cardiovascular-core',
    meshNodes: [
      'Right coronary artery',
      'Left coronary artery',
      'Right inferolateral branch of right coronary artery',
      'Coronary sinus',
      'Inferior vein of left ventricle',
    ],
    accuracy: 'anatomis',
    ringkasan:
      'Cabang pertama dari pangkal aorta yang menyelimuti permukaan luar jantung untuk memberi makan otot jantung (miokardium) itu sendiri.',
    fungsi: [
      'Menyuplai oksigen dan glukosa secara terus-menerus ke sel-sel otot jantung yang berdenyut tanpa henti',
      'Sinus koronarius mengalirkan darah balik otot jantung langsung ke serambi kanan',
    ],
    faktaKlinis:
      'Penyumbatan arteri koroner oleh plak aterosklerosis menyebabkan penyakit jantung koroner dan serangan jantung (infark miokard).',
    kameraFokus: {
      position: [0.06, 1.28, 0.32],
      target: [0.02, 1.28, 0],
    },
  },

  // ============================================================================
  // 3. SISTEM PERNAPASAN (za-respiratory + hra-lung / hra-trachea / hra-larynx)
  // ============================================================================
  {
    id: 'rongga-hidung',
    namaID: 'Mukosa Rongga Hidung',
    namaLatin: 'Tunica mucosa cavitatis nasi',
    sistem: 'pernapasan',
    wilayah: 'kepala',
    lapisan: 'pernapasan',
    glbChunkId: 'za-respiratory',
    meshNodes: ['Mucosa of nasal cavity'],
    accuracy: 'anatomis',
    ringkasan:
      'Pintu masuk utama udara pernapasan yang dilapisi epitel bersilia, sel goblet penghasil lendir, dan anyaman kapiler darah.',
    fungsi: [
      'Menyaring partikel debu dan patogen melalui rambut hidung serta lapisan mukus',
      'Menghangatkan dan melembapkan udara inspirasi agar sesuai dengan suhu tubuh',
      'Mendeteksi molekul bau melalui reseptor olfaktori di atap rongga hidung',
    ],
    faktaKlinis:
      'Bernapas melalui hidung jauh lebih sehat daripada melalui mulut karena udara telah mengalami penyaringan, penghangatan, dan pelembapan.',
    kameraFokus: {
      position: [0.14, 1.59, 0.34],
      target: [0, 1.58, 0.04],
    },
  },
  {
    id: 'epiglotis-laring',
    namaID: 'Epiglotis & Laring (Pangkal Tenggorokan)',
    namaLatin: 'Epiglottis et Larynx',
    sistem: 'pernapasan',
    wilayah: 'leher',
    lapisan: 'pernapasan',
    glbChunkId: 'za-respiratory',
    detailGlbChunkId: 'hra-larynx',
    meshNodes: ['Epiglottis'],
    detailMeshNodes: [
      'VH_M_epiglottic_cartilage',
      'VH_M_thyroid_cartilage',
      'VH_M_cricoid_cartilage',
      'VH_M_arytenoid_cartilage_R',
      'VH_M_arytenoid_cartilage_L',
    ],
    accuracy: 'anatomis',
    ringkasan:
      'Saluran tulang rawan di antara faring dan trakea yang memuat pita suara serta katup tulang rawan elastis epiglotis.',
    fungsi: [
      'Epiglotis menutup laring secara refleks saat menelan agar makanan tidak masuk ke saluran napas (tersedak)',
      'Laring menjaga jalan napas tetap terbuka dan menghasilkan suara (fonasi)',
    ],
    faktaKlinis:
      'Tonjolan kartilago tiroid pada laring dikenal sehari-hari sebagai jakun.',
    kameraFokus: {
      position: [0.14, 1.48, 0.34],
      target: [0, 1.47, 0.02],
    },
  },
  {
    id: 'trakea',
    namaID: 'Trakea (Batang Tenggorokan)',
    namaLatin: 'Trachea',
    sistem: 'pernapasan',
    wilayah: 'leher',
    lapisan: 'pernapasan',
    glbChunkId: 'za-respiratory',
    detailGlbChunkId: 'hra-trachea',
    meshNodes: ['Trachea'],
    detailMeshNodes: ['VH_M_trachea', 'VH_M_tracheal_cartilage', 'VH_M_carina'],
    accuracy: 'anatomis',
    ringkasan:
      'Tabung saluran napas sepanjang ±10–12 cm yang diperkuat oleh 16–20 cincin tulang rawan hialin berbentuk huruf C.',
    fungsi: [
      'Menyalurkan udara dari laring menuju percabangan bronkus kanan dan kiri (karina)',
      'Eskalator mukosiliar (silia dan lendir) mendorong debu yang terperangkap naik kembali ke faring',
    ],
    faktaKlinis:
      'Cincin tulang rawan trakea terbuka di bagian belakang (berbentuk huruf C) agar kerongkongan (esofagus) di belakangnya dapat mengembang saat menelan makanan.',
    kameraFokus: {
      position: [0, 1.4, 0.42],
      target: [0, 1.39, 0.02],
    },
  },
  {
    id: 'percabangan-bronkus',
    namaID: 'Bronkus Utama & Bronkus Lobaris',
    namaLatin: 'Bronchi principales et lobares',
    sistem: 'pernapasan',
    wilayah: 'dada',
    lapisan: 'pernapasan',
    glbChunkId: 'za-respiratory',
    detailGlbChunkId: 'hra-lung',
    meshNodes: [
      'Right main bronchus',
      'Left main bronchus',
      'Right superior lobar bronchus',
      'Middle lobar bronchus.r',
      'Right inferior lobar bronchus',
      'Left superior lobar bronchus',
      'Left inferior lobar bronchus',
      'Intermediate bronchus.r',
    ],
    detailMeshNodes: [
      'VH_M_right_superior_lobar_bronchus',
      'VH_M_right_middle_lobar_bronchus',
      'VH_M_right_intermediate_bronchus',
      'VH_M_left_superior_lobar_bronchus',
      'VH_M_left_inferior_lobar_bronchus',
    ],
    accuracy: 'anatomis',
    ringkasan:
      'Percabangan trakea menuju paru-paru kanan dan kiri yang terus bercabang menjadi bronkus lobaris, bronkus segmentalis, hingga bronkiolus.',
    fungsi: [
      'Mendistribusikan udara inspirasi secara merata ke setiap lobus dan segmen paru-paru',
      'Otot polos dinding bronkus mengatur diameter saluran napas (bronkodilatasi dan bronkokonstriksi)',
    ],
    faktaKlinis:
      'Pada penderita asma, otot polos bronkus dan bronkiolus mengalami penyempitan (bronkospasme) disertai peradangan mukosa sehingga timbul sesak dan bunyi mengi.',
    kameraFokus: {
      position: [0, 1.33, 0.44],
      target: [0, 1.32, 0],
    },
  },
  {
    id: 'paru-paru-kanan',
    namaID: 'Paru-paru Kanan (3 Gelambir / Lobus)',
    namaLatin: 'Pulmo dexter (Lobus superior, medius, inferior)',
    sistem: 'pernapasan',
    wilayah: 'dada',
    lapisan: 'pernapasan',
    glbChunkId: 'za-respiratory',
    detailGlbChunkId: 'hra-lung',
    meshNodes: [
      'Superior lobe of right lung',
      'Middle lobe of right lung',
      'Inferior lobe of right lung',
    ],
    detailMeshNodes: [
      'VH_M_right_apical_bronchus',
      'VH_M_right_anterior_bronchus',
      'VH_M_right_posterior_bronchus',
    ],
    accuracy: 'anatomis',
    ringkasan:
      'Organ pernapasan utama di rongga dada kanan yang terbagi menjadi tiga lobus (atas, tengah, dan bawah) oleh fisura horizontal dan oblik.',
    fungsi: [
      'Tempat berlangsungnya difusi oksigen (O2) ke kapiler darah dan pelepasan karbon dioksida (CO2) di ratusan juta alveolus',
    ],
    faktaKlinis:
      'Paru-paru kanan berukuran sedikit lebih lebar tetapi lebih pendek dibandingkan paru-paru kiri karena terdesak oleh kubah hati di bawah diafragma kanan.',
    kameraFokus: {
      position: [-0.18, 1.3, 0.52],
      target: [-0.06, 1.29, 0],
    },
  },
  {
    id: 'paru-paru-kiri',
    namaID: 'Paru-paru Kiri (2 Gelambir / Lobus)',
    namaLatin: 'Pulmo sinister (Lobus superior et inferior)',
    sistem: 'pernapasan',
    wilayah: 'dada',
    lapisan: 'pernapasan',
    glbChunkId: 'za-respiratory',
    detailGlbChunkId: 'hra-lung',
    meshNodes: ['Superior lobe of left lung', 'Inferior lobe of left lung'],
    detailMeshNodes: [
      'VH_M_left_apical_bronchus',
      'VH_M_left_anterior_bronchus',
      'VH_M_left_lingular_bronchus',
    ],
    accuracy: 'anatomis',
    ringkasan:
      'Organ pernapasan di rongga dada kiri yang terdiri atas dua lobus (atas dan bawah) serta memiliki lekukan jantung (insisura kardiaka).',
    fungsi: [
      'Melakukan pertukaran gas O2 dan CO2 antara udara alveolus dan kapiler pulmonal',
    ],
    faktaKlinis:
      'Paru-paru kiri hanya memiliki dua lobus karena sebagian ruang di sisi kiri rongga dada ditempati oleh apeks jantung.',
    kameraFokus: {
      position: [0.18, 1.3, 0.52],
      target: [0.06, 1.29, 0],
    },
  },
];

export const ANATOMICAL_STRUCTURES: readonly AnatomicalStructure[] =
  RAW_STRUCTURES.map((item) => AnatomicalStructureSchema.parse(item));
