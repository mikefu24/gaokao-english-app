/**
 * Let students pick one complete exam paper to simulate,
 * or generate a fresh mixed-exam paper from the full question pool.
 */

import React, { useCallback } from 'react';
import { ArrowLeft, Clock, BookOpen, ChevronRight, Shuffle, Zap } from 'lucide-react';
import type { Question, ExamConfig } from '../types';

interface ExamInfo {
  examId: string;
  year: number;
  month: number;
  region: string;
  regionShort: string;
  reading: number;
  gapfill: number;
  cloze: number;
  total: number;
  durationMinutes: number;
}

interface ExamSelectorProps {
  allQuestions: Question[];
  onStart: (config: ExamConfig) => void;
  onBack: () => void;
}

// ─── Real-exam list ───────────────────────────────────────────────────────────

function buildExamList(questions: Question[]): ExamInfo[] {
  const map = new Map<string, { reading: number; gapfill: number; cloze: number; year: number; month: number }>();

  for (const q of questions) {
    if (!map.has(q.exam_id)) {
      map.set(q.exam_id, { reading: 0, gapfill: 0, cloze: 0, year: q.year, month: q.month });
    }
    const entry = map.get(q.exam_id)!;
    if (q.category === 'reading') entry.reading++;
    else if (q.category === 'gapfill') entry.gapfill++;
    else if (q.category === 'cloze') entry.cloze++;
  }

  const REGION_MAP: Record<string, { region: string; short: string }> = {
    ZJ:  { region: '浙江卷', short: '浙江' },
    NK1: { region: '新课标Ⅰ卷 / 全国Ⅰ卷', short: '全国Ⅰ' },
  };

  const infos: ExamInfo[] = [];
  for (const [examId, counts] of map) {
    const prefix = examId.startsWith('NK1') ? 'NK1' : 'ZJ';
    const { region, short } = REGION_MAP[prefix] ?? { region: examId, short: examId };
    const total = counts.reading + counts.gapfill + counts.cloze;
    infos.push({
      examId,
      year: counts.year,
      month: counts.month,
      region,
      regionShort: short,
      reading: counts.reading,
      gapfill: counts.gapfill,
      cloze: counts.cloze,
      total,
      durationMinutes: Math.ceil(total * 1.2),
    });
  }

  return infos.sort((a, b) => b.year - a.year || b.month - a.month || a.examId.localeCompare(b.examId));
}

// ─── Mixed-exam generator ─────────────────────────────────────────────────────

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate a mixed exam from the full question pool.
 *
 * Structure matches the new-format gaokao:
 *   • Reading: 4 passage groups (varied exams), ~15 Qs, numbered from 21
 *   • 七选五 : 1 passage group, 5 Qs
 *   • 完形填空: 1 passage group, 15 Qs (or all Qs in group)
 *
 * `pool` can be pre-filtered by region ('ZJ' | 'NK1') or all questions.
 * `seed` makes the selection reproducible (changes each call when not specified).
 */
function generateMixedExam(questions: Question[], regionFilter?: 'ZJ' | 'NK1', seed?: number): Question[] {
  const rng = seed ?? (Date.now() & 0x7fffffff);

  const pool = regionFilter
    ? questions.filter(q => q.exam_id.startsWith(regionFilter))
    : questions;

  // ── Reading ──
  // Group by passage_group_id
  const readingByGroup = new Map<string, Question[]>();
  for (const q of pool.filter(q => q.category === 'reading')) {
    const gid = q.passage_group_id ?? q.exam_id + '_' + q.number;
    if (!readingByGroup.has(gid)) readingByGroup.set(gid, []);
    readingByGroup.get(gid)!.push(q);
  }

  // Pick 4 groups (or fewer if not enough)
  const allGroups = seededShuffle([...readingByGroup.values()], rng);
  const pickedGroups = allGroups.slice(0, 4);
  const readingQs = pickedGroups
    .flatMap(g => g.sort((a, b) => a.number - b.number));

  // ── 七选五 ──
  const gapfillByGroup = new Map<string, Question[]>();
  for (const q of pool.filter(q => q.category === 'gapfill')) {
    const gid = q.passage_group_id ?? q.exam_id;
    if (!gapfillByGroup.has(gid)) gapfillByGroup.set(gid, []);
    gapfillByGroup.get(gid)!.push(q);
  }
  const gapGroups = seededShuffle([...gapfillByGroup.values()], rng + 1);
  const gapfillQs = (gapGroups[0] ?? []).sort((a, b) => a.number - b.number);

  // ── 完形填空 ──
  const clozeByGroup = new Map<string, Question[]>();
  for (const q of pool.filter(q => q.category === 'cloze')) {
    const gid = q.passage_group_id ?? q.exam_id;
    if (!clozeByGroup.has(gid)) clozeByGroup.set(gid, []);
    clozeByGroup.get(gid)!.push(q);
  }
  const clozeGroups = seededShuffle([...clozeByGroup.values()], rng + 2);
  // Prefer 15-question cloze groups (new format); fall back to 20-question
  const sortedClozeGroups = [...clozeGroups].sort((a, b) =>
    Math.abs(a.length - 15) - Math.abs(b.length - 15));
  const clozeQs = (sortedClozeGroups[0] ?? []).sort((a, b) => a.number - b.number);

  if (readingQs.length === 0 && gapfillQs.length === 0 && clozeQs.length === 0) return [];

  // Re-number so questions run 21, 22, 23…
  const combined = [...readingQs, ...gapfillQs, ...clozeQs];
  return combined.map((q, i) => ({ ...q, number: 21 + i }));
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

const MONTH_STR: Record<number, string> = { 1: '1月', 6: '6月', 7: '7月', 11: '11月' };

// ─── Component ────────────────────────────────────────────────────────────────

export const ExamSelector: React.FC<ExamSelectorProps> = ({ allQuestions, onStart, onBack }) => {
  const exams = buildExamList(allQuestions);

  const startMixed = useCallback((regionFilter?: 'ZJ' | 'NK1') => {
    const questions = generateMixedExam(allQuestions, regionFilter);
    if (questions.length === 0) {
      alert('题库中没有足够的题目，请先确保题库完整。');
      return;
    }
    const ids = questions.map(q => q.id);
    // pass questionIds so App.handleStartExam uses these exact questions
    onStart({ mode: 'exam', questionIds: ids, durationMinutes: Math.ceil(questions.length * 1.2) });
  }, [allQuestions, onStart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>

        {/* ── Mixed exam section ─────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-slate-900 mb-1">模拟练习卷</h2>
        <p className="text-slate-500 text-sm mb-4">随机从多年真题中抽题组卷，每次不同</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { label: '浙江卷综合', desc: '历年浙江卷混合', filter: 'ZJ' as const, color: 'blue' },
            { label: '全国卷综合', desc: '历年全国Ⅰ卷混合', filter: 'NK1' as const, color: 'violet' },
            { label: '全部综合', desc: '浙江＋全国混合', filter: undefined, color: 'emerald' },
          ].map(({ label, desc, filter, color }) => (
            <button
              key={label}
              onClick={() => startMixed(filter)}
              className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all
                ${color === 'blue'    ? 'border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100' :
                  color === 'violet'  ? 'border-violet-200 bg-violet-50 hover:border-violet-400 hover:bg-violet-100' :
                                        'border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                ${color === 'blue'   ? 'bg-blue-100 group-hover:bg-blue-200' :
                  color === 'violet' ? 'bg-violet-100 group-hover:bg-violet-200' :
                                       'bg-emerald-100 group-hover:bg-emerald-200'}`}>
                <Shuffle className={`w-5 h-5 ${
                  color === 'blue'   ? 'text-blue-600' :
                  color === 'violet' ? 'text-violet-600' :
                                       'text-emerald-600'}`} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-800 text-sm">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Zap className="w-3 h-3" />
                <span>随机出卷</span>
              </div>
            </button>
          ))}
        </div>

        {/* ── Real exam section ──────────────────────────────────────── */}
        <h2 className="text-xl font-bold text-slate-900 mb-1">真题模拟卷</h2>
        <p className="text-slate-500 text-sm mb-2">选择一套真题，按真实考试顺序作答</p>
        <p className="text-xs text-slate-400 mb-5">
          含阅读理解、七选五、完形填空（不含听力）
        </p>

        <div className="space-y-3">
          {exams.map((exam) => (
            <button
              key={exam.examId}
              onClick={() =>
                onStart({ mode: 'exam', examId: exam.examId, durationMinutes: exam.durationMinutes })
              }
              className="w-full text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base font-bold text-slate-900">
                      {exam.year}年{MONTH_STR[exam.month] ?? `${exam.month}月`}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                      {exam.region}
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5 text-xs">
                    {exam.reading > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-medium">
                        阅读 {exam.reading}题
                      </span>
                    )}
                    {exam.gapfill > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-600 font-medium">
                        七选五 {exam.gapfill}题
                      </span>
                    )}
                    {exam.cloze > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 font-medium">
                        完形 {exam.cloze}题
                      </span>
                    )}
                    <span className="text-slate-400 ml-0.5">= 共{exam.total}题</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exam.durationMinutes}分钟</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Note */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              真题卷按真实顺序排列（阅读→七选五→完形填空）；模拟卷从各年真题抽选，每次随机组合。
              计时结束后自动提交，未作答题目计为错误。
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
