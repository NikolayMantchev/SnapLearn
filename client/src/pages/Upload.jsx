import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload as UploadIcon, FileText, Sparkles, X, Plus, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as uploadService from '../services/uploadService';
import * as quizService from '../services/quizService';

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [generating, setGenerating] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleFileChange(e) {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setUploadResults([]);
    const newFiles = selected.map((f) => {
      const url = URL.createObjectURL(f);
      return { file: f, preview: url };
    });
    setFiles((prev) => [...prev, ...newFiles]);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeFile(index) {
    setFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
    setUploadResults([]);
  }

  function clearAll() {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setUploadResults([]);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleUpload() {
    if (!files.length) return;
    setUploading(true);
    const results = [];
    try {
      for (let i = 0; i < files.length; i++) {
        toast.loading(t('upload.uploadingImage', { current: i + 1, total: files.length }), { id: 'upload-progress' });
        const formData = new FormData();
        formData.append('image', files[i].file);
        const data = await uploadService.create(formData);
        results.push(data.upload || data);
      }
      toast.dismiss('upload-progress');
      setUploadResults(results);
      const successCount = results.filter((r) => r.extracted_text).length;
      toast.success(t('upload.imagesRecognized', { count: successCount, total: results.length }));
    } catch (err) {
      toast.dismiss('upload-progress');
      const msg = err.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : t('upload.uploadFailed'));
    } finally {
      setUploading(false);
    }
  }

  const hasExtractedText = uploadResults.some((r) => r.extracted_text);

  async function handleGenerate() {
    if (!uploadResults.length) return;
    setGenerating(true);
    try {
      const uploadIds = uploadResults
        .filter((r) => r.extracted_text)
        .map((r) => r._id ?? r.id);
      const data = await quizService.generate(uploadIds, { numQuestions, difficulty });
      const quiz = data.quiz || data;
      const quizId = quiz._id ?? quiz.id;
      toast.success(t('upload.quizGenerated'));
      navigate(`/quizzes/${quizId}`);
    } catch (err) {
      const msg = err.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : t('upload.generationFailed'));
    } finally {
      setGenerating(false);
    }
  }

  const difficultyOptions = [
    { value: 'easy', label: t('upload.easy') },
    { value: 'medium', label: t('upload.medium') },
    { value: 'hard', label: t('upload.hard') },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">{t('upload.title')}</h1>

      {uploadResults.length === 0 && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-gray-600 dark:bg-[#1a1a2e] dark:hover:border-indigo-500 dark:hover:bg-indigo-900/10">
          <Camera className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
          <p className="mb-1 text-base font-medium text-gray-700 dark:text-gray-200">
            {t('upload.selectFiles')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('upload.fileHint')}</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {files.length > 0 && uploadResults.length === 0 && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {files.map((f, i) => (
              <div key={i} className="group relative overflow-hidden rounded-xl bg-white shadow-md dark:bg-[#1a1a2e]">
                <button
                  onClick={() => removeFile(i)}
                  className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1 text-white transition-all hover:bg-black/70"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <img
                  src={f.preview}
                  alt={t('upload.image', { index: i + 1 })}
                  className="h-32 w-full object-cover"
                />
                <p className="truncate px-2 py-1 text-xs text-gray-500 dark:text-gray-400">{f.file.name}</p>
              </div>
            ))}

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white transition-all hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-gray-600 dark:bg-[#1a1a2e] dark:hover:border-indigo-500 dark:hover:bg-indigo-900/10" style={{ minHeight: '10rem' }}>
              <Plus className="mb-1 h-8 w-8 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('upload.more')}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={clearAll}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {t('upload.removeAll')}
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              <UploadIcon className="h-4 w-4" />
              {uploading
                ? t('upload.uploading')
                : files.length > 1
                  ? t('upload.uploadImagesPlural', { count: files.length })
                  : t('upload.uploadImages', { count: files.length })}
            </button>
          </div>
        </div>
      )}

      {uploadResults.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-6 shadow-md dark:bg-[#1a1a2e]">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <FileText className="h-5 w-5 text-indigo-600" />
              {t('upload.recognizedText')} ({uploadResults.filter((r) => r.extracted_text).length}/{uploadResults.length})
            </h2>
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {uploadResults.map((result, i) => (
                <div key={i} className={`rounded-lg p-3 text-sm ${result.extracted_text ? 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'}`}>
                  <p className="mb-1 text-xs font-medium text-gray-400 flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> {t('upload.image', { index: i + 1 })}
                  </p>
                  {result.extracted_text ? (
                    <p className="leading-relaxed line-clamp-4">{result.extracted_text}</p>
                  ) : (
                    <p className="font-medium">{t('upload.ocrFailed')}</p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={clearAll}
              className="mt-3 text-sm text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('upload.chooseNewImages')}
            </button>
          </div>

          {hasExtractedText && (
            <div className="rounded-xl bg-white p-6 shadow-md dark:bg-[#1a1a2e]">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                {t('upload.generateQuiz')}
              </h2>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t('upload.numQuestions')}
                  </label>
                  <div className="flex gap-2">
                    {[5, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() => setNumQuestions(n)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                          numQuestions === n
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500'
                            : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t('upload.difficulty')}
                  </label>
                  <div className="flex gap-2">
                    {difficultyOptions.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setDifficulty(value)}
                        className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition-all ${
                          difficulty === value
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500'
                            : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {generating ? t('upload.generating') : t('upload.generateQuiz')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
