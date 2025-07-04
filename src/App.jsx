import React, { useState } from 'react';
import { Plus, User, BarChart3, BookOpen, Trash2, Edit, Save, X, Eye, EyeOff } from 'lucide-react';

const MathLearningSystem = () => {
  const [problems, setProblems] = useState([]);
  const [students, setStudents] = useState(['�л�A', '�л�B', '�л�C', '�л�D']);
  const [submissions, setSubmissions] = useState({});
  const [currentView, setCurrentView] = useState('problems');
  const [newProblem, setNewProblem] = useState({ answer: '', type: '', image: null, solutionImage: null });
  const [dragActive, setDragActive] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('�л�A');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [editingProblem, setEditingProblem] = useState(null);
  const [editForm, setEditForm] = useState({ answer: '', type: '', image: null, solutionImage: null });
  const [showSolutions, setShowSolutions] = useState({}); // ������ �ش� Ǯ�� ǥ�� ����

  // ������ ���� �ܰ� ���� (5�ܰ�)
  const getTypeColor = (student, type) => {
    const studentSubs = submissions[student] || [];
    const typeProblems = studentSubs.filter(sub => sub.type === type);
    
    if (typeProblems.length === 0) {
      return { color: '#ffffff', border: '#e5e7eb', name: '�̽õ�' }; // ���
    }
    
    if (typeProblems.length === 1) {
      return { color: '#9ca3af', border: '#6b7280', name: '1���� �õ�' }; // ȸ��
    }
    
    if (typeProblems.length === 2) {
      const correct = typeProblems.filter(sub => sub.isCorrect).length;
      if (correct === 0) {
        return { color: '#dc2626', border: '#b91c1c', name: '������' }; // ������ (0/2)
      } else if (correct === 1) {
        return { color: '#ec4899', border: '#db2777', name: '��ȫ��' }; // ��ȫ�� (1/2)
      } else {
        return { color: '#eab308', border: '#ca8a04', name: '�����' }; // ����� (2/2)
      }
    }
    
    // 3���� �̻���ʹ� ���� ���� ���
    const correct = typeProblems.filter(sub => sub.isCorrect).length;
    const total = typeProblems.length;
    const rate = correct / total;
    
    if (rate < 0.3) {
      return { color: '#dc2626', border: '#b91c1c', name: '������' }; // ������
    } else if (rate < 0.5) {
      return { color: '#ec4899', border: '#db2777', name: '��ȫ��' }; // ��ȫ��
    } else if (rate < 0.7) {
      return { color: '#eab308', border: '#ca8a04', name: '�����' }; // �����
    } else if (rate < 0.9) {
      return { color: '#84cc16', border: '#65a30d', name: '���λ�' }; // ���λ�
    } else {
      return { color: '#16a34a', border: '#15803d', name: '�ʷϻ�' }; // �ʷϻ�
    }
  };

  // �̹��� ���� ó��
  const handleImageUpload = (file, isEdit = false, imageType = 'problem') => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isEdit) {
          if (imageType === 'solution') {
            setEditForm({...editForm, solutionImage: e.target.result});
          } else {
            setEditForm({...editForm, image: e.target.result});
          }
        } else {
          if (imageType === 'solution') {
            setNewProblem({...newProblem, solutionImage: e.target.result});
          } else {
            setNewProblem({...newProblem, image: e.target.result});
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // �巡�� �� ��� ó��
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e, isEdit = false, imageType = 'problem') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0], isEdit, imageType);
    }
  };

  // ���� �߰�
  const addProblem = () => {
    if (newProblem.image && newProblem.answer && newProblem.type && newProblem.solutionImage) {
      setProblems([...problems, { ...newProblem, id: Date.now() }]);
      setNewProblem({ answer: '', type: '', image: null, solutionImage: null });
    }
  };

  // ���� ����
  const deleteProblem = (id) => {
    if (confirm('������ �� ������ �����Ͻðڽ��ϱ�?')) {
      setProblems(problems.filter(p => p.id !== id));
      // ���� ���� ��ϵ� ����
      const newSubmissions = { ...submissions };
      Object.keys(newSubmissions).forEach(student => {
        newSubmissions[student] = newSubmissions[student].filter(sub => sub.problemId !== id);
      });
      setSubmissions(newSubmissions);
    }
  };

  // ���� ���� ����
  const startEditing = (problem) => {
    setEditingProblem(problem.id);
    setEditForm({
      answer: problem.answer,
      type: problem.type,
      image: problem.image,
      solutionImage: problem.solutionImage
    });
  };

  // ���� ���� ����
  const saveEdit = () => {
    setProblems(problems.map(p => 
      p.id === editingProblem 
        ? { ...p, ...editForm }
        : p
    ));
    setEditingProblem(null);
    setEditForm({ answer: '', type: '', image: null, solutionImage: null });
  };

  // ���� ���� ���
  const cancelEdit = () => {
    setEditingProblem(null);
    setEditForm({ answer: '', type: '', image: null, solutionImage: null });
  };

  // �л� ��� ����
  const submitAnswer = (problemId) => {
    if (!studentAnswer.trim()) return;
    
    const problem = problems.find(p => p.id === problemId);
    const isCorrect = studentAnswer.trim() === problem.answer.trim();
    
    const submission = {
      problemId,
      type: problem.type,
      answer: studentAnswer,
      isCorrect,
      timestamp: Date.now()
    };
    
    setSubmissions(prev => ({
      ...prev,
      [selectedStudent]: [...(prev[selectedStudent] || []), submission]
    }));
    
    setStudentAnswer('');
  };

  // �ش� Ǯ�� ���
  const toggleSolution = (problemId) => {
    setShowSolutions(prev => ({
      ...prev,
      [problemId]: !prev[problemId]
    }));
  };

  // ��� ���� ���
  const allTypes = [...new Set(problems.map(p => p.type))];

  const ImageUploadArea = ({ title, currentImage, onImageChange, onImageRemove, imageType = 'problem', isEdit = false }) => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, isEdit, imageType)}
        >
          {currentImage ? (
            <div className="space-y-3">
              <img 
                src={currentImage} 
                alt={title} 
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
              />
              <button
                onClick={onImageRemove}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                �̹��� ����
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-gray-600">�̹����� �巡���ϰų� Ŭ���ؼ� ���ε�</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF ���� ����</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], isEdit, imageType)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ��� */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">���� �н� ���� �ý���</h1>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setCurrentView('problems')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                currentView === 'problems' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen size={20} />
              ���� ����
            </button>
            <button
              onClick={() => setCurrentView('student')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                currentView === 'student' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User size={20} />
              �л� ���
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                currentView === 'analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={20} />
              ������ �м�
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ���� ���� �� */}
        {currentView === 'problems' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">�� ���� �߰�</h2>
              
              <ImageUploadArea 
                title="���� �̹���"
                currentImage={newProblem.image}
                onImageRemove={() => setNewProblem({...newProblem, image: null})}
                imageType="problem"
              />

              <ImageUploadArea 
                title="�ش� Ǯ�� �̹���"
                currentImage={newProblem.solutionImage}
                onImageRemove={() => setNewProblem({...newProblem, solutionImage: null})}
                imageType="solution"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">����</label>
                  <input
                    type="text"
                    value={newProblem.answer}
                    onChange={(e) => setNewProblem({...newProblem, answer: e.target.value})}
                    placeholder="��: x = 2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">����</label>
                  <input
                    type="text"
                    value={newProblem.type}
                    onChange={(e) => setNewProblem({...newProblem, type: e.target.value})}
                    placeholder="��: ����������"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={addProblem}
                disabled={!newProblem.image || !newProblem.answer || !newProblem.type || !newProblem.solutionImage}
                className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                ���� �߰�
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">��ϵ� ���� ({problems.length}��)</h2>
              <div className="space-y-3">
                {problems.map((problem) => (
                  <div key={problem.id} className="p-4 bg-gray-50 rounded-lg">
                    {editingProblem === problem.id ? (
                      // ���� ���
                      <div className="space-y-4">
                        <ImageUploadArea 
                          title="���� �̹���"
                          currentImage={editForm.image}
                          onImageRemove={() => setEditForm({...editForm, image: null})}
                          imageType="problem"
                          isEdit={true}
                        />
                        
                        <ImageUploadArea 
                          title="�ش� Ǯ�� �̹���"
                          currentImage={editForm.solutionImage}
                          onImageRemove={() => setEditForm({...editForm, solutionImage: null})}
                          imageType="solution"
                          isEdit={true}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={editForm.answer}
                            onChange={(e) => setEditForm({...editForm, answer: e.target.value})}
                            placeholder="����"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={editForm.type}
                            onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                            placeholder="����"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                          >
                            <Save size={16} />
                            ����
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 text-sm"
                          >
                            <X size={16} />
                            ���
                          </button>
                        </div>
                      </div>
                    ) : (
                      // ���� ���
                      <div className="flex items-start gap-4">
                        <div className="flex gap-4">
                          {problem.image && (
                            <div className="flex-shrink-0">
                              <img 
                                src={problem.image} 
                                alt="����" 
                                className="w-24 h-24 object-cover rounded-lg border"
                              />
                              <p className="text-xs text-center text-gray-500 mt-1">����</p>
                            </div>
                          )}
                          {problem.solutionImage && (
                            <div className="flex-shrink-0">
                              <img 
                                src={problem.solutionImage} 
                                alt="�ش� Ǯ��" 
                                className="w-24 h-24 object-cover rounded-lg border"
                              />
                              <p className="text-xs text-center text-gray-500 mt-1">�ش�Ǯ��</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">
                            <div>����: {problem.answer}</div>
                            <div>����: {problem.type}</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(problem)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm px-2 py-1"
                          >
                            <Edit size={16} />
                            ����
                          </button>
                          <button
                            onClick={() => deleteProblem(problem.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm px-2 py-1"
                          >
                            <Trash2 size={16} />
                            ����
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {problems.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    ���� ��ϵ� ������ �����ϴ�.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* �л� ��� �� */}
        {currentView === 'student' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">�л� ����</h2>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {students.map(student => (
                  <option key={student} value={student}>{student}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">���� Ǯ��</h2>
              {problems.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  ������ ���� ������ּ���.
                </div>
              ) : (
                <div className="space-y-4">
                  {problems.map((problem) => {
                    const studentSubs = submissions[selectedStudent] || [];
                    const problemSubs = studentSubs.filter(sub => sub.problemId === problem.id);
                    
                    return (
                      <div key={problem.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="mb-3">
                          {problem.image && (
                            <img 
                              src={problem.image} 
                              alt="����" 
                              className="max-w-full max-h-48 mb-2 rounded-lg border"
                            />
                          )}
                          <div className="text-sm text-gray-600 mb-2">����: {problem.type}</div>
                          
                          {/* ���� ���� ��� */}
                          {problemSubs.length > 0 && (
                            <div className="text-xs text-gray-500 mb-2">
                              ���� ����: {problemSubs.map((sub, idx) => (
                                <span key={idx} className={`inline-block px-2 py-1 rounded mr-1 ${
                                  sub.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {sub.answer}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-3 mb-3">
                          <input
                            type="text"
                            value={studentAnswer}
                            onChange={(e) => setStudentAnswer(e.target.value)}
                            placeholder="���� �Է��ϼ���"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && submitAnswer(problem.id)}
                          />
                          <button
                            onClick={() => submitAnswer(problem.id)}
                            disabled={!studentAnswer.trim()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            ����
                          </button>
                        </div>

                        {/* �ش� Ǯ�� ���� ��ư */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => toggleSolution(problem.id)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-50"
                          >
                            {showSolutions[problem.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                            {showSolutions[problem.id] ? '�ش� Ǯ�� �����' : '�ش� Ǯ�� ����'}
                          </button>
                        </div>

                        {/* �ش� Ǯ�� ǥ�� */}
                        {showSolutions[problem.id] && problem.solutionImage && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">�ش� Ǯ��</h4>
                            <img 
                              src={problem.solutionImage} 
                              alt="�ش� Ǯ��" 
                              className="max-w-full rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ������ �м� �� */}
        {currentView === 'analytics' && (
          <div className="space-y-6">
            {/* ������ ��൵ �м� */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">������ ��൵ �м�</h2>
              
              {/* ���� ���� */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">���� ����</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                    <span>�̽õ�</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span>1������ �õ�</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span>������ (�ſ� ���)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-pink-500 rounded"></div>
                    <span>��ȫ�� (���)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>����� (����)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-lime-500 rounded"></div>
                    <span>���λ� (��ȣ)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>�ʷϻ� (���)</span>
                  </div>
                </div>
              </div>
{/* �л��� ���� �м� ���̺� */}
              {allTypes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-3 text-left font-medium">�л�</th>
                        {allTypes.map(type => (
                          <th key={type} className="border border-gray-300 px-4 py-3 text-center font-medium">
                            {type}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-medium">
                            {student}
                          </td>
                          {allTypes.map(type => {
                            const colorInfo = getTypeColor(student, type);
                            const studentSubs = submissions[student] || [];
                            const typeProblems = studentSubs.filter(sub => sub.type === type);
                            const correct = typeProblems.filter(sub => sub.isCorrect).length;
                            const total = typeProblems.length;
                            
                            return (
                              <td key={type} className="border border-gray-300 px-4 py-3 text-center">
                                <div 
                                  className="w-12 h-12 mx-auto rounded-lg border-2 flex items-center justify-center text-xs font-medium"
                                  style={{
                                    backgroundColor: colorInfo.color,
                                    borderColor: colorInfo.border,
                                    color: colorInfo.color === '#ffffff' ? '#374151' : '#ffffff'
                                  }}
                                  title={`${colorInfo.name} - ${correct}/${total} ����`}
                                >
                                  {total > 0 ? `${correct}/${total}` : '-'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {total > 0 ? `${Math.round((correct/total)*100)}%` : '0%'}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  ������ ����ϰ� �л����� ������ Ǯ�� �м� ����� ǥ�õ˴ϴ�.
                </div>
              )}
            </div>

            {/* ���� �л� �� �м� */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">���� �л� �� �м�</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">�м��� �л� ����</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {students.map(student => (
                    <option key={student} value={student}>{student}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const studentSubs = submissions[selectedStudent] || [];
                const typeStats = {};
                
                // ������ ��� ���
                allTypes.forEach(type => {
                  const typeProblems = studentSubs.filter(sub => sub.type === type);
                  const correct = typeProblems.filter(sub => sub.isCorrect).length;
                  const total = typeProblems.length;
                  const rate = total > 0 ? (correct / total) * 100 : 0;
                  
                  typeStats[type] = {
                    total,
                    correct,
                    incorrect: total - correct,
                    rate: Math.round(rate),
                    colorInfo: getTypeColor(selectedStudent, type)
                  };
                });

                const totalProblems = studentSubs.length;
                const totalCorrect = studentSubs.filter(sub => sub.isCorrect).length;
                const overallRate = totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0;

                return (
                  <div className="space-y-6">
                    {/* ��ü ���� ��� */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{totalProblems}</div>
                        <div className="text-sm text-blue-700">�� �õ� ����</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{totalCorrect}</div>
                        <div className="text-sm text-green-700">���� ����</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600">{totalProblems - totalCorrect}</div>
                        <div className="text-sm text-red-700">���� ����</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">{overallRate}%</div>
                        <div className="text-sm text-purple-700">��ü �����</div>
                      </div>
                    </div>

                    {/* ������ �� �м� */}
                    {allTypes.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-medium mb-4">������ �� �м�</h3>
                        <div className="space-y-3">
                          {allTypes.map(type => {
                            const stats = typeStats[type];
                            return (
                              <div key={type} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-6 h-6 rounded border-2"
                                      style={{
                                        backgroundColor: stats.colorInfo.color,
                                        borderColor: stats.colorInfo.border
                                      }}
                                    ></div>
                                    <span className="font-medium">{type}</span>
                                    <span className="text-sm text-gray-500">({stats.colorInfo.name})</span>
                                  </div>
                                  <div className="text-lg font-bold text-gray-700">
                                    {stats.rate}%
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div className="text-center">
                                    <div className="text-lg font-semibold text-blue-600">{stats.total}</div>
                                    <div className="text-gray-600">�� �õ�</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-semibold text-green-600">{stats.correct}</div>
                                    <div className="text-gray-600">����</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-semibold text-red-600">{stats.incorrect}</div>
                                    <div className="text-gray-600">����</div>
                                  </div>
                                </div>

                                {/* ����� �� */}
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>�����</span>
                                    <span>{stats.correct}/{stats.total}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                                      style={{ width: `${stats.rate}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        ��ϵ� ������ �����ϴ�.
                      </div>
                    )}

                    {/* �ֱ� Ȱ�� */}
                    {studentSubs.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">�ֱ� Ȱ�� (�ֽ� 10��)</h3>
                        <div className="space-y-2">
                          {studentSubs
                            .sort((a, b) => b.timestamp - a.timestamp)
                            .slice(0, 10)
                            .map((sub, idx) => {
                              const problem = problems.find(p => p.id === sub.problemId);
                              return (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${sub.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-sm font-medium">{sub.type}</span>
                                    <span className="text-sm text-gray-500">
                                      ���: <span className="font-mono">{sub.answer}</span>
                                    </span>
                                    {problem && (
                                      <span className="text-xs text-gray-400">
                                        (����: {problem.answer})
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(sub.timestamp).toLocaleString('ko-KR')}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathLearningSystem;