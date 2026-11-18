import { useEffect, useMemo, useState } from 'react';
import {
  QUIZ_QUESTIONS,
  getDetailedOrganById,
  getStructureById,
  getSystemById,
} from '@/content/anatomy';
import type { SystemId } from '@/content/schema/anatomy.schema';
import type {
  QuizQuestion,
  SequenceOrderQuestion,
} from '@/content/schema/kuis.schema';
import { computeStructureFocusBookmark } from '@/scene/body/glbLoader';
import { computeSubStructureFocusBookmark } from '@/scene/organ/IsolatedOrganViewer';
import { useSceneStore } from '@/stores/sceneStore';
import { useCameraStore } from '@/stores/cameraStore';
import {
  LEARNING_BADGES,
  useLearningStore,
} from '@/stores/learningStore';

type QuizFilterMode =
  | 'semua'
  | 'tunjuk-3d'
  | 'rangka'
  | 'peredaran-darah'
  | 'pernapasan';

const FILTER_OPTIONS: { id: QuizFilterMode; label: string }[] = [
  { id: 'semua', label: 'Semua (15)' },
  { id: 'tunjuk-3d', label: 'Tunjuk 3D (6)' },
  { id: 'rangka', label: 'Rangka' },
  { id: 'peredaran-darah', label: 'Peredaran' },
  { id: 'pernapasan', label: 'Pernapasan' },
];

function scrambleSteps(
  steps: SequenceOrderQuestion['langkahUrut'],
): SequenceOrderQuestion['langkahUrut'] {
  if (steps.length < 4) return [...steps].reverse();
  return [steps[2], steps[0], steps[4] ?? steps[3], steps[1], steps[3]].slice(
    0,
    steps.length,
  );
}

interface QuestionEvaluation {
  isCorrect: boolean;
  userAnswerSummary: string;
}

export function KuisPage() {
  const [filterMode, setFilterMode] = useState<QuizFilterMode>('semua');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [mcChoiceId, setMcChoiceId] = useState<string | null>(null);
  const [sequenceItems, setSequenceItems] = useState<
    { id: string; label: string }[]
  >([]);
  const [evaluations, setEvaluations] = useState<
    Record<string, QuestionEvaluation>
  >({});
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [point3DCorrectCount, setPoint3DCorrectCount] = useState<number>(0);

  const selectedStructureId = useSceneStore((s) => s.selectedStructureId);
  const selectedSubStructureId = useSceneStore((s) => s.selectedSubStructureId);
  const hoveredStructureId = useSceneStore((s) => s.hoveredStructureId);
  const hoveredSubStructureId = useSceneStore((s) => s.hoveredSubStructureId);
  const isolatedOrganId = useSceneStore((s) => s.isolatedOrganId);
  const xrayMode = useSceneStore((s) => s.xrayMode);

  const selectStructure = useSceneStore((s) => s.selectStructure);
  const selectSubStructure = useSceneStore((s) => s.selectSubStructure);
  const setSystemFilter = useSceneStore((s) => s.setSystemFilter);
  const enterIsolatedOrgan = useSceneStore((s) => s.enterIsolatedOrgan);
  const exitIsolatedOrgan = useSceneStore((s) => s.exitIsolatedOrgan);
  const setXrayMode = useSceneStore((s) => s.setXrayMode);

  const flyTo = useCameraStore((s) => s.flyTo);
  const setAutoRotate = useCameraStore((s) => s.setAutoRotate);

  const bestQuizScore = useLearningStore((s) => s.bestQuizScore);
  const earnedBadges = useLearningStore((s) => s.earnedBadges);
  const recordQuizSession = useLearningStore((s) => s.recordQuizSession);
  const markStructureExplored = useLearningStore(
    (s) => s.markStructureExplored,
  );

  const filteredQuestions = useMemo((): QuizQuestion[] => {
    return QUIZ_QUESTIONS.filter((q) => {
      if (filterMode === 'semua') return true;
      if (filterMode === 'tunjuk-3d') return q.tipe === 'tunjuk-3d';
      return q.sistem === (filterMode as SystemId);
    });
  }, [filterMode]);

  const currentQuestion =
    filteredQuestions[currentIndex] ?? filteredQuestions[0];

  useEffect(() => {
    setAutoRotate(false);
    return () => {
      exitIsolatedOrgan();
      setXrayMode(false);
    };
  }, [exitIsolatedOrgan, setAutoRotate, setXrayMode]);

  useEffect(() => {
    if (!currentQuestion) return;
    setMcChoiceId(null);

    if (currentQuestion.tipe === 'urutkan-alur') {
      setSequenceItems(scrambleSteps(currentQuestion.langkahUrut));
    }

    if (currentQuestion.tipe === 'tunjuk-3d') {
      if (
        currentQuestion.modePanggung === 'isolasi-organ' &&
        currentQuestion.organIsolasiId
      ) {
        enterIsolatedOrgan(currentQuestion.organIsolasiId);
        selectSubStructure(null);
        setXrayMode(currentQuestion.organIsolasiId === 'jantung');
        flyTo(currentQuestion.kameraAwal, 'orbit');
      } else {
        exitIsolatedOrgan();
        setSystemFilter(currentQuestion.sistem);
        selectStructure(null);
        setXrayMode(false);
        flyTo(currentQuestion.kameraAwal, 'orbit');
      }
    } else {
      exitIsolatedOrgan();
      setSystemFilter(currentQuestion.sistem);
      setXrayMode(false);
      const st = getStructureById(currentQuestion.targetStructureId);
      if (st) {
        selectStructure(st.id);
        const bm = computeStructureFocusBookmark(st.id) ?? st.kameraFokus;
        flyTo(bm, 'organ-focus');
      }
    }
  }, [
    currentQuestion,
    enterIsolatedOrgan,
    exitIsolatedOrgan,
    flyTo,
    selectStructure,
    selectSubStructure,
    setSystemFilter,
    setXrayMode,
  ]);

  if (!currentQuestion) return null;

  const currentEval = evaluations[currentQuestion.id];
  const systemMeta = getSystemById(currentQuestion.sistem);

  const answeredCount = filteredQuestions.filter(
    (q) => evaluations[q.id] !== undefined,
  ).length;
  const correctCount = filteredQuestions.filter(
    (q) => evaluations[q.id]?.isCorrect,
  ).length;
  const currentScorePct =
    filteredQuestions.length > 0
      ? Math.round((correctCount / filteredQuestions.length) * 100)
      : 0;

  const picked3DInfo = (() => {
    if (currentQuestion.tipe !== 'tunjuk-3d') return null;
    if (
      currentQuestion.modePanggung === 'isolasi-organ' &&
      currentQuestion.organIsolasiId
    ) {
      const organ = getDetailedOrganById(currentQuestion.organIsolasiId);
      const sub = organ?.subStructures.find(
        (s) => s.id === selectedSubStructureId,
      );
      if (!sub) return null;
      return {
        id: sub.id,
        namaID: sub.namaID,
        namaLatin: sub.namaLatin,
      };
    }
    const st = getStructureById(selectedStructureId ?? '');
    if (!st) return null;
    return {
      id: st.id,
      namaID: st.namaID,
      namaLatin: st.namaLatin,
    };
  })();

  const hovered3DInfo = (() => {
    if (isolatedOrganId) {
      const organ = getDetailedOrganById(isolatedOrganId);
      const sub = organ?.subStructures.find(
        (s) => s.id === hoveredSubStructureId,
      );
      return sub ? `${sub.namaID} (${sub.namaLatin})` : null;
    }
    const st = getStructureById(hoveredStructureId ?? '');
    return st ? `${st.namaID} (${st.namaLatin})` : null;
  })();

  const commitEvaluation = (
    question: QuizQuestion,
    isCorrect: boolean,
    userAnswerSummary: string,
  ) => {
    const nextEvals = {
      ...evaluations,
      [question.id]: { isCorrect, userAnswerSummary },
    };
    setEvaluations(nextEvals);

    const nextStreak = isCorrect ? currentStreak + 1 : 0;
    const nextMaxStreak = Math.max(maxStreak, nextStreak);
    const nextPoint3D =
      point3DCorrectCount +
      (question.tipe === 'tunjuk-3d' && isCorrect ? 1 : 0);

    setCurrentStreak(nextStreak);
    setMaxStreak(nextMaxStreak);
    setPoint3DCorrectCount(nextPoint3D);

    markStructureExplored(question.targetStructureId);

    const totalCorrect = filteredQuestions.filter(
      (q) => nextEvals[q.id]?.isCorrect,
    ).length;
    const pct = Math.round((totalCorrect / filteredQuestions.length) * 100);
    recordQuizSession({
      quizId: `kuis-${filterMode}`,
      scorePercent: pct,
      maxStreak: nextMaxStreak,
      point3DCorrectCount: question.tipe === 'tunjuk-3d' && isCorrect ? 1 : 0,
    });
  };

  const handleGradeQuestion = () => {
    if (currentEval) return;

    if (currentQuestion.tipe === 'pilihan-ganda') {
      if (!mcChoiceId) return;
      const pickedOpt = currentQuestion.pilihan.find(
        (o) => o.id === mcChoiceId,
      );
      const isCorrect = mcChoiceId === currentQuestion.jawabanBenarId;
      commitEvaluation(
        currentQuestion,
        isCorrect,
        pickedOpt?.teks ?? mcChoiceId,
      );
      return;
    }

    if (currentQuestion.tipe === 'tunjuk-3d') {
      if (!picked3DInfo) return;
      const expectedId =
        currentQuestion.modePanggung === 'isolasi-organ' &&
        currentQuestion.targetSubStructureId
          ? currentQuestion.targetSubStructureId
          : currentQuestion.targetStructureId;
      const isCorrect = picked3DInfo.id === expectedId;
      commitEvaluation(
        currentQuestion,
        isCorrect,
        `${picked3DInfo.namaID} (${picked3DInfo.namaLatin})`,
      );
      return;
    }

    if (currentQuestion.tipe === 'urutkan-alur') {
      const expectedIds = currentQuestion.langkahUrut.map((s) => s.id);
      const userIds = sequenceItems.map((s) => s.id);
      const isCorrect =
        expectedIds.length === userIds.length &&
        expectedIds.every((id, idx) => id === userIds[idx]);
      commitEvaluation(
        currentQuestion,
        isCorrect,
        isCorrect ? 'Urutan Tepat' : 'Urutan Belum Sesuai',
      );
    }
  };

  const handleRevealTargetIn3D = () => {
    if (
      currentQuestion.tipe === 'tunjuk-3d' &&
      currentQuestion.modePanggung === 'isolasi-organ' &&
      currentQuestion.targetSubStructureId
    ) {
      selectSubStructure(currentQuestion.targetSubStructureId);
      const bm = computeSubStructureFocusBookmark(
        currentQuestion.targetSubStructureId,
      );
      if (bm) flyTo(bm, 'organ-focus');
      return;
    }
    const st = getStructureById(currentQuestion.targetStructureId);
    if (st) {
      selectStructure(st.id);
      const bm = computeStructureFocusBookmark(st.id) ?? st.kameraFokus;
      flyTo(bm, 'organ-focus');
    }
  };

  const moveSequenceStep = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sequenceItems.length) return;
    const copy = [...sequenceItems];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setSequenceItems(copy);
  };

  const handleChangeFilter = (mode: QuizFilterMode) => {
    setFilterMode(mode);
    setCurrentIndex(0);
  };

  const handleResetQuizSession = () => {
    setEvaluations({});
    setCurrentStreak(0);
    setCurrentIndex(0);
  };

  return (
    <div className="hud-split-layout">
      {/* LEFT HUD COLUMN: Skor, Kategori, Nomor Soal & Lencana */}
      <aside
        className="hud-column pointer-auto"
        aria-label="Navigasi Kuis dan Skor"
      >
        <section className="glass-panel section-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span className="badge badge-cyan">Kuis Anatomi 3D</span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleResetQuizSession}
            >
              Ulangi
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 6,
            }}
          >
            <div className="layer-control-row" style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
                Skor
              </span>
              <strong style={{ fontSize: 17, color: 'var(--accent-light)' }}>
                {currentScorePct}%
              </strong>
            </div>
            <div className="layer-control-row" style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
                Beruntun
              </span>
              <strong style={{ fontSize: 17, color: '#facc15' }}>
                {currentStreak}x
              </strong>
            </div>
            <div className="layer-control-row" style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
                Rekor
              </span>
              <strong style={{ fontSize: 17, color: '#34d399' }}>
                {bestQuizScore[`kuis-${filterMode}`] ?? 0}%
              </strong>
            </div>
          </div>

          <div className="chip-row" role="group" aria-label="Filter Kuis">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={
                  filterMode === opt.id ? 'chip-btn active' : 'chip-btn'
                }
                onClick={() => handleChangeFilter(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11.5,
                color: 'var(--text-secondary)',
              }}
            >
              <span>Nomor Soal</span>
              <span>
                {answeredCount}/{filteredQuestions.length} Terjawab
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 5,
              }}
            >
              {filteredQuestions.map((q, idx) => {
                const ev = evaluations[q.id];
                const isCurrent = idx === currentIndex;
                const borderColor = ev
                  ? ev.isCorrect
                    ? '#34d399'
                    : '#f87171'
                  : isCurrent
                    ? 'var(--accent-primary)'
                    : 'var(--glass-border)';
                return (
                  <button
                    key={q.id}
                    type="button"
                    className={
                      isCurrent ? 'btn btn-primary btn-sm' : 'btn btn-sm'
                    }
                    style={{
                      borderColor,
                      padding: '6px 4px',
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {idx + 1}
                    {ev ? (ev.isCorrect ? '✓' : '✗') : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="glass-panel section-card"
          style={{ flex: 1, minHeight: 180 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2 style={{ fontSize: 14.5 }}>
              Lencana ({earnedBadges.length}/{LEARNING_BADGES.length})
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              overflowY: 'auto',
              maxHeight: 220,
            }}
          >
            {LEARNING_BADGES.map((badge) => {
              const unlocked = earnedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: unlocked
                      ? 'rgba(52, 211, 153, 0.12)'
                      : 'var(--glass-bg-subtle)',
                    border: `1px solid ${
                      unlocked
                        ? 'rgba(52, 211, 153, 0.4)'
                        : 'var(--glass-border)'
                    }`,
                    opacity: unlocked ? 1 : 0.6,
                    fontSize: 11.5,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: unlocked ? '#34d399' : 'var(--text-secondary)',
                    }}
                  >
                    {unlocked ? '✓ ' : '• '}
                    {badge.nama}
                  </div>
                  <div
                    style={{
                      color: 'var(--text-secondary)',
                      marginTop: 2,
                      fontSize: 11,
                    }}
                  >
                    {badge.deskripsi}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </aside>

      {/* CENTER VIEWPORT HUD */}
      <div className="hud-center-column">
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {currentQuestion.tipe === 'tunjuk-3d' && (
            <div
              className="glass-panel-strong pointer-auto"
              style={{
                padding: '7px 14px',
                fontSize: 12,
                borderColor: 'var(--accent-primary)',
              }}
            >
              <strong>Tunjuk 3D:</strong> Klik bagian tubuh yang diminta pada
              model 3D.
            </div>
          )}

          <button
            type="button"
            className={
              xrayMode
                ? 'btn btn-primary btn-sm pointer-auto'
                : 'btn btn-sm pointer-auto'
            }
            onClick={() => setXrayMode(!xrayMode)}
          >
            {xrayMode ? 'Sinar-X: Aktif' : 'Mode Sinar-X'}
          </button>

          <button
            type="button"
            className="btn btn-sm pointer-auto"
            onClick={handleRevealTargetIn3D}
          >
            Fokus ke Objek Soal
          </button>
        </div>

        {hovered3DInfo && (
          <div
            className="glass-panel pointer-auto"
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            <strong>{hovered3DInfo}</strong>
          </div>
        )}
      </div>

      {/* RIGHT HUD COLUMN: Question & Feedback Card */}
      <aside
        className="hud-column pointer-auto"
        aria-label="Panel Pertanyaan Kuis"
      >
        <section className="glass-panel-strong section-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <span className="badge badge-cyan">
              Soal {currentIndex + 1} / {filteredQuestions.length} •{' '}
              {currentQuestion.tipe === 'pilihan-ganda'
                ? 'Pilihan Ganda'
                : currentQuestion.tipe === 'tunjuk-3d'
                  ? 'Tunjuk 3D'
                  : 'Urutkan Alur'}
            </span>

            {systemMeta && (
              <span
                className="badge"
                style={{
                  background: 'rgba(12, 23, 38, 0.9)',
                  border: `1px solid ${systemMeta.warnaAksen}`,
                  color: systemMeta.warnaAksen,
                }}
              >
                {systemMeta.namaID.replace('Sistem ', '')}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 16.5, lineHeight: 1.45 }}>
            {currentQuestion.pertanyaan}
          </h1>

          {currentQuestion.tipe === 'pilihan-ganda' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {currentQuestion.pilihan.map((opt, idx) => {
                const isSelected = mcChoiceId === opt.id;
                const isRightOption =
                  currentEval && opt.id === currentQuestion.jawabanBenarId;
                const isWrongPicked =
                  currentEval &&
                  isSelected &&
                  opt.id !== currentQuestion.jawabanBenarId;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={Boolean(currentEval)}
                    className={
                      isSelected ? 'btn btn-primary btn-sm' : 'btn btn-sm'
                    }
                    style={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      padding: '9px 12px',
                      borderColor: isRightOption
                        ? '#34d399'
                        : isWrongPicked
                          ? '#f87171'
                          : undefined,
                    }}
                    onClick={() => setMcChoiceId(opt.id)}
                  >
                    <strong style={{ marginRight: 6 }}>
                      {String.fromCharCode(65 + idx)}.
                    </strong>
                    <span>{opt.teks}</span>
                  </button>
                );
              })}
            </div>
          )}

          {currentQuestion.tipe === 'tunjuk-3d' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  padding: 10,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(20, 184, 166, 0.1)',
                  border: '1px solid var(--glass-border-strong)',
                  fontSize: 12,
                }}
              >
                <strong>Petunjuk:</strong>
                <p className="muted-text" style={{ marginTop: 3, fontSize: 12 }}>
                  {currentQuestion.petunjukVisual}
                </p>
              </div>

              <div
                style={{
                  padding: 11,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg-subtle)',
                  border: `1px solid ${
                    picked3DInfo
                      ? 'var(--accent-primary)'
                      : 'var(--glass-border)'
                  }`,
                  fontSize: 12.5,
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Bagian yang Anda Pilih:
                </div>
                {picked3DInfo ? (
                  <div style={{ marginTop: 3, fontWeight: 700 }}>
                    {picked3DInfo.namaID}{' '}
                    <em style={{ fontWeight: 400, opacity: 0.8 }}>
                      ({picked3DInfo.namaLatin})
                    </em>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: 3,
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                    }}
                  >
                    Klik langsung pada model 3D di tengah layar...
                  </div>
                )}
              </div>
            </div>
          )}

          {currentQuestion.tipe === 'urutkan-alur' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                Urutkan langkah menggunakan tombol ▲ / ▼:
              </span>
              {sequenceItems.map((step, idx) => (
                <div
                  key={step.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--glass-bg-subtle)',
                    border: '1px solid var(--glass-border)',
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span
                      style={{
                        minWidth: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'var(--accent-soft)',
                        color: 'var(--accent-light)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span>{step.label}</span>
                  </div>

                  {!currentEval && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        className="chip-btn"
                        disabled={idx === 0}
                        onClick={() => moveSequenceStep(idx, -1)}
                        aria-label={`Geser langkah ${idx + 1} ke atas`}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="chip-btn"
                        disabled={idx === sequenceItems.length - 1}
                        onClick={() => moveSequenceStep(idx, 1)}
                        aria-label={`Geser langkah ${idx + 1} ke bawah`}
                      >
                        ▼
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!currentEval && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={
                (currentQuestion.tipe === 'pilihan-ganda' && !mcChoiceId) ||
                (currentQuestion.tipe === 'tunjuk-3d' && !picked3DInfo)
              }
              onClick={handleGradeQuestion}
            >
              Periksa Jawaban
            </button>
          )}

          {currentEval && (
            <div
              role="status"
              style={{
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                background: currentEval.isCorrect
                  ? 'rgba(52, 211, 153, 0.14)'
                  : 'rgba(248, 113, 113, 0.14)',
                border: `1px solid ${
                  currentEval.isCorrect ? '#34d399' : '#f87171'
                }`,
                fontSize: 12.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: currentEval.isCorrect ? '#34d399' : '#f87171',
                }}
              >
                {currentEval.isCorrect
                  ? '✓ Tepat!'
                  : `✗ Belum Tepat (${currentEval.userAnswerSummary})`}
              </div>
              <p style={{ lineHeight: 1.55, color: 'var(--text-primary)' }}>
                {currentQuestion.pembahasan}
              </p>
              <button
                type="button"
                className="btn btn-sm"
                style={{ alignSelf: 'flex-start', marginTop: 2 }}
                onClick={handleRevealTargetIn3D}
              >
                Tunjukkan di Model 3D
              </button>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 8,
              borderTop: '1px solid var(--glass-border)',
              paddingTop: 10,
              marginTop: 'auto',
            }}
          >
            <button
              type="button"
              className="btn btn-sm"
              disabled={currentIndex <= 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            >
              ← Sebelumnya
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={currentIndex >= filteredQuestions.length - 1}
              onClick={() =>
                setCurrentIndex((i) =>
                  Math.min(filteredQuestions.length - 1, i + 1),
                )
              }
            >
              Berikutnya →
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}
