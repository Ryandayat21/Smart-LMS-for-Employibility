import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, MessageSquare, ListChecks, Search, Eye, Pencil, X, ChevronDown, ChevronUp } from 'lucide-react';

const ASPECTS = [
  { value: "technical", label: "Technical" },
  { value: "communication", label: "Communication" },
  { value: "problemSolving", label: "Problem Solving" },
  { value: "leadership", label: "Leadership" },
  { value: "teamwork", label: "Teamwork" },
  { value: "workEthic", label: "Work Ethic" },
  { value: "digitalLiteracy", label: "Digital Literacy" },
  { value: "criticalThinking", label: "Critical Thinking" },
  { value: "attentionToDetail", label: "Attention To Detail" },
  { value: "emotionalIntelligence", label: "Emotional Intelligence" },
];

const INITIAL_FORM = {
  questionText: "",
  scenario: "",
  targetedAspects: [],
  type: "pg",
  aspect: "technical",
  weight: 1,
  order: 1,
  options: [
    { text: "", score: 1 },
    { text: "", score: 2 },
    { text: "", score: 3 },
    { text: "", score: 4 },
    { text: "", score: 5 }
  ]
};

const QuestionBank = ({ user }) => {
  const [questions, setQuestions] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM);

  // ✅ State untuk Preview & Edit
  const [previewQuestion, setPreviewQuestion] = useState(null); // soal yang sedang dipreview
  const [editingQuestion, setEditingQuestion] = useState(null); // soal yang sedang diedit
  const [editForm, setEditForm] = useState(null);               // data form edit

  // Cek role
  const isAdminOrInstructor = user?.role === 'admin' || user?.role === 'instructor';

  useEffect(() => {
    const qDoc = query(collection(db, "questions"), orderBy("aspect", "asc"));
    const unsubscribe = onSnapshot(qDoc, (snapshot) => {
      setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // ══════════════════════════════════
  // ✅ FUNGSI EDIT
  // ══════════════════════════════════
  const handleEditClick = (question) => {
    setEditingQuestion(question.id);
    setPreviewQuestion(null); // tutup preview kalau ada
    setEditForm({
      questionText: question.questionText || "",
      scenario: question.scenario || "",
      targetedAspects: question.targetedAspects || [],
      type: question.type || "pg",
      aspect: question.aspect || "technical",
      weight: question.weight || 1,
      options: question.options || [
        { text: "", score: 1 },
        { text: "", score: 2 },
        { text: "", score: 3 },
        { text: "", score: 4 },
        { text: "", score: 5 }
      ]
    });
  };

  const handleEditSave = async (id) => {
    // Validasi
    if (editForm.type === 'conversation' && editForm.targetedAspects.length === 0) {
      alert("Pilih minimal 1 aspek untuk soal Conversation!");
      return;
    }

    try {
      await updateDoc(doc(db, "questions", id), editForm);
      setEditingQuestion(null);
      setEditForm(null);
      alert("✅ Soal berhasil diupdate!");
    } catch (error) {
      console.error("Gagal update soal:", error);
      alert("❌ Gagal mengupdate soal.");
    }
  };

  const handleEditOptionChange = (index, value) => {
    const newOptions = [...editForm.options];
    newOptions[index].text = value;
    setEditForm({ ...editForm, options: newOptions });
  };

  // ══════════════════════════════════
  // FUNGSI ADD & DELETE (sama seperti sebelumnya)
  // ══════════════════════════════════
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.type === 'conversation' && formData.targetedAspects.length === 0) {
      alert("Pilih minimal 1 aspek untuk soal Conversation!");
      return;
    }
    try {
      await addDoc(collection(db, "questions"), {
        ...formData,
        order: questions.length + 1
      });
      setFormData({ ...INITIAL_FORM, order: questions.length + 2 });
      setIsAdding(false);
      alert("✅ Soal berhasil ditambahkan!");
    } catch (error) {
      console.error("Gagal tambah soal:", error);
      alert("❌ Gagal menyimpan soal.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus soal ini?")) {
      try {
        await deleteDoc(doc(db, "questions", id));
      } catch (error) {
        alert("Gagal menghapus soal.");
      }
    }
  };

  const filteredQuestions = questions.filter((item) => {
    const text = (item.questionText || item.scenario || "").toLowerCase();
    const aspect = (item.aspect || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return text.includes(search) || aspect.includes(search);
  });

  // ══════════════════════════════════
  // 🔍 KOMPONEN PREVIEW
  // ══════════════════════════════════
  const PreviewModal = ({ question, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
              ${question.type === 'conversation'
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-emerald-50 text-emerald-600'
              }`}>
              {question.type === 'conversation' ? '🎤 AI Conversation' : '📝 Pilihan Ganda'}
            </span>
            <p className="text-xs text-slate-400 mt-1">Weight: {question.weight || 1}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Pertanyaan / Skenario */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">
              {question.type === 'pg' ? 'Pertanyaan' : 'Skenario'}
            </p>
            <p className="text-lg font-semibold text-slate-800">
              {question.questionText || question.scenario}
            </p>
          </div>

          {/* Aspek */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Aspek yang Dinilai</p>
            <div className="flex flex-wrap gap-2">
              {question.type === 'pg' ? (
                <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-bold text-xs border border-slate-200">
                  {question.aspect}
                </span>
              ) : (
                (question.targetedAspects || []).map(a => (
                  <span key={a} className="bg-indigo-50 px-3 py-1 rounded-full text-indigo-600 font-bold text-xs border border-indigo-100">
                    {a}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Opsi Jawaban — Hanya PG */}
          {question.type === 'pg' && question.options && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Opsi Jawaban</p>
              <div className="space-y-2">
                {question.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-lg min-w-15 text-center">
                      Skor {opt.score}
                    </span>
                    <span className="text-sm text-slate-700">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Conversation */}
          {question.type === 'conversation' && (
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-600 font-semibold">
                🎤 Soal ini akan dijawab dengan suara dan dinilai oleh AI secara otomatis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════
  // ✏️ KOMPONEN EDIT INLINE
  // ══════════════════════════════════
  const EditForm = ({ question }) => (
    <tr className="bg-indigo-50/30">
      <td colSpan={4} className="px-6 py-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="font-bold text-slate-700">✏️ Edit Soal</p>
            <button
              onClick={() => setEditingQuestion(null)}
              className="p-1 hover:bg-slate-200 rounded-lg"
            >
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          {/* Teks Pertanyaan / Skenario */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              {editForm.type === 'pg' ? 'Teks Pertanyaan' : 'Skenario'}
            </label>
            <textarea
              rows={3}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={editForm.type === 'pg' ? editForm.questionText : editForm.scenario}
              onChange={(e) => setEditForm({
                ...editForm,
                [editForm.type === 'pg' ? 'questionText' : 'scenario']: e.target.value
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Bobot */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Bobot</label>
              <input
                type="number" min="1" max="10"
                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                value={editForm.weight}
                onChange={(e) => setEditForm({ ...editForm, weight: parseInt(e.target.value) })}
              />
            </div>

            {/* Aspek — Hanya PG */}
            {editForm.type === 'pg' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Aspek</label>
                <select
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                  value={editForm.aspect}
                  onChange={(e) => setEditForm({ ...editForm, aspect: e.target.value })}
                >
                  {ASPECTS.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Opsi Jawaban — Hanya PG */}
          {editForm.type === 'pg' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase">Opsi Jawaban</label>
              {editForm.options.map((opt, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-2 rounded-lg text-center min-w-15">
                    Skor {opt.score}
                  </span>
                  <input
                    type="text"
                    className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-500"
                    value={opt.text}
                    onChange={(e) => handleEditOptionChange(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Targeted Aspects — Hanya Conversation */}
          {editForm.type === 'conversation' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Aspek yang Dinilai</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {ASPECTS.map((asp) => (
                  <label
                    key={asp.value}
                    className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer border transition-all text-xs
                      ${editForm.targetedAspects.includes(asp.value)
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600'
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-indigo-600"
                      checked={editForm.targetedAspects.includes(asp.value)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...editForm.targetedAspects, asp.value]
                          : editForm.targetedAspects.filter(a => a !== asp.value);
                        setEditForm({ ...editForm, targetedAspects: updated });
                      }}
                    />
                    {asp.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tombol Simpan */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setEditingQuestion(null)}
              className="px-5 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={() => handleEditSave(question.id)}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </td>
    </tr>
  );

  // ══════════════════════════════════
  // 🎨 MAIN RENDER
  // ══════════════════════════════════
  return (
    <div className="space-y-6">

      {/* Preview Modal */}
      {previewQuestion && (
        <PreviewModal
          question={previewQuestion}
          onClose={() => setPreviewQuestion(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bank Soal</h1>
          <p className="text-slate-500 text-sm">Total: {questions.length} Soal tersedia</p>
        </div>
        {isAdminOrInstructor && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} /> {isAdding ? "Batal" : "Tambah Soal Baru"}
          </button>
        )}
      </div>

      {/* Form Tambah Soal */}
      {isAdding && isAdminOrInstructor && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  {formData.type === 'pg' ? 'Teks Pertanyaan' : 'Skenario Percakapan'}
                </label>
                <textarea
                  required rows={3}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.type === 'pg' ? formData.questionText : formData.scenario}
                  onChange={(e) => setFormData({
                    ...formData,
                    [formData.type === 'pg' ? 'questionText' : 'scenario']: e.target.value
                  })}
                  placeholder={formData.type === 'pg'
                    ? "Masukkan pertanyaan pilihan ganda..."
                    : "Masukkan skenario untuk AI Conversation..."
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tipe Soal</label>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="pg">Pilihan Ganda (PG)</option>
                  <option value="conversation">AI Conversation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Bobot Soal (1-10)</label>
                <input
                  type="number" min="1" max="10"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                />
              </div>

              {formData.type === 'pg' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Aspek Kompetensi</label>
                  <select
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.aspect}
                    onChange={(e) => setFormData({ ...formData, aspect: e.target.value })}
                  >
                    {ASPECTS.map(a => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.type === 'pg' && (
                <div className="md:col-span-3 space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Opsi Jawaban & Skor</label>
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-2 rounded-lg text-center min-w-15">
                        Skor {opt.score}
                      </div>
                      <input
                        type="text" required
                        placeholder={`Teks opsi untuk skor ${opt.score}...`}
                        className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {formData.type === 'conversation' && (
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Aspek yang Dinilai (pilih minimal 1)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {ASPECTS.map((asp) => (
                      <label
                        key={asp.value}
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border transition-all
                          ${formData.targetedAspects.includes(asp.value)
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-indigo-50'
                          }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-indigo-600"
                          checked={formData.targetedAspects.includes(asp.value)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.targetedAspects, asp.value]
                              : formData.targetedAspects.filter(a => a !== asp.value);
                            setFormData({ ...formData, targetedAspects: updated });
                          }}
                        />
                        <span className="text-xs font-medium">{asp.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">
              Simpan Soal ke Database
            </button>
          </form>
        </div>
      )}

      {/* Tabel List Soal */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Cari soal atau aspek..."
            className="w-full outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left">Tipe & Bobot</th>
                <th className="px-6 py-4 text-left">Aspek</th>
                <th className="px-6 py-4 text-left">Pertanyaan / Skenario</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                    Belum ada soal. Tambahkan soal baru!
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((question) => (
                  <React.Fragment key={question.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {question.type === 'conversation'
                            ? <span className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px]"><MessageSquare size={12} /> AI VOICE</span>
                            : <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px]"><ListChecks size={12} /> MULTIPLE CHOICE</span>
                          }
                          <span className="text-[10px] text-slate-400 italic">Weight: {question.weight || 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {question.type === 'pg' ? (
                          <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold text-[10px] border border-slate-200">
                            {question.aspect}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {(question.targetedAspects || []).map(a => (
                              <span key={a} className="bg-indigo-50 px-2 py-1 rounded text-indigo-600 font-bold text-[10px] border border-indigo-100">
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate font-medium">
                        {question.questionText || question.scenario}
                      </td>

                      {/* ✅ Tombol Aksi — Preview, Edit, Delete */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* Preview — semua role instruktur & admin */}
                          <button
                            onClick={() => setPreviewQuestion(
                              previewQuestion?.id === question.id ? null : question
                            )}
                            className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Preview Soal"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Edit */}
                          {isAdminOrInstructor && (
                            <button
                              onClick={() => handleEditClick(question)}
                              className={`p-2 rounded-lg transition-all
                                ${editingQuestion === question.id
                                  ? 'text-indigo-600 bg-indigo-50'
                                  : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50'
                                }`}
                              title="Edit Soal"
                            >
                              <Pencil size={16} />
                            </button>
                          )}

                          {/* Delete */}
                          {isAdminOrInstructor && (
                            <button
                              onClick={() => handleDelete(question.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Hapus Soal"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* ✅ Edit Form muncul inline di bawah row */}
                    {editingQuestion === question.id && editForm && (
                      <EditForm question={question} />
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;