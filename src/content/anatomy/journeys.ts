import {
  CinematicJourneySchema,
  type CinematicJourney,
} from '@/content/schema/anatomy.schema';

const RAW_JOURNEYS: CinematicJourney[] = [
  {
    id: 'perjalanan-sel-darah-merah',
    judul: 'Perjalanan Sel Darah Merah: Dari Vena Kava ke Paru-paru & Jantung Kiri',
    subjudulLatin: 'Iter Erythrocyti per Circulationem Pulmonalem et Cordis',
    sistemTerkait: ['peredaran-darah', 'pernapasan'],
    durasiDetikDefault: 54,
    ringkasan:
      'Ikuti perjalanan sinematik satu keping sel darah merah (eritrosit) pembawa hemoglobin saat kembali dari jaringan tubuh melalui Vena Kava, dipompa oleh Serambi Kanan dan Bilik Kanan melintasi Arteri Pulmonalis, hingga melepaskan CO2 dan mengikat O2 segar di alveolus Paru-paru.',
    catatanTransparansiSkematis:
      'Posisi organ jantung, pembuluh darah besar, dan paru-paru menggunakan Model Anatomis Terukur (Z-Anatomy 1:1). Ukuran sel darah merah, jalur rel kapiler internal, dan partikel difusi gas O2/CO2 di alveolus diperbesar sebagai Ilustrasi Skematis agar proses fisiologis terlihat jelas.',
    controlPoints: [
      [-0.036, 1.392, 0.012], // 0: Hulu Vena Kava Superior
      [-0.033, 1.338, 0.018], // 1: Muara Vena Kava ke Serambi Kanan
      [-0.026, 1.296, 0.028], // 2: Rongga Serambi Kanan (Atrium Dekstrum)
      [-0.012, 1.274, 0.044], // 3: Melewati Katup Trikuspidalis
      [0.006, 1.254, 0.058],  // 4: Dasar Bilik Kanan (Ventrikel Dekster)
      [0.014, 1.284, 0.048],  // 5: Konus Arteriosus / Katup Semilunaris Pulmonal
      [0.006, 1.318, 0.032],  // 6: Batang Arteri Pulmonalis (Trunkus Pulmonalis)
      [-0.028, 1.334, 0.014], // 7: Percabangan Arteri Pulmonalis Kanan
      [-0.068, 1.324, 0.012], // 8: Hilus Paru-paru Kanan
      [-0.098, 1.308, 0.022], // 9: Anyaman Kapiler Alveolus Paru Kanan (Awal Difusi)
      [-0.104, 1.286, -0.004],// 10: Puncak Pertukaran Gas O2 & CO2 di Alveolus
      [-0.064, 1.292, 0.004], // 11: Vena Pulmonalis Kanan (Darah Kaya O2)
      [0.028, 1.296, -0.008], // 12: Masuk Serambi Kiri (Atrium Sinistrum)
      [0.045, 1.258, 0.038],  // 13: Bilik Kiri (Ventrikel Sinister)
      [0.015, 1.345, 0.025],  // 14: Ejeksi ke Aorta Asendens
    ],
    chapters: [
      {
        id: 'bab-1-vena-kava',
        nomor: 1,
        judul: 'Vena Kava: Kembalinya Darah Deoksigenasi',
        subjudulLatin: 'Vena cava superior et inferior',
        tStart: 0.0,
        tEnd: 0.16,
        structureId: 'vena-kava',
        accuracyBadge: 'anatomis',
        statusDarah: 'deoksigenasi',
        kadarO2Persen: 73,
        kadarCO2MmHg: 46,
        tekananLokal: '4–6 mmHg (Tekanan Vena Sentral)',
        ringkasanFisiologi:
          'Setelah menyuplai oksigen ke sel-sel tubuh untuk respirasi seluler, sel darah merah mengangkut sisa metabolisme karbon dioksida (CO2) dan mengalir kembali menuju jantung melalui pembuluh balik besar Vena Kava.',
      },
      {
        id: 'bab-2-serambi-kanan',
        nomor: 2,
        judul: 'Serambi Kanan & Pacu Jantung Alami',
        subjudulLatin: 'Atrium cordis dextrum et Valva tricuspidalis',
        tStart: 0.16,
        tEnd: 0.32,
        structureId: 'serambi-kanan',
        accuracyBadge: 'anatomis',
        statusDarah: 'deoksigenasi',
        kadarO2Persen: 74,
        kadarCO2MmHg: 46,
        tekananLokal: '2–8 mmHg (Pengisian Atrium)',
        ringkasanFisiologi:
          'Darah bermuara di Serambi Kanan. Di dinding atas ruang ini, Nodus Sinoatrial (SA Node) melepaskan impuls listrik yang memicu kontraksi serambi dan mendorong darah melewati Katup Trikuspidalis (tiga daun).',
      },
      {
        id: 'bab-3-bilik-kanan',
        nomor: 3,
        judul: 'Bilik Kanan: Pompa Sirkulasi Pulmonal',
        subjudulLatin: 'Ventriculus cordis dexter (Systole)',
        tStart: 0.32,
        tEnd: 0.48,
        structureId: 'bilik-kanan',
        accuracyBadge: 'anatomis',
        statusDarah: 'deoksigenasi',
        kadarO2Persen: 75,
        kadarCO2MmHg: 45,
        tekananLokal: '25/4 mmHg (Sistol/Diastol Bilik Kanan)',
        ringkasanFisiologi:
          'Saat Bilik Kanan berkontraksi (sistol), Katup Trikuspidalis menutup rapat ditahan oleh korda tendinea dan otot papilaris, sementara tekanan mendorong Katup Semilunaris Pulmonal terbuka.',
      },
      {
        id: 'bab-4-arteri-pulmonalis',
        nomor: 4,
        judul: 'Arteri Pulmonalis: Menuju Paru-paru',
        subjudulLatin: 'Truncus pulmonalis et Arteria pulmonalis',
        tStart: 0.48,
        tEnd: 0.64,
        structureId: 'pembuluh-pulmonal',
        accuracyBadge: 'anatomis',
        statusDarah: 'deoksigenasi',
        kadarO2Persen: 75,
        kadarCO2MmHg: 45,
        tekananLokal: '25/10 mmHg (Arteri Pulmonalis)',
        ringkasanFisiologi:
          'Sel darah merah melaju di dalam Trunkus Pulmonalis yang bercabang menuju paru-paru kanan dan kiri. Arteri pulmonalis adalah satu-satunya arteri pada manusia dewasa yang membawa darah miskin oksigen.',
      },
      {
        id: 'bab-5-alveolus-paru',
        nomor: 5,
        judul: 'Kapiler Alveolus Paru-paru: Difusi Gas O2 & CO2',
        subjudulLatin: 'Alveoli pulmonis (Diffusio gasorum)',
        tStart: 0.64,
        tEnd: 0.84,
        structureId: 'paru-paru-kanan',
        accuracyBadge: 'skematis',
        statusDarah: 'transisi-alveolus',
        kadarO2Persen: 97,
        kadarCO2MmHg: 40,
        tekananLokal: '8–10 mmHg (Kapiler Pulmonal)',
        ringkasanFisiologi:
          'Di jalinan kapiler yang menyelimuti kantung alveolus paru-paru, CO2 berdifusi keluar menuju rongga alveolus untuk diembuskan, sementara molekul O2 berdifusi menembus membran respirasi dan berikatan dengan hemoglobin (Hb) membentuk oksihemoglobin (HbO2) berwarna merah cerah.',
      },
      {
        id: 'bab-6-jantung-kiri-aorta',
        nomor: 6,
        judul: 'Vena Pulmonalis, Jantung Kiri & Ejeksi Aorta',
        subjudulLatin: 'Venae pulmonales, Atrium/Ventriculus sinister et Aorta',
        tStart: 0.84,
        tEnd: 1.0,
        structureId: 'bilik-kiri',
        accuracyBadge: 'anatomis',
        statusDarah: 'oksigenasi',
        kadarO2Persen: 98,
        kadarCO2MmHg: 40,
        tekananLokal: '120/80 mmHg (Bilik Kiri & Aorta)',
        ringkasanFisiologi:
          'Kini kaya akan oksigen (saturasi O2 ~98%), sel darah merah mengalir melalui Vena Pulmonalis ke Serambi Kiri, melewati Katup Mitral ke Bilik Kiri berdinding tebal, lalu dipompa dengan tekanan tinggi ke Aorta menuju seluruh tubuh.',
      },
    ],
    subtitles: [
      {
        id: 'sub-01',
        tStart: 0.0,
        tEnd: 0.08,
        teks: 'Perjalanan kita dimulai di Vena Kava Superior. Sel darah merah (eritrosit) ini baru saja kembali dari jaringan tubuh setelah menyerahkan oksigen.',
        istilahPenting: ['Vena Kava Superior', 'Eritrosit', 'Deoksigenasi'],
      },
      {
        id: 'sub-02',
        tStart: 0.08,
        tEnd: 0.16,
        teks: 'Karena kandungan oksigennya rendah (~73%) dan kaya karbon dioksida (CO2), hemoglobin di dalam sel darah merah tampak berwarna merah gelap kebiruan.',
        istilahPenting: ['Hemoglobin (Hb)', 'Karbon Dioksida (CO2)'],
      },
      {
        id: 'sub-03',
        tStart: 0.16,
        tEnd: 0.24,
        teks: 'Kita memasuki Serambi Kanan (Atrium Dekstrum). Impuls listrik dari Nodus Sinoatrial (SA Node) memicu dinding serambi berkontraksi.',
        istilahPenting: ['Serambi Kanan', 'Nodus Sinoatrial (SA Node)'],
      },
      {
        id: 'sub-04',
        tStart: 0.24,
        tEnd: 0.32,
        teks: 'Aliran darah mendorong tiga daun Katup Trikuspidalis membuka, mengantarkan sel darah merah turun memasuki Bilik Kanan.',
        istilahPenting: ['Katup Trikuspidalis', 'Diastol Ventrikel'],
      },
      {
        id: 'sub-05',
        tStart: 0.32,
        tEnd: 0.40,
        teks: 'Sistol dimulai! Dinding otot Bilik Kanan berkontraksi; Katup Trikuspidalis menutup rapat menghasilkan bunyi jantung pertama ("LUB").',
        istilahPenting: ['Bilik Kanan', 'Sistol', 'Bunyi Jantung S1'],
      },
      {
        id: 'sub-06',
        tStart: 0.40,
        tEnd: 0.48,
        teks: 'Tekanan di dalam Bilik Kanan membuka Katup Semilunaris Pulmonal dan melontarkan sel darah merah ke dalam batang Arteri Pulmonalis.',
        istilahPenting: ['Katup Pulmonal', 'Trunkus Pulmonalis'],
      },
      {
        id: 'sub-07',
        tStart: 0.48,
        tEnd: 0.56,
        teks: 'Perhatikan fakta penting Biologi SMA: meskipun disebut arteri karena keluar dari jantung, Arteri Pulmonalis mengangkut darah miskin oksigen.',
        istilahPenting: ['Arteri Pulmonalis', 'Peredaran Darah Kecil'],
      },
      {
        id: 'sub-08',
        tStart: 0.56,
        tEnd: 0.64,
        teks: 'Cabang Arteri Pulmonalis Kanan membawa sel darah merah menembus hilus paru-paru menuju bronkiolus respiratorius dan kantung alveolus.',
        istilahPenting: ['Hilus Paru-paru', 'Arteriol Pulmonal'],
      },
      {
        id: 'sub-09',
        tStart: 0.64,
        tEnd: 0.74,
        teks: '[Ilustrasi Skematis] Di kapiler alveolus yang berdinding sangat tipis (0,5 mikrometer), gas CO2 berdifusi keluar menuju udara alveolus.',
        istilahPenting: ['Kapiler Alveolus', 'Membran Respirasi', 'Difusi CO2'],
      },
      {
        id: 'sub-10',
        tStart: 0.74,
        tEnd: 0.84,
        teks: '[Ilustrasi Skematis] Secara bersamaan, molekul O2 segar berdifusi masuk dan diikat oleh gugus heme menjadi Oksihemoglobin (HbO2) berwarna merah cerah!',
        istilahPenting: ['Oksihemoglobin (HbO2)', 'Difusi Oksigen (O2)'],
      },
      {
        id: 'sub-11',
        tStart: 0.84,
        tEnd: 0.92,
        teks: 'Membawa oksigen penuh (saturasi 98%), sel darah merah kembali ke jantung melalui Vena Pulmonalis menuju Serambi Kiri dan melewati Katup Mitral.',
        istilahPenting: ['Vena Pulmonalis', 'Serambi Kiri', 'Katup Mitral'],
      },
      {
        id: 'sub-12',
        tEnd: 1.0,
        tStart: 0.92,
        teks: 'Bilik Kiri yang berdinding otot paling tebal memompa sel darah merah ke Aorta dengan tekanan ~120 mmHg untuk mengedarkan oksigen ke seluruh tubuh!',
        istilahPenting: ['Bilik Kiri', 'Aorta', 'Peredaran Darah Besar'],
      },
    ],
  },
];

export const CINEMATIC_JOURNEYS: readonly CinematicJourney[] =
  RAW_JOURNEYS.map((item) => CinematicJourneySchema.parse(item));
