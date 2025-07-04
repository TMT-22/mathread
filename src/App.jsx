import React, { useState } from 'react';
import { Plus, User, BarChart3, BookOpen, Trash2, Edit, Save, X, Eye, EyeOff } from 'lucide-react';

const MathLearningSystem = () => {
  const [problems, setProblems] = useState([]);
  const [students, setStudents] = useState(['학생A', '학생B', '학생C', '학생D']);
  const [submissions, setSubmissions] = useState({});
  const [currentView, setCurrentView] = useState('problems');
  const [newProblem, setNewProblem] = useState({ answer: '', type: '', image: null, solutionImage: null });
  const [dragActive, setDragActive] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('학생A');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [editingProblem, setEditingProblem] = useState(null);
  const [editForm, setEditForm] = useState({ answer: '', type: '', image: null, solutionImage: null });
  const [showSolutions, setShowSolutions] = useState({}); // 문제별 해답 풀이 표시 상태

  // 유형별 색깔 단계 정의 (5단계)
  const getTypeColor = (student, type) => {
    const studentSubs = submissions[student] || [];
    const typeProblems = studentSubs.filter(sub => sub.type === type);
    
    if (typeProblems.length === 0) {
      return { color: '#ffffff', border: '#e5e7eb', name: '미시도' }; // 흰색
    }
    
    if (typeProblems.length === 1) {
      return { color: '#9ca3af', border: '#6b7280', name: '1문제 시도' }; // 회색
    }
    
    if (typeProblems.length === 2) {
      const correct = typeProblems.filter(sub => sub.isCorrect).length;
      if (correct === 0) {
        return { color: '#dc2626', border: '#b91c1c', name: '빨간색' }; // 빨간색 (0/2)
      } else if (correct === 1) {
        return { color: '#ec4899', border: '#db2777', name: '분홍색' }; // 분홍색 (1/2)
      } else {
        return { color: '#eab308', border: '#ca8a04', name: '노랑색' }; // 노랑색 (2/2)
      }
    }
    
    // 3문제 이상부터는 동적 색상 계산
    const correct = typeProblems.filter(sub => sub.isCorrect).length;
    const total = typeProblems.length;
    const rate = correct / total;
    
    if (rate < 0.3) {
      return { color: '#dc2626', border: '#b91c1c', name: '빨간색' }; // 빨간색
    } else if (rate < 0.5) {
      return { color: '#ec4899', border: '#db2777', name: '분홍색' }; // 분홍색
    } else if (rate < 0.7) {
      return { color: '#eab308', border: '#ca8a04', name: '노랑색' }; // 노랑색
    } else if (rate < 0.9) {
      return { color: '#84cc16', border: '#65a30d', name: '연두색' }; // 연두색
    } else {
      return { color: '#16a34a', border: '#15803d', name: '초록색' }; // 초록색
    }
  };

  // 이미지 파일 처리
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

  // 드래그 앤 드롭 처리
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

  // 문제 추가
  const addProblem = () => {
    if (newProblem.image && newProblem.answer && newProblem.type && newProblem.solutionImage) {
      setProblems([...problems, { ...newProblem, id: Date.now() }]);
      setNewProblem({ answer: '', type: '', image: null, solutionImage: null });
    }
  };

  // 문제 삭제
  const deleteProblem = (id) => {
    if (confirm('정말로 이 문제를 삭제하시겠습니까?')) {
      setProblems(problems.filter(p => p.id !== id));
      // 관련 제출 기록도 삭제
      const newSubmissions = { ...submissions };
      Object.keys(newSubmissions).forEach(student => {
        newSubmissions[student] = newSubmissions[student].filter(sub => sub.problemId !== id);
      });
      setSubmissions(newSubmissions);
    }
  };

  // 문제 수정 시작
  const startEditing = (problem) => {
    setEditingProblem(problem.id);
    setEditForm({
      answer: problem.answer,
      type: problem.type,
      image: problem.image,
      solutionImage: problem.solutionImage
    });
  };

  // 문제 수정 저장
  const saveEdit = () => {
    setProblems(problems.map(p => 
      p.id === editingProblem 
        ? { ...p, ...editForm }
        : p
    ));
    setEditingProblem(null);
    setEditForm({ answer: '', type: '', image: null, solutionImage: null });
  };

  // 문제 수정 취소
  const cancelEdit = () => {
    setEditingProblem(null);
    setEditForm({ answer: '', type: '', image: null, solutionImage: null });
  };

  // 학생 답안 제출
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

  // 해답 풀이 토글
  const toggleSolution = (problemId) => {
    setShowSolutions(prev => ({
      ...prev,
      [problemId]: !prev[problemId]
    }));
  };

  // 모든 유형 목록
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
                이미지 삭제
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
                <p className="text-gray-600">이미지를 드래그하거나 클릭해서 업로드</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF 파일 지원</p>
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
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">수학 학습 관리 시스템</h1>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setCurrentView('problems')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                currentView === 'problems' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen size={20} />
              문제 관리
            </button>
            <button
              onClick={() => setCurrentView('student')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                currentView === 'student' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User size={20} />
              학생 답안
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                currentView === 'analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={20} />
              유형별 분석
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 문제 관리 뷰 */}
        {currentView === 'problems' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">새 문제 추가</h2>
              
              <ImageUploadArea 
                title="문제 이미지"
                currentImage={newProblem.image}
                onImageRemove={() => setNewProblem({...newProblem, image: null})}
                imageType="problem"
              />

              <ImageUploadArea 
                title="해답 풀이 이미지"
                currentImage={newProblem.solutionImage}
                onImageRemove={() => setNewProblem({...newProblem, solutionImage: null})}
                imageType="solution"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">정답</label>
                  <input
                    type="text"
                    value={newProblem.answer}
                    onChange={(e) => setNewProblem({...newProblem, answer: e.target.value})}
                    placeholder="예: x = 2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
                  <input
                    type="text"
                    value={newProblem.type}
                    onChange={(e) => setNewProblem({...newProblem, type: e.target.value})}
                    placeholder="예: 일차방정식"
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
                문제 추가
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">등록된 문제 ({problems.length}개)</h2>
              <div className="space-y-3">
                {problems.map((problem) => (
                  <div key={problem.id} className="p-4 bg-gray-50 rounded-lg">
                    {editingProblem === problem.id ? (
                      // 수정 모드
                      <div className="space-y-4">
                        <ImageUploadArea 
                          title="문제 이미지"
                          currentImage={editForm.image}
                          onImageRemove={() => setEditForm({...editForm, image: null})}
                          imageType="problem"
                          isEdit={true}
                        />
                        
                        <ImageUploadArea 
                          title="해답 풀이 이미지"
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
                            placeholder="정답"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={editForm.type}
                            onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                            placeholder="유형"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                          >
                            <Save size={16} />
                            저장
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 text-sm"
                          >
                            <X size={16} />
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 보기 모드
                      <div className="flex items-start gap-4">
                        <div className="flex gap-4">
                          {problem.image && (
                            <div className="flex-shrink-0">
                              <img 
                                src={problem.image} 
                                alt="문제" 
                                className="w-24 h-24 object-cover rounded-lg border"
                              />
                              <p className="text-xs text-center text-gray-500 mt-1">문제</p>
                            </div>
                          )}
                          {problem.solutionImage && (
                            <div className="flex-shrink-0">
                              <img 
                                src={problem.solutionImage} 
                                alt="해답 풀이" 
                                className="w-24 h-24 object-cover rounded-lg border"
                              />
                              <p className="text-xs text-center text-gray-500 mt-1">해답풀이</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">
                            <div>정답: {problem.answer}</div>
                            <div>유형: {problem.type}</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(problem)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm px-2 py-1"
                          >
                            <Edit size={16} />
                            수정
                          </button>
                          <button
                            onClick={() => deleteProblem(problem.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm px-2 py-1"
                          >
                            <Trash2 size={16} />
                            삭제
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {problems.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    아직 등록된 문제가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 학생 답안 뷰 */}
        {currentView === 'student' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">학생 선택</h2>
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
              <h2 className="text-xl font-semibold mb-4">문제 풀기</h2>
              {problems.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  문제를 먼저 등록해주세요.
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
                              alt="문제" 
                              className="max-w-full max-h-48 mb-2 rounded-lg border"
                            />
                          )}
                          <div className="text-sm text-gray-600 mb-2">유형: {problem.type}</div>
                          
                          {/* 이전 제출 기록 */}
                          {problemSubs.length > 0 && (
                            <div className="text-xs text-gray-500 mb-2">
                              이전 제출: {problemSubs.map((sub, idx) => (
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
                            placeholder="답을 입력하세요"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && submitAnswer(problem.id)}
                          />
                          <button
                            onClick={() => submitAnswer(problem.id)}
                            disabled={!studentAnswer.trim()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            제출
                          </button>
                        </div>

                        {/* 해답 풀이 보기 버튼 */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => toggleSolution(problem.id)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-50"
                          >
                            {showSolutions[problem.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                            {showSolutions[problem.id] ? '해답 풀이 숨기기' : '해답 풀이 보기'}
                          </button>
                        </div>

                        {/* 해답 풀이 표시 */}
                        {showSolutions[problem.id] && problem.solutionImage && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">해답 풀이</h4>
                            <img 
                              src={problem.solutionImage} 
                              alt="해답 풀이" 
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

        {/* 유형별 분석 뷰 */}
        {currentView === 'analytics' && (
          <div className="space-y-6">
            {/* 유형별 취약도 분석 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">유형별 취약도 분석</h2>
              
              {/* 색깔 범례 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">색깔 범례</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                    <span>미시도</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span>1문제만 시도</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span>빨간색 (매우 취약)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-pink-500 rounded"></div>
                    <span>분홍색 (취약)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>노랑색 (보통)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-lime-500 rounded"></div>
                    <span>연두색 (양호)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>초록색 (우수)</span>
                  </div>
                </div>
              </div>
{/* 학생별 유형 분석 테이블 */}
              {allTypes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-3 text-left font-medium">학생</th>
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
                                  title={`${colorInfo.name} - ${correct}/${total} 정답`}
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
                  문제를 등록하고 학생들이 문제를 풀면 분석 결과가 표시됩니다.
                </div>
              )}
            </div>

            {/* 개별 학생 상세 분석 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">개별 학생 상세 분석</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">분석할 학생 선택</label>
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
                
                // 유형별 통계 계산
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
                    {/* 전체 성과 요약 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{totalProblems}</div>
                        <div className="text-sm text-blue-700">총 시도 문제</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{totalCorrect}</div>
                        <div className="text-sm text-green-700">정답 문제</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600">{totalProblems - totalCorrect}</div>
                        <div className="text-sm text-red-700">오답 문제</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">{overallRate}%</div>
                        <div className="text-sm text-purple-700">전체 정답률</div>
                      </div>
                    </div>

                    {/* 유형별 상세 분석 */}
                    {allTypes.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-medium mb-4">유형별 상세 분석</h3>
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
                                    <div className="text-gray-600">총 시도</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-semibold text-green-600">{stats.correct}</div>
                                    <div className="text-gray-600">정답</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-semibold text-red-600">{stats.incorrect}</div>
                                    <div className="text-gray-600">오답</div>
                                  </div>
                                </div>

                                {/* 진행률 바 */}
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>진행률</span>
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
                        등록된 문제가 없습니다.
                      </div>
                    )}

                    {/* 최근 활동 */}
                    {studentSubs.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">최근 활동 (최신 10개)</h3>
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
                                      답안: <span className="font-mono">{sub.answer}</span>
                                    </span>
                                    {problem && (
                                      <span className="text-xs text-gray-400">
                                        (정답: {problem.answer})
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