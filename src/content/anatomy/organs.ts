import {
  DetailedOrganSchema,
  type DetailedOrgan,
} from '@/content/schema/anatomy.schema';

const RAW_DETAILED_ORGANS: DetailedOrgan[] = [
  // ============================================================================
  // 1. JANTUNG (hra-heart — 14 sub-meshes)
  // ============================================================================
  {
    id: 'jantung',
    namaID: 'Jantung Manusia',
    namaLatin: 'Cor',
    sistem: 'peredaran-darah',
    wilayah: 'dada',
    glbChunkId: 'hra-heart',
    accuracy: 'anatomis',
    ringkasan:
      'Organ otot berongga seukuran kepalan tangan di mediastinum tengah rongga dada yang bekerja sebagai pompa ganda untuk peredaran darah kecil (pulmonal) dan peredaran darah besar (sistemik).',
    fungsiUtama: [
      'Memompa darah miskin O2 dari sisi kanan jantung menuju paru-paru untuk oksigenasi (sirkulasi pulmonal)',
      'Memompa darah kaya O2 dari sisi kiri jantung ke seluruh jaringan tubuh melalui aorta (sirkulasi sistemik)',
      'Menjaga aliran darah tetap searah melalui koordinasi empat katup jantung dan sistem konduksi listrik intrinsik',
    ],
    faktaFisiologi:
      'Dalam satu hari, jantung berdenyut sekitar 100.000 kali dan memompa kurang lebih 7.200 liter darah. Perbedaan mencolok antara ketebalan dinding bilik kiri (8–12 mm) dan bilik kanan (3–4 mm) mencerminkan perbedaan tekanan kerja antara sirkulasi sistemik dan sirkulasi pulmonal.',
    panduanSayatan:
      'Aktifkan sayatan pada Sumbu Z (Koronal) atau Sumbu Y (Horizontal) dan geser perlahan ke posisi 0% untuk mengamati perbandingan ketebalan otot bilik kiri vs bilik kanan, posisi sekat antarbilik, serta keempat katup jantung.',
    relatedStructureIds: [
      'serambi-kanan',
      'bilik-kanan',
      'serambi-kiri',
      'bilik-kiri',
      'katup-jantung',
      'aorta',
      'vena-kava',
      'pembuluh-pulmonal',
      'arteri-koroner',
    ],
    subStructures: [
      {
        id: 'jantung-serambi-kanan',
        namaID: 'Serambi Kanan',
        namaLatin: 'Atrium cordis dextrum',
        kategori: 'Ruang & Sekat Jantung',
        meshNodes: ['VH_M_right_cardiac_atrium'],
        warnaDasar: '#3b82f6',
        ringkasan:
          'Ruang penerima di bagian kanan atas jantung yang menampung darah vena sistemik miskin oksigen dari vena kava superior, vena kava inferior, dan sinus koronarius.',
        fungsi: [
          'Menampung darah balik kaya CO2 dari seluruh tubuh saat fase diastol',
          'Menyalurkan darah melewati katup trikuspidalis menuju bilik kanan',
          'Memuat Nodus Sinoatrial (SA Node) yang menjadi pemacu detak jantung alami (pacemaker)',
        ],
        faktaKlinis:
          'Gangguan irama impuls listrik di serambi dapat menyebabkan fibrilasi atrium yang menurunkan efisiensi pengisian bilik jantung.',
      },
      {
        id: 'jantung-bilik-kanan',
        namaID: 'Bilik Kanan',
        namaLatin: 'Ventriculus cordis dexter',
        kategori: 'Ruang & Sekat Jantung',
        meshNodes: ['VH_M_heart_right_ventricle'],
        warnaDasar: '#2563eb',
        ringkasan:
          'Ruang pompa di bagian kanan depan jantung yang mendorong darah miskin oksigen masuk ke trunkus pulmonalis menuju paru-paru kanan dan kiri.',
        fungsi: [
          'Memompa darah deoksigenasi ke sirkulasi paru-paru pada tekanan rendah (±25/8 mmHg)',
          'Berkontraksi bersama otot papilaris untuk menutup katup trikuspidalis saat sistol',
        ],
        faktaKlinis:
          'Dinding miokardium bilik kanan jauh lebih tipis daripada bilik kiri karena jarak ke paru-paru dekat dan resistansi pembuluh kapiler paru rendah.',
      },
      {
        id: 'jantung-serambi-kiri',
        namaID: 'Serambi Kiri',
        namaLatin: 'Atrium cordis sinistrum',
        kategori: 'Ruang & Sekat Jantung',
        meshNodes: ['VH_M_left_cardiac_atrium'],
        warnaDasar: '#f43f5e',
        ringkasan:
          'Ruang jantung di sisi kiri belakang (posterior) yang menerima darah segar kaya oksigen dari keempat vena pulmonalis.',
        fungsi: [
          'Menerima darah beroksigen tinggi dari paru-paru kanan dan kiri',
          'Mendorong darah melewati katup bikuspidalis (mitral) ke bilik kiri pada akhir diastol',
        ],
        faktaKlinis:
          'Penyempitan katup mitral dapat membuat tekanan di serambi kiri meningkat dan memicu pembengkakan pembuluh kapiler paru.',
      },
      {
        id: 'jantung-bilik-kiri',
        namaID: 'Bilik Kiri',
        namaLatin: 'Ventriculus cordis sinister',
        kategori: 'Ruang & Sekat Jantung',
        meshNodes: ['VH_M_heart_left_ventricle'],
        warnaDasar: '#dc2626',
        ringkasan:
          'Ruang pompa utama jantung yang membentuk apeks (ujung bawah) jantung dan memiliki lapisan otot miokardium paling tebal.',
        fungsi: [
          'Memompa darah kaya oksigen melewati katup aorta ke seluruh tubuh melalui peredaran darah besar',
          'Menghasilkan tekanan darah sistolik (±120 mmHg) untuk menembus tahanan pembuluh darah sistemik',
        ],
        faktaKlinis:
          'Hipertensi kronis memaksa bilik kiri berkontraksi lebih keras sehingga otot dindingnya mengalami penebalan patologis (hipertrofi ventrikel kiri).',
      },
      {
        id: 'jantung-sekat-antarbilik',
        namaID: 'Sekat Antarbilik (Septum Interventrikular)',
        namaLatin: 'Septum interventriculare',
        kategori: 'Ruang & Sekat Jantung',
        meshNodes: ['VH_M_interventricular_septum'],
        warnaDasar: '#b91c1c',
        ringkasan:
          'Dinding pemisah kokoh yang terdiri atas jaringan otot tebal dan bagian membranosa yang memisahkan bilik kanan dan bilik kiri secara rapat.',
        fungsi: [
          'Mencegah pencampuran darah kaya O2 di bilik kiri dengan darah miskin O2 di bilik kanan',
          'Menjadi jalur berkas His (berkas atrioventrikular) kanan dan kiri dalam sistem konduksi listrik jantung',
        ],
        faktaKlinis:
          'Lubang bawaan lahir pada sekat ini dikenal sebagai Defek Septum Ventrikel (VSD / jantung bocor) yang menyebabkan darah bersih dan kotor bercampur.',
      },
      {
        id: 'jantung-katup-trikuspid',
        namaID: 'Katup Trikuspidalis (Tiga Daun)',
        namaLatin: 'Valva atrioventricularis dextra (Valva tricuspidalis)',
        kategori: 'Katup Jantung',
        meshNodes: ['VH_M_tricuspid_valve'],
        warnaDasar: '#f59e0b',
        ringkasan:
          'Katup atrioventrikular kanan yang memiliki tiga daun katup (kuspis anterior, posterior, dan septal) di antara serambi kanan dan bilik kanan.',
        fungsi: [
          'Membuka saat diastol agar darah mengalir dari serambi kanan ke bilik kanan',
          'Menutup rapat saat sistol bilik untuk mencegah arus balik darah ke serambi kanan',
        ],
        faktaKlinis:
          'Penutupan katup trikuspidalis bersama katup mitral menghasilkan bunyi jantung pertama ("lub" / S1).',
      },
      {
        id: 'jantung-katup-mitral',
        namaID: 'Katup Bikuspidalis / Mitral (Dua Daun)',
        namaLatin: 'Valva atrioventricularis sinistra (Valva mitralis)',
        kategori: 'Katup Jantung',
        meshNodes: ['VH_M_mitral_valve'],
        warnaDasar: '#fbbf24',
        ringkasan:
          'Katup atrioventrikular kiri yang memiliki dua daun katup kuat di antara serambi kiri dan bilik kiri.',
        fungsi: [
          'Mengatur aliran darah kaya oksigen satu arah dari serambi kiri menuju bilik kiri',
          'Menahan tekanan tinggi saat bilik kiri memompa darah ke aorta agar darah tidak berbalik ke serambi kiri',
        ],
        faktaKlinis:
          'Katup mitral harus menahan tekanan paling besar di antara semua katup jantung sehingga paling rentan mengalami kebocoran (regurgitasi mitral).',
      },
      {
        id: 'jantung-katup-pulmonal',
        namaID: 'Katup Semilunaris Pulmonal',
        namaLatin: 'Valva trunci pulmonalis',
        kategori: 'Katup Jantung',
        meshNodes: ['VH_M_pulmonary_valve'],
        warnaDasar: '#38bdf8',
        ringkasan:
          'Katup berbentuk tiga kantung bulan sabit di pangkal batang arteri pulmonalis pada pintu keluar bilik kanan.',
        fungsi: [
          'Membuka saat bilik kanan berkontraksi memompa darah menuju paru-paru',
          'Menutup saat bilik kanan berelaksasi agar darah di arteri pulmonalis tidak jatuh kembali ke bilik kanan',
        ],
        faktaKlinis:
          'Penutupan katup pulmonal bersama katup aorta pada awal diastol menghasilkan bunyi jantung kedua ("dup" / S2).',
      },
      {
        id: 'jantung-katup-aorta',
        namaID: 'Katup Semilunaris Aorta',
        namaLatin: 'Valva aortae',
        kategori: 'Katup Jantung',
        meshNodes: ['VH_M_aortic_valve'],
        warnaDasar: '#f97316',
        ringkasan:
          'Katup tiga kelopak bulan sabit di pintu keluar bilik kiri menuju pangkal aorta asendens.',
        fungsi: [
          'Membuka lebar saat sistol bilik kiri untuk meloloskan pancaran darah bertekanan tinggi ke aorta',
          'Menutup rapat saat diastol sekaligus mengarahkan darah masuk ke muara arteri koroner kiri dan kanan',
        ],
        faktaKlinis:
          'Pada usia lanjut atau demam reumatik, daun katup aorta dapat mengeras (stenosis aorta) sehingga bilik kiri harus bekerja ekstra berat.',
      },
      {
        id: 'jantung-otot-papilaris',
        namaID: 'Otot Papilaris Jantung',
        namaLatin: 'Musculi papillares cordis',
        kategori: 'Otot Papilaris',
        meshNodes: [
          'VH_M_papillary_muscle_of_heart_anterior',
          'VH_M_papillary_muscle_of_heart_posterior',
          'VH_M_papillary_muscle_of_heart_medial',
          'VH_M_papillary_muscle_of_heart_anterolateral',
          'VH_M_papillary_muscle_of_heart_posteromedial',
        ],
        warnaDasar: '#fb7185',
        ringkasan:
          'Tonjolan-tonjolan otot berbentuk kerucut di dinding dalam bilik kanan dan bilik kiri yang terhubung ke daun katup melalui tali-tali tendon (korda tendinea).',
        fungsi: [
          'Berkontraksi menarik korda tendinea saat sistol bilik berlangsung',
          'Menahan daun katup trikuspidalis dan mitral agar tidak terbalik (prolaps) ke arah serambi',
        ],
        faktaKlinis:
          'Otot papilaris tidak membuka atau menutup katup secara aktif, melainkan bekerja seperti tali parasut yang menahan daun katup agar tidak jebol saat tekanan bilik melonjak.',
      },
    ],
  },

  // ============================================================================
  // 2. PARU-PARU & POHON BRONKUS (hra-lung — 58 sub-meshes)
  // ============================================================================
  {
    id: 'paru-paru',
    namaID: 'Paru-paru & Pohon Bronkus',
    namaLatin: 'Pulmones et Arbor bronchialis',
    sistem: 'pernapasan',
    wilayah: 'dada',
    glbChunkId: 'hra-lung',
    accuracy: 'anatomis',
    ringkasan:
      'Sepasang organ pernapasan utama di rongga toraks beserta percabangan pohon bronkus dan segmen-segmen bronkopulmonal tempat berlangsungnya pertukaran gas O2 dan CO2.',
    fungsiUtama: [
      'Menyalurkan udara inspirasi melalui percabangan bronkus lobaris dan segmentalis ke seluruh bagian paru-paru',
      'Melakukan difusi oksigen (O2) dari alveolus ke kapiler darah pulmonal dan mengeluarkan karbon dioksida (CO2)',
      'Menyediakan struktur segmen bronkopulmonal mandiri sehingga gangguan pada satu segmen tidak langsung melumpuhkan lobus lainnya',
    ],
    faktaFisiologi:
      'Paru-paru kanan memiliki 3 lobus (10 segmen bronkopulmonal), sedangkan paru-paru kiri memiliki 2 lobus (8–10 segmen) karena memberi ruang bagi apeks jantung di sisi kiri dada.',
    panduanSayatan:
      'Gunakan sayatan pada Sumbu Z (Koronal) atau Sumbu X (Sagital) untuk menembus permukaan segmen paru-paru dan melihat pohon percabangan bronkus beserta cincin kartilagonya di bagian dalam.',
    relatedStructureIds: [
      'paru-paru-kanan',
      'paru-paru-kiri',
      'percabangan-bronkus',
    ],
    subStructures: [
      {
        id: 'paru-lobus-atas-kanan',
        namaID: 'Segmen Lobus Atas Paru Kanan',
        namaLatin: 'Segmenta lobi superioris pulmonis dextri',
        kategori: 'Segmen Paru-paru Kanan',
        meshNodes: [
          'VH_M_right_apical_bronchopulmonary_segment',
          'VH_M_right_posterior_bronchopulmonary_segment',
          'VH_M_right_anterior_bronchopulmonary_segment',
          'VH_M_hilum_upper_R',
        ],
        warnaDasar: '#06b6d4',
        ringkasan:
          'Bagian atas paru-paru kanan yang terdiri atas segmen apikal, posterior, dan anterior di atas fisura horizontal.',
        fungsi: [
          'Melakukan pertukaran gas pada puncak (apeks) hingga bagian depan atas rongga dada kanan',
          'Menerima aliran udara langsung dari bronkus lobaris superior kanan',
        ],
        faktaKlinis:
          'Puncak lobus atas memiliki rasio ventilasi terhadap aliran darah yang tinggi sehingga sering menjadi lokasi favorit bakteri Mycobacterium tuberculosis yang bersifat aerob.',
      },
      {
        id: 'paru-lobus-tengah-kanan',
        namaID: 'Segmen Lobus Tengah Paru Kanan',
        namaLatin: 'Segmenta lobi medii pulmonis dextri',
        kategori: 'Segmen Paru-paru Kanan',
        meshNodes: [
          'VH_M_right_lateral_bronchopulmonary_segment',
          'VH_M_right_medial_bronchopulmonary_segment',
          'VH_M_hilum_middle_R',
        ],
        warnaDasar: '#22d3ee',
        ringkasan:
          'Gelambir tengah paru-paru kanan yang berbentuk baji di antara fisura horizontal dan fisura oblik, terbagi menjadi segmen lateral dan medial.',
        fungsi: [
          'Memperluas permukaan pertukaran gas di bagian depan tengah rongga dada kanan',
          'Berbatasan langsung dengan sisi kanan kantung perikardium jantung',
        ],
        faktaKlinis:
          'Lobus tengah hanya dimiliki oleh paru-paru kanan; pada paru-paru kiri, posisi yang setara ditempati oleh bagian lingula dari lobus atas kiri.',
      },
      {
        id: 'paru-lobus-bawah-kanan',
        namaID: 'Segmen Lobus Bawah Paru Kanan',
        namaLatin: 'Segmenta lobi inferioris pulmonis dextri',
        kategori: 'Segmen Paru-paru Kanan',
        meshNodes: [
          'VH_M_right_superior_bronchopulmonary_segment',
          'VH_M_right_medial_basal_bronchopulmonary_segment',
          'VH_M_right_anterior_basal_bronchopulmonary_segment',
          'VH_M_right_lateral_basal_bronchopulmonary_segment',
          'VH_M_right_posterior_basal_bronchopulmonary_segment',
          'VH_M_hilum_lower_R',
          'VH_M_hilum_R',
        ],
        warnaDasar: '#0891b2',
        ringkasan:
          'Gelambir terbesar paru-paru kanan yang bertumpu di atas kubah diafragma kanan dan mencakup lima segmen bronkopulmonal basal serta superior.',
        fungsi: [
          'Menyumbang kapasitas volume alun napas (tidal) terbesar saat pernapasan perut (diafragma) berlangsung',
          'Menerima aliran darah kapiler pulmonal paling banyak akibat pengaruh gravitasi saat posisi berdiri',
        ],
        faktaKlinis:
          'Saat kontraksi otot diafragma mendatar ke bawah, segmen basal lobus bawah mengembang paling maksimal untuk menarik udara masuk.',
      },
      {
        id: 'paru-lobus-atas-kiri',
        namaID: 'Segmen Lobus Atas & Lingula Paru Kiri',
        namaLatin: 'Segmenta lobi superioris pulmonis sinistri (cum Lingula)',
        kategori: 'Segmen Paru-paru Kiri',
        meshNodes: [
          'VH_M_left_apical_bronchopulmonary_segment',
          'VH_M_left_posterior_bronchopulmonary_segment',
          'VH_M_left_anterior_bronchopulmonary_segment',
          'VH_M_left_lingula_superior_bronchopulmonary_segment',
          'VH_M_left_lingula_inferior_bronchopulmonary_segment',
          'VH_M_hilum_upper_L',
        ],
        warnaDasar: '#38bdf8',
        ringkasan:
          'Gelambir atas paru-paru kiri yang mencakup segmen apikoposterior, anterior, serta tonjolan menyerupai lidah (lingula superior dan inferior) yang memeluk sisi kiri jantung.',
        fungsi: [
          'Melakukan pertukaran gas di rongga dada kiri atas dan depan',
          'Bagian lingula merupakan homolog anatomis dari lobus tengah paru-paru kanan',
        ],
        faktaKlinis:
          'Lekukan kardiak (insisura kardiaka) pada tepi depan lobus atas kiri memungkinkan jantung berdenyut bebas di rongga dada kiri.',
      },
      {
        id: 'paru-lobus-bawah-kiri',
        namaID: 'Segmen Lobus Bawah Paru Kiri',
        namaLatin: 'Segmenta lobi inferioris pulmonis sinistri',
        kategori: 'Segmen Paru-paru Kiri',
        meshNodes: [
          'VH_M_left_superior_bronchopulmonary_segment',
          'VH_M_left_anterior_basal_bronchopulmonary_segment',
          'VH_M_left_lateral_basal_bronchopulmonary_segment',
          'VH_M_left_medial_basal_bronchopulmonary_segment',
          'VH_M_left_posetrior_basal_bronchopulmonary_segment',
          'VH_M_hilum_lower_L',
          'VH_M_hilum_L',
        ],
        warnaDasar: '#0284c7',
        ringkasan:
          'Gelambir bawah paru-paru kiri di belakang fisura oblik yang bertumpu pada kubah diafragma kiri.',
        fungsi: [
          'Mengembang secara intensif saat inspirasi dalam dan aktivitas fisik',
          'Memfasilitasi pertukaran O2 dan CO2 pada bagian posterior-inferior dada kiri',
        ],
        faktaKlinis:
          'Suara napas vesikuler lobus bawah paling jelas terdengar saat pemeriksaan auskultasi stetoskop pada punggung bawah.',
      },
      {
        id: 'paru-bronkus-lobaris',
        namaID: 'Bronkus Lobaris (Cabang Sekunder)',
        namaLatin: 'Bronchi lobares',
        kategori: 'Percabangan Bronkus & Kartilago',
        meshNodes: [
          'VH_M_right_superior_lobar_bronchus',
          'VH_M_right_intermediate_bronchus',
          'VH_M_right_middle_lobar_bronchus',
          'VH_M_right_lower_lobar_bronchus',
          'VH_M_left_superior_lobar_bronchus',
          'VH_M_left_inferior_lobar_bronchus',
          'VH_M_bronchus',
        ],
        warnaDasar: '#fcd34d',
        ringkasan:
          'Cabang kedua pohon saluran napas setelah bronkus utama yang membagi aliran udara menuju tiga lobus di kanan dan dua lobus di kiri.',
        fungsi: [
          'Menyalurkan udara dari hilus paru menuju setiap gelambir (lobus) paru-paru',
          'Menghangatkan, melembapkan, dan menyaring partikel halus melalui lapisan epitel bersilia',
        ],
        faktaKlinis:
          'Peradangan akut pada mukosa bronkus akibat infeksi virus atau iritasi asap rokok disebut bronkitis.',
      },
      {
        id: 'paru-bronkus-segmentalis',
        namaID: 'Bronkus Segmentalis (Cabang Tersier)',
        namaLatin: 'Bronchi segmentales',
        kategori: 'Percabangan Bronkus & Kartilago',
        meshNodes: [
          'VH_M_right_apical_bronchus',
          'VH_M_right_posterior_bronchus',
          'VH_M_right_anterior_bronchus',
          'VH_M_right_lateral_bronchus',
          'VH_M_right_medial_bronchus',
          'VH_M_right_superior_bronchus',
          'VH_M_right_medial_basal_bronchus',
          'VH_M_right_anterior_basal_bronchus',
          'VH_M_right_lateral_basal_bronchus',
          'VH_M_right_posterior_basal',
          'VH_M_left_apical_bronchus',
          'VH_M_left_anterior_bronchus',
          'VH_M_left_lingular_bronchus',
          'VH_M_left_lingula_superior_bronchus',
          'VH_M_left_lingula_inferior_bronchus',
          'VH_M_left_superior_bronchus',
          'VH_M_left_medial_basal_bronchus',
          'VH_M_left_anterior_basal_bronchus',
          'VH_M_left_lateral_basal_bronchus',
          'VH_M_left_posterior_basal_bronchus',
        ],
        warnaDasar: '#f59e0b',
        ringkasan:
          'Percabangan bronkus tingkat ketiga yang menyuplai udara ke masing-masing segmen bronkopulmonal sebelum bercabang lebih lanjut menjadi bronkiolus.',
        fungsi: [
          'Mengatur distribusi ventilasi udara secara spesifik ke 18–20 segmen fungsional paru-paru',
          'Otot polos dindingnya merespons saraf simpatis (dilatasi) dan parasimpatis (konstriksi)',
        ],
        faktaKlinis:
          'Obat inhaler bronkodilator pada penderita asma bekerja melemaskan otot polos di sepanjang cabang bronkus dan bronkiolus ini.',
      },
      {
        id: 'paru-kartilago-bronkus',
        namaID: 'Lempeng Tulang Rawan Bronkus',
        namaLatin: 'Cartilagines bronchiales',
        kategori: 'Percabangan Bronkus & Kartilago',
        meshNodes: [
          'VH_M_cartilage_of_the_lobar_bronchus_R',
          'VH_M_cartilage_of_the_lobar_bronchus_L',
          'VH_M_cartilage_of_the_tertiary_bronchus_R',
          'VH_M_cartilage_of_the_tertiary_bronchus_L',
        ],
        warnaDasar: '#e2e8f0',
        ringkasan:
          'Keping-keping tulang rawan hialin yang mengelilingi dinding bronkus lobaris dan segmentalis untuk menjaga kepatenan jalan napas di dalam jaringan paru.',
        fungsi: [
          'Menopang dinding bronkus agar tidak kempis (kolaps) saat perubahan tekanan intratoraks waktu bernapas',
        ],
        faktaKlinis:
          'Saat saluran napas beralih dari bronkus ke bronkiolus (diameter < 1 mm), lempeng tulang rawan ini menghilang sepenuhnya dan digantikan oleh otot polos.',
      },
    ],
  },

  // ============================================================================
  // 3. TRAKEA (hra-trachea — 3 sub-meshes)
  // ============================================================================
  {
    id: 'trakea',
    namaID: 'Trakea (Batang Tenggorokan)',
    namaLatin: 'Trachea',
    sistem: 'pernapasan',
    wilayah: 'leher',
    glbChunkId: 'hra-trachea',
    accuracy: 'anatomis',
    ringkasan:
      'Saluran napas utama berbentuk tabung silindris yang menghubungkan laring di leher dengan percabangan bronkus utama di mediastinum atas.',
    fungsiUtama: [
      'Menjadi jalur konduksi udara berhambatan rendah antara saluran napas atas dan paru-paru',
      'Menangkap dan mengeluarkan partikel debu/mikroba melalui sistem eskalator mukosiliar (epitel silindris semu berlapis bersilia)',
      'Mempertahankan jalan napas tetap terbuka berkat deretan cincin tulang rawan hialin berbentuk huruf C',
    ],
    faktaFisiologi:
      'Dinding belakang trakea tidak memiliki tulang rawan melainkan ditutup oleh otot polos trakealis yang lentur, sehingga kerongkongan (esofagus) tepat di belakangnya leluasa mengembang saat menelan bolus makanan.',
    panduanSayatan:
      'Gunakan sayatan pada Sumbu Y (Horizontal / Transversal) untuk melihat penampang melintang cincin tulang rawan trakea yang menyerupai huruf C serta lumen saluran udara di dalamnya.',
    relatedStructureIds: ['trakea'],
    subStructures: [
      {
        id: 'trakea-dinding-mukosa',
        namaID: 'Dinding & Saluran Mukosa Trakea',
        namaLatin: 'Paries membranaceus et Tunica mucosa tracheae',
        kategori: 'Saluran & Cincin Trakea',
        meshNodes: ['VH_M_trachea'],
        warnaDasar: '#38bdf8',
        ringkasan:
          'Tabung jaringan fibromuskular dan lapisan mukosa dalam trakea yang dilapisi jutaan silia mikroskopis dan sel goblet penghasil lendir.',
        fungsi: [
          'Menyaring dan mendorong lendir berisi partikel kotoran naik ke arah faring (eskalator mukosiliar)',
          'Otot trakealis di dinding belakang menyempitkan diameter trakea saat refleks batuk agar aliran udara keluar lebih cepat',
        ],
        faktaKlinis:
          'Zat beracun dalam asap rokok melumpuhkan gerakan silia mukosa trakea sehingga lendir menumpuk dan memicu batuk kronis.',
      },
      {
        id: 'trakea-cincin-kartilago',
        namaID: 'Cincin Tulang Rawan Trakea',
        namaLatin: 'Cartilagines tracheales',
        kategori: 'Saluran & Cincin Trakea',
        meshNodes: ['VH_M_tracheal_cartilage'],
        warnaDasar: '#e2e8f0',
        ringkasan:
          'Susunan 16 hingga 20 cincin tulang rawan hialin berbentuk tapal kuda (huruf C) yang berderet dari bawah laring hingga ke karina.',
        fungsi: [
          'Menjaga lumen trakea tetap bulat dan terbuka meskipun terjadi tekanan negatif saat menarik napas kuat',
          'Memberikan kelenturan saat leher menoleh, menunduk, atau menengadah',
        ],
        faktaKlinis:
          'Bentuk cincin huruf C yang terbuka di sisi posterior adalah adaptasi anatomi penting antara sistem pernapasan (trakea di depan) dan sistem pencernaan (esofagus di belakang).',
      },
      {
        id: 'trakea-karina',
        namaID: 'Karina Trakea (Titik Percabangan)',
        namaLatin: 'Carina tracheae',
        kategori: 'Saluran & Cincin Trakea',
        meshNodes: ['VH_M_carina'],
        warnaDasar: '#fbbf24',
        ringkasan:
          'Tulang rawan paling bawah di ujung trakea (setinggi ruas tulang dada T4–T5) yang memiliki bubungan tajam pemisah jalan masuk ke bronkus utama kanan dan kiri.',
        fungsi: [
          'Membagi aliran udara inspirasi menuju bronkus utama kanan dan kiri',
          'Memiliki reseptor saraf paling peka untuk memicu refleks batuk kuat bila kemasukan benda asing',
        ],
        faktaKlinis:
          'Mukosa karina adalah area paling sensitif di seluruh saluran trakeobronkial dalam mendeteksi aspirasi benda asing.',
      },
    ],
  },

  // ============================================================================
  // 4. LARING (hra-larynx — 7 sub-meshes)
  // ============================================================================
  {
    id: 'laring',
    namaID: 'Laring (Pangkal Tenggorokan & Kotak Suara)',
    namaLatin: 'Larynx',
    sistem: 'pernapasan',
    wilayah: 'leher',
    glbChunkId: 'hra-larynx',
    accuracy: 'anatomis',
    ringkasan:
      'Kompleks sembilan tulang rawan (tiga tunggal dan tiga berpasangan) di leher bagian depan yang menjaga pintu masuk saluran napas bawah sekaligus menghasilkan getaran suara (fonasi).',
    fungsiUtama: [
      'Menjadi katup penjaga saluran napas bawah melalui gerakan refleks epiglotis saat menelan',
      'Menghasilkan suara (fonasi) dengan mengatur ketegangan dan celah pita suara melalui rotasi kartilago aritenoid',
      'Menghubungkan faring (hulu kerongkongan) dengan trakea (batang tenggorokan)',
    ],
    faktaFisiologi:
      'Saat menelan makanan, seluruh rangka laring terangkat ke atas dan ke depan sehingga katup epiglotis melipat menutup pintu glotis dan mengarahkan makanan masuk ke esofagus.',
    panduanSayatan:
      'Gunakan sayatan pada Sumbu X (Sagital) untuk membelah laring menjadi sisi kanan dan kiri sehingga posisi katup epiglotis, perisai tiroid, dan cincin krikoid terlihat jelas dari samping.',
    relatedStructureIds: ['epiglotis-laring'],
    subStructures: [
      {
        id: 'laring-epiglotis',
        namaID: 'Tulang Rawan Epiglotis (Katup Pangkal Tenggorokan)',
        namaLatin: 'Cartilago epiglottica',
        kategori: 'Tulang Rawan Laring',
        meshNodes: ['VH_M_epiglottic_cartilage'],
        warnaDasar: '#fbbf24',
        ringkasan:
          'Tulang rawan elastis berbentuk daun di bagian atas laring tepat di belakang akar lidah.',
        fungsi: [
          'Menutup pintu masuk laring (aditus laringis) secara otomatis saat menelan makanan atau minuman',
          'Membuka kembali saat bernapas dan berbicara agar udara bebas keluar-masuk trakea',
        ],
        faktaKlinis:
          'Berbicara sambil makan dapat mengganggu koordinasi penutupan epiglotis sehingga makanan masuk ke saluran napas dan memicu refleks tersedak.',
      },
      {
        id: 'laring-kartilago-tiroid',
        namaID: 'Tulang Rawan Tiroid (Perisai / Jakun)',
        namaLatin: 'Cartilago thyroidea',
        kategori: 'Tulang Rawan Laring',
        meshNodes: ['VH_M_thyroid_cartilage'],
        warnaDasar: '#38bdf8',
        ringkasan:
          'Tulang rawan hialin terbesar pada laring yang terdiri atas dua lempeng (lamina) kanan dan kiri yang menyatu di garis depan membentuk tonjolan laring (jakun / prominensia laringea).',
        fungsi: [
          'Melindungi pita suara (plika vokalis) yang melekat tepat di permukaan belakangnya',
          'Menjadi kerangka utama penopang dinding depan laring',
        ],
        faktaKlinis:
          'Saat masa pubertas, hormon testosteron pada laki-laki memicu pertumbuhan lempeng kartilago tiroid dengan sudut lebih lancip (±90°) sehingga jakun tampak menonjol dan pita suara memanjang (suara menjadi lebih berat).',
      },
      {
        id: 'laring-kartilago-krikoid',
        namaID: 'Tulang Rawan Krikoid (Cincin Utuh)',
        namaLatin: 'Cartilago cricoidea',
        kategori: 'Tulang Rawan Laring',
        meshNodes: ['VH_M_cricoid_cartilage'],
        warnaDasar: '#06b6d4',
        ringkasan:
          'Tulang rawan hialin berbentuk cincin stempel di dasar laring yang merupakan satu-satunya cincin tulang rawan yang melingkar penuh (360°) di seluruh saluran pernapasan.',
        fungsi: [
          'Menjadi fondasi penopang kartilago tiroid dan sepasang kartilago aritenoid di atasnya',
          'Menghubungkan ujung bawah laring dengan cincin pertama trakea',
        ],
        faktaKlinis:
          'Berbeda dengan cincin trakea yang berbentuk huruf C, kartilago krikoid berbentuk cincin utuh untuk menjaga kestabilan sendi pita suara.',
      },
      {
        id: 'laring-kartilago-aritenoid',
        namaID: 'Sepasang Tulang Rawan Aritenoid',
        namaLatin: 'Cartilagines arytenoideae (Dextra et Sinistra)',
        kategori: 'Tulang Rawan Laring',
        meshNodes: [
          'VH_M_arytenoid_cartilage_R',
          'VH_M_arytenoid_cartilage_L',
        ],
        warnaDasar: '#f43f5e',
        ringkasan:
          'Sepasang tulang rawan berbentuk piramida tiga sisi yang duduk di atas tepi belakang kartilago krikoid dan menjadi tempat perlekatan ujung belakang pita suara.',
        fungsi: [
          'Berputar dan bergeser untuk membuka (abduksi) atau menutup (adduksi) celah pita suara (rima glotidis)',
          'Mengatur ketegangan pita suara untuk menghasilkan tinggi-rendahnya nada suara (pitch)',
        ],
        faktaKlinis:
          'Tanpa gerakan rotasi kartilago aritenoid, manusia tidak dapat mengubah celah pita suara untuk berbisik, berbicara, maupun bernyanyi.',
      },
      {
        id: 'laring-kartilago-kornikulata',
        namaID: 'Sepasang Tulang Rawan Kornikulata',
        namaLatin: 'Cartilagines corniculatae (Santorini)',
        kategori: 'Tulang Rawan Laring',
        meshNodes: [
          'VH_M_corniculate_cartilage_R',
          'VH_M_corniculate_cartilage_L',
        ],
        warnaDasar: '#a855f7',
        ringkasan:
          'Sepasang nodul tulang rawan elastis kecil berbentuk tanduk kerucut yang duduk tepat di puncak (apeks) kartilago aritenoid kanan dan kiri.',
        fungsi: [
          'Memperpanjang puncak aritenoid ke arah belakang-tengah',
          'Memperkuat lipatan ariepiglotika yang membatasi pintu masuk laring',
        ],
        faktaKlinis:
          'Bersama kartilago aritenoid, tonjolan kartilago kornikulata membantu mengarahkan cairan ludah dan minuman ke sisi kiri-kanan laring (sinus piriformis) menuju kerongkongan.',
      },
    ],
  },
];

export const DETAILED_ORGANS: readonly DetailedOrgan[] =
  RAW_DETAILED_ORGANS.map((item) => DetailedOrganSchema.parse(item));
