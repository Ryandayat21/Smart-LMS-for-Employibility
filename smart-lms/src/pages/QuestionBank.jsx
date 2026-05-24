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
  options: [
    { text: "", score: 1 },
    { text: "", score: 2 },
    { text: "", score: 3 },
    { text: "", score: 4 },
    { text: "", score: 5 }
  ]
};

const QuestionBank = ({ user }) => {
  // Navigation State
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [newPackageName, setNewPackageName] = useState("");

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Preview & Edit State
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const isAdminOrInstructor = user?.role === 'admin' || user?.role === 'instructor';

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

  // ══════════════════════════════════
  // ✅ LOGIKA MANAJEMEN PAKET
  // ══════════════════════════════════
  const handleCreatePackage = async (e) => {
    e.preventDefault();
    if (!newPackageName.trim()) return;
    try {
      await addDoc(collection(db, "question_packages"), {
        packageName: newPackageName,
        createdAt: new Date(),
        createdBy: user?.uid || "instructor"
      });
      setNewPackageName("");
      setIsAddingPackage(false);
      alert("✅ Paket soal berhasil dibuat!");
    } catch (error) {
      console.error("Gagal membuat paket:", error);
    }
  };

  const handleDeletePackage = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Hapus paket ini beserta seluruh soal di dalamnya?")) {
      try {
        await deleteDoc(doc(db, "question_packages", id));
        alert("✅ Paket berhasil dihapus!");
      } catch (error) {
        console.error("Gagal hapus paket:", error);
      }
    }
  };

  // ══════════════════════════════════
  // ✅ LOGIKA MANAJEMEN SOAL (FIXED)
  // ══════════════════════════════════
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
      alert("✅ Soal berhasil disimpan ke Firestore!");
    } catch (error) {
      console.error("Gagal menyimpan ke sub-koleksi:", error);
      alert("❌ Gagal menyimpan soal.");
    }
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

  // 🔍 MODAL PREVIEW
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

  // ✏️ INLINE EDIT FORM ROW
  const EditFormRow = ({ question }) => (
    <tr className="bg-indigo-50/30">
      <td colSpan={4} className="px-6 py-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="font-bold text-slate-700">✏️ Edit Soal</p>
            <button onClick={() => setEditingQuestion(null)} className="p-1 hover:bg-slate-200 rounded-lg"><X size={16} /></button>
          </div>
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
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Bobot</label>
              <input
                type="number" min="1" max="10"
                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                value={editForm.weight}
                onChange={(e) => setEditForm({ ...editForm, weight: parseInt(e.target.value) })}
              />
            </div>
            {editForm.type === 'pg' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Aspek</label>
                <select
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm"
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
              {editForm.options.map((opt, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-2 rounded-lg text-center min-w-15">Skor {opt.score}</span>
                  <input
                    type="text"
                    className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                    value={opt.text}
                    onChange={(e) => handleEditOptionChange(idx, e.target.value)}
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
      </td>
    </tr>
  );

  // 🎨 GRID PAKET UTAMA
  if (!selectedPackage) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Paket Soal Asesmen</h1>
            <p className="text-slate-500 text-sm">Buat dan kelola paket sebelum dibagikan ke kelas.</p>
          </div>
          {isAdminOrInstructor && (
            <button
              onClick={() => setIsAddingPackage(!isAddingPackage)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md"
            >
              <FolderPlus size={20} /> {isAddingPackage ? "Batal" : "Buat Paket Baru"}
            </button>
          )}
        </div>

        {isAddingPackage && (
          <form onSubmit={handleCreatePackage} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nama Paket Soal</label>
              <input
                type="text" required
                placeholder="Contoh: Tryout Front End"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium"
                value={newPackageName}
                onChange={(e) => setNewPackageName(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-black transition-all">Simpan Paket</button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer flex flex-col justify-between h-44 group"
            >
              <div className="flex items-start justify-between">
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Layers size={22} />
                </div>
                {isAdminOrInstructor && (
                  <button onClick={(e) => handleDeletePackage(pkg.id, e)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors mt-4 line-clamp-1">{pkg.packageName}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Klik untuk kelola butir soal</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 📝 DAFTAR PERTANYAAN DALAM PAKET TERPILIH
  return (
    <div className="space-y-6">
      {previewQuestion && <PreviewModal question={previewQuestion} onClose={() => setPreviewQuestion(null)} />}

      <button onClick={() => setSelectedPackage(null)} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
        <ArrowLeft size={16} /> Kembali ke Daftar Paket
      </button>

      <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-3xl flex justify-between items-center">
        <div>
          <span className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">Paket Terpilih</span>
          <h2 className="text-xl font-extrabold text-slate-800 mt-0.5">{selectedPackage.packageName}</h2>
        </div>
        <span className="bg-white border border-indigo-200 text-indigo-600 font-bold px-3 py-1.5 rounded-xl text-xs">{questions.length} Butir Soal</span>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Daftar Pertanyaan</h3>
        {isAdminOrInstructor && (
          <button onClick={() => setIsAdding(!isAdding)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all">
            <Plus size={20} /> {isAdding ? "Batal" : "Tambah Soal ke Paket"}
          </button>
        )}
      </div>

      {isAdding && isAdminOrInstructor && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmitQuestion} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  {formData.type === 'pg' ? 'Teks Pertanyaan' : 'Skenario Percakapan'}
                </label>
                <textarea
                  required rows={3}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={formData.type === 'pg' ? formData.questionText : formData.scenario}
                  onChange={(e) => setFormData({
                    ...formData,
                    [formData.type === 'pg' ? 'questionText' : 'scenario']: e.target.value
                  })}
                  placeholder="Masukkan teks soal..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tipe Soal</label>
                <select
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="pg">Pilihan Ganda (PG)</option>
                  <option value="conversation">AI Conversation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Bobot Soal</label>
                <input
                  type="number" min="1" max="10"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                />
              </div>

              {formData.type === 'pg' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Aspek Kompetensi</label>
                  <select
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                    value={formData.aspect}
                    onChange={(e) => setFormData({ ...formData, aspect: e.target.value })}
                  >
                    {ASPECTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
              )}

              {formData.type === 'pg' && (
                <div className="md:col-span-3 space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Opsi Jawaban & Skor</label>
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-2 rounded-lg text-center min-w-15">Skor {opt.score}</div>
                      <input
                        type="text" required
                        placeholder={`Teks opsi untuk skor ${opt.score}...`}
                        className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
              )}
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">Simpan Soal ke Paket</button>
          </form>
        </div>
      )}

      {/* Tabel Pertanyaan */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input
            type="text" placeholder="Cari soal..."
            className="w-full outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <table className="w-full text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left">Tipe & Bobot</th>
              <th className="px-6 py-4 text-left">Aspek</th>
              <th className="px-6 py-4 text-left">Isi Soal</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredQuestions.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Belum ada soal di paket ini.</td></tr>
            ) : (
              filteredQuestions.map((question) => (
                <React.Fragment key={question.id}>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-xs font-bold">
                      {question.type === 'conversation' ? '🎤 AI VOICE' : '📝 MULTIPLE CHOICE'}
                      <div className="text-[10px] text-slate-400 font-normal">Weight: {question.weight}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{question.aspect || 'Multi-aspek'}</td>
                    <td className="px-6 py-4 max-w-xs truncate font-medium">{question.questionText || question.scenario}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => setPreviewQuestion(question)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all" title="Preview"><Eye size={16}/></button>
                        
                        {/* REVISI: Tombol Edit Diaktifkan Kembali */}
                        {isAdminOrInstructor && (
                          <button 
                            onClick={() => handleEditClick(question)} 
                            className={`p-2 rounded-lg transition-all ${editingQuestion === question.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50'}`}
                            title="Edit"
                          >
                            <Pencil size={16}/>
                          </button>
                        )}
                        
                        {isAdminOrInstructor && (
                          <button onClick={() => handleDeleteQuestion(question.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hapus"><Trash2 size={16}/></button>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* REVISI: Inline Edit Row Dimunculkan */}
                  {editingQuestion === question.id && editForm && (
                    <EditFormRow question={question} />
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionBank;