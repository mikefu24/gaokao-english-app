/**
 * ListeningSelector — choose which listening exam to practice.
 * Groups available exams (grouped by source region) with mode selection.
 */

import React, { useState } from 'react';
import { ArrowLeft, Headphones, Play, BookOpen } from 'lucide-react';
import type { Question } from '../types';

interface ListeningSelectorProps {
  questions: Question[];
  onSelect: (examId: string, mode: 'exam' | 'practice') => void;
  onBack: () => void;
}

interface ExamGroup {
  exam_id: string;
  year: number;
  month: number;
  audio_file: string;
  count: number;
  label: string;
  region: string;
}

function buildExamGroups(questions: Question[]): ExamGroup[] {
  const listening = questions.filter((q) => q.category === 'listening');
  const byExam: Record<string, ExamGroup> = {};
  for (const q of listening) {
    if (!q.exam_id) continue;
    if (!byExam[q.exam_id]) {
      const region = q.exam_id.startsWith('ZJ') ? '浙江卷' : '新课标Ⅰ卷';
      const monthLabel = q.month === 1 ? '1月' : q.month === 6 ? '6月' : q.month === 7 ? '7月' : `${q.month}月`;
      const label = `${q.year}年${monthLabel} ${region}`;
      byExam[q.exam_id] = {
        exam_id: q.exam_id,
        year: q.year,
        month: q.month,
        audio_file: q.audio_file ?? '',
        count: 0,
        label,
        region,
      };
    }
    byExam[q.exam_id].count++;
  }
  return Object.values(byExam).sort((a, b) => b.year - a.year || b.month - a.month);
}

export const ListeningSelector: React.FC<ListeningSelectorProps> = ({
  questions,
  onSelect,
  onBack,
}) => {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const exams = buildExamGroups(questions);

  const zjExams = exams.filter((e) => e.region === '浙江卷');
  const nkExams = exams.filter((e) => e.region === '新课标Ⅰ卷');

  const handleStart = (mode: 'exam' | 'practice') => {
    if (selectedExam) onSelect(selectedExam, mode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">听力专项</h2>
            <p className="text-xs text-slate-500">选择套卷后开始练习</p>
          </div>
        </div>

        {/* Exam list */}
        {[
          { label: '浙江卷', items: zjExams },
          { label: '新课标Ⅰ卷', items: nkExams },
        ].map(({ label, items }) => (
          items.length > 0 && (
            <div key={label} className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
                {label}
              </p>
              <div className="space-y-2">
                {items.map((exam) => (
                  <button
                    key={exam.exam_id}
                    onClick={() => setSelectedExam(exam.exam_id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedExam === exam.exam_id
                        ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                        : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      selectedExam === exam.exam_id ? 'bg-blue-600' : 'bg-slate-100'
                    }`}>
                      <Headphones className={`w-5 h-5 ${selectedExam === exam.exam_id ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{exam.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">共 {exam.count} 道题</p>
                    </div>
                    {selectedExam === exam.exam_id && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        ))}

        {/* Mode selection footer */}
        {selectedExam && (
          <div className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-4">
            <div className="max-w-2xl mx-auto flex gap-3">
              <button
                onClick={() => handleStart('practice')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                练习模式
              </button>
              <button
                onClick={() => handleStart('exam')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                <Play className="w-4 h-4" />
                模拟考试
              </button>
            </div>
          </div>
        )}

        {!selectedExam && <div className="h-20" />}

      </div>
    </div>
  );
};
