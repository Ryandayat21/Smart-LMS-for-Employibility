import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, MessageSquare, ListChecks, Search, Eye, Pencil, X, FolderPlus, ArrowLeft, Layers } from 'lucide-react';

const ASPECTS = [
  { value: "technical", label: "Technical" },
  { value: "communication", label: "Communication" },
  { value: "problemSolving", label: "Problem Solving" },
  { value: "leadership", label: "Leadership" },
  { value: "teamwork", label: "Teamwork" },
  { value: "workEthic", label: "Work Ethic" },
  { value: "digitalLiteracy", label: "Digital Literacy" },
  { value: "criticalThinking", label: "Critical Thinking" },
  { value: "attentionDetail", label: "Attention To Detail" },
  { value: "emotionalIntel", label: "Emotional Intelligence" },
];

const TARGET_JOBS = [
  { value: "umum", label: "Umum (Semua Karir)" },
  { value: "frontend", label: "Front Office / Customer Service" },
  { value: "marketing", label: "Marketing & Sales" },
  { value: "uiux", label: "UI/UX Designer" },
  { value: "software-eng", label: "Software Engineer" },
  { value: "data-analyst", label: "Data Analyst" },
  { value: "admin", label: "Administrative Assistant" }
];

const INITIAL_FORM = {
  questionText: "",
  scenario: "",
  targetedAspects: [],
  type: "pg",
  aspect: "technical",
  weight: 1,
  options: [
    { text: "", score: 1 },
    { text: "", score: 2 },
    { text: "", score: 3 },
    { text: "", score: 4 },
    { text: "", score: 5 }
  ]
};

const AdminQuestionBank = ({ user }) => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [newPackageName, setNewPackageName] = useState("");
  const [newPackageTargetJob, setNewPackageTargetJob] = useState("umum");

  const [questions, setQuestions] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // 1. Ambil List Paket Soal
  useEffect(() => {
    const qPack = query(collection(db, "question_packages"));
    const unsubscribe = onSnapshot(qPack, (snapshot) => {
      setPackages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. Ambil List Soal Berdasarkan Paket yang Dipilih
  useEffect(() => {
    if (!selectedPackage) return;
    const qDoc = query(collection(db, "question_packages", selectedPackage.id, "questions"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(qDoc, (snapshot) => {
      setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [selectedPackage]);

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    if (!newPackageName.trim()) return;
    try {
      await addDoc(collection(db, "question_packages"), {
        packageName: newPackageName,
        targetJob: newPackageTargetJob,
        createdAt: new Date(),
        createdBy: user?.uid || user?.name || 'admin'
      });
      setNewPackageName("");
      setNewPackageTargetJob("umum");
      setIsAddingPackage(false);
      alert("✅ Paket soal berhasil dibuat!");
    } catch (error) {
      console.error("Gagal membuat paket:", error);
      alert("❌ Gagal membuat paket: " + error.message);
    }
  };

  const handleDeletePackage = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Hapus paket ini beserta seluruh soal di dalamnya?")) {
      try {
        await deleteDoc(doc(db, "question_packages", id));
        setSelectedPackage(null);
        alert("✅ Paket berhasil dihapus!");
      } catch (error) {
        console.error("Gagal hapus paket:", error);
      }
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (formData.type === 'conversation' && formData.targetedAspects.length === 0) {
      alert("Pilih minimal 1 aspek untuk soal Conversation!");
      return;
    }
    try {
      const colRef = collection(db, "question_packages", selectedPackage.id, "questions");
      await addDoc(colRef, {
        ...formData,
        order: questions.length + 1
      });
      setFormData(INITIAL_FORM);
      setIsAdding(false);
      alert("✅ Soal berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan soal:", error);
      alert("❌ Gagal menyimpan soal.");
    }
  };

  const handleEditClick = (question) => {
    setEditingQuestion(question.id);
    setPreviewQuestion(null);
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
    if (editForm.type === 'conversation' && editForm.targetedAspects.length === 0) {
      alert("Pilih minimal 1 aspek untuk soal Conversation!");
      return;
    }
    try {
      const docRef = doc(db, "question_packages", selectedPackage.id, "questions", id);
      await updateDoc(docRef, editForm);
      setEditingQuestion(null);
      setEditForm(null);
      alert("✅ Soal berhasil diupdate!");
    } catch (error) {
      console.error("Gagal update soal:", error);
    }
  };

  const handleEditOptionChange = (index, value) => {
    const newOptions = [...editForm.options];
    newOptions[index].text = value;
    setEditForm({ ...editForm, options: newOptions });
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Hapus soal ini?")) {
      await deleteDoc(doc(db, "question_packages", selectedPackage.id, "questions", id));
    }
  };

  const filteredQuestions = questions.filter((item) => {
    const text = (item.questionText || item.scenario || "").toLowerCase();
    const aspect = (item.aspect || "").toLowerCase();
    return text.includes(searchTerm.toLowerCase()) || aspect.includes(searchTerm.toLowerCase());
  });

  const PreviewModal = ({ question, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <span className="font-bold text-indigo-600 uppercase text-xs">Preview Soal</span>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20}/></button>
        </div>
        <p className="text-lg font-semibold text-slate-800">{question.questionText || question.scenario}</p>
        {question.type === 'pg' && (
          <div className="space-y-2">
            {question.options?.map((opt, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl text-sm text-slate-700 border">
                <span className="font-bold text-indigo-600 mr-2">Score {opt.score}:</span> {opt.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // GRID PAKET UTAMA
  if (!selectedPackage) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manajemen Paket Soal</h1>
            <p className="text-slate-500 text-sm">Buat dan kelola paket soal untuk assessment.</p>
          </div>
          <button
            onClick={() => setIsAddingPackage(!isAddingPackage)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md"
          >
            <FolderPlus size={20} /> {isAddingPackage ? "Batal" : "Buat Paket Baru"}
          </button>
        </div>

        {isAddingPackage && (
          <form onSubmit={handleCreatePackage} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-4 items-end">
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nama Paket Soal</label>
                <input
                  type="text"
                  placeholder="Contoh: Asesmen Teknik Informatika A"
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={newPackageName}
                  onChange={(e) => setNewPackageName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Target Karir (Untuk Asesmen Awal)</label>
                <select
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={newPackageTargetJob}
                  onChange={(e) => setNewPackageTargetJob(e.target.value)}
                >
                  {TARGET_JOBS.map(job => (
                    <option key={job.value} value={job.value}>{job.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all">
              Buat Paket
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-slate-400">Belum ada paket soal. Buat paket baru sekarang!</div>
          ) : (
            packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-100">
                    <Layers size={24} />
                  </div>
                  <button
                    onClick={(e) => handleDeletePackage(pkg.id, e)}
                    className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{pkg.packageName}</h3>
                <div className="mt-2 flex flex-col gap-1">
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md w-max font-semibold">
                    🎯 {TARGET_JOBS.find(j => j.value === pkg.targetJob)?.label || 'Umum'}
                  </span>
                  <p className="text-xs text-slate-400">Dibuat oleh: {pkg.createdBy || 'admin'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // DETAIL PAKET & MANAJEMEN SOAL
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedPackage(null)}
          className="p-2 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <p className="text-sm text-slate-500">Paket Soal</p>
          <h1 className="text-2xl font-bold text-slate-800">{selectedPackage.packageName}</h1>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Tambah Soal Baru</h3>
          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tipe Soal</label>
              <select
                className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="pg">Multiple Choice (PG)</option>
                <option value="conversation">Conversation</option>
              </select>
            </div>

            {formData.type === 'pg' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Pertanyaan</label>
                  <textarea
                    rows={3}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                    placeholder="Masukkan teks pertanyaan..."
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Aspek</label>
                    <select
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                      value={formData.aspect}
                      onChange={(e) => setFormData({ ...formData, aspect: e.target.value })}
                    >
                      {ASPECTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Bobot</label>
                    <input
                      type="number" min="1" max="10"
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Opsi Jawaban</label>
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-lg min-w-15 text-center">Score {opt.score}</span>
                      <input
                        type="text"
                        className="flex-1 p-3 border border-slate-200 rounded-xl outline-none"
                        placeholder={`Opsi ${opt.score}`}
                        value={opt.text}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[idx].text = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Skenario</label>
                <textarea
                  rows={3}
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                  placeholder="Masukkan skenario percakapan..."
                  value={formData.scenario}
                  onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 border rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
              >
                Simpan Soal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">Total Soal</p>
          <p className="text-2xl font-bold text-slate-800">{questions.length} soal</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus size={20} /> Tambah Soal
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-2">
          <Search size={18} className="text-slate-400 mt-1" />
          <input
            type="text"
            placeholder="Cari soal..."
            className="flex-1 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="p-6 text-center text-slate-400">Belum ada soal. Tambahkan soal baru!</div>
        ) : (
          <div className="divide-y">
            {filteredQuestions.map((question, idx) => (
              <div key={question.id} className="p-6">
                {editingQuestion === question.id ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-700">✏️ Edit Soal</p>
                      <button onClick={() => setEditingQuestion(null)} className="p-1 hover:bg-slate-200 rounded-lg">
                        <X size={16} />
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm"
                      value={editForm.type === 'pg' ? editForm.questionText : editForm.scenario}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        [editForm.type === 'pg' ? 'questionText' : 'scenario']: e.target.value
                      })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Bobot</label>
                        <input
                          type="number" min="1" max="10"
                          className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm"
                          value={editForm.weight}
                          onChange={(e) => setEditForm({ ...editForm, weight: parseInt(e.target.value) })}
                        />
                      </div>
                      {editForm.type === 'pg' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Aspek</label>
                          <select
                            className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm"
                            value={editForm.aspect}
                            onChange={(e) => setEditForm({ ...editForm, aspect: e.target.value })}
                          >
                            {ASPECTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    {editForm.type === 'pg' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase">Opsi Jawaban</label>
                        {editForm.options.map((opt, i) => (
                          <div key={i} className="flex gap-3 items-center">
                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-2 rounded-lg text-center min-w-15">Skor {opt.score}</span>
                            <input
                              type="text"
                              className="flex-1 p-3 border border-slate-200 rounded-xl outline-none text-sm"
                              value={opt.text}
                              onChange={(e) => handleEditOptionChange(i, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setEditingQuestion(null)} className="px-5 py-2 border rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50">Batal</button>
                      <button onClick={() => handleEditSave(question.id)} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">Simpan</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-400 uppercase">Soal {idx + 1}</p>
                        <p className="text-slate-800 font-semibold mt-1">{question.questionText || question.scenario}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{question.type === 'pg' ? 'Multiple Choice' : 'Conversation'}</span>
                          {question.aspect && <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{question.aspect}</span>}
                          <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">Bobot: {question.weight}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewQuestion(question)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditClick(question)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {previewQuestion && <PreviewModal question={previewQuestion} onClose={() => setPreviewQuestion(null)} />}
    </div>
  );
};

export default AdminQuestionBank;
