import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCRM } from '../context/CRMContext';

const { FiSave, FiDownload, FiUpload, FiTrash2, FiTag, FiPlus, FiX } = FiIcons;

function Settings() {
  const { customers, interactions, tags } = useCRM();
  const [customTags, setCustomTags] = useState(tags);
  const [newTag, setNewTag] = useState('');

  const handleExportData = () => {
    const data = {
      customers,
      interactions,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          console.log('가져온 데이터:', data);
          alert('데이터 가져오기 기능이 구현될 예정입니다');
        } catch (error) {
          alert('올바르지 않은 파일 형식입니다');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      localStorage.removeItem('crm-customers');
      localStorage.removeItem('crm-interactions');
      window.location.reload();
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('crm-tags', JSON.stringify(customTags));
    alert('설정이 저장되었습니다!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">데이터 관리</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <SafeIcon icon={FiDownload} className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-600 font-medium">데이터 내보내기</span>
          </button>
          <label className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
            <SafeIcon icon={FiUpload} className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-600 font-medium">데이터 가져오기</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
          <button
            onClick={handleClearAllData}
            className="flex items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <SafeIcon icon={FiTrash2} className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-600 font-medium">모든 데이터 삭제</span>
          </button>
        </div>
      </motion.div>

      {/* Tag Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">태그 관리</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="새 태그 추가..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {customTags.map(tag => (
              <div
                key={tag}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full"
              >
                <SafeIcon icon={FiTag} className="w-3 h-3 text-gray-500" />
                <span className="text-sm text-gray-700">{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">데이터베이스 통계</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">저장 현황</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>고객 수</span>
                <span>{customers.length}개</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>상호작용 기록</span>
                <span>{interactions.length}개</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>태그 수</span>
                <span>{customTags.length}개</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>총 저장 용량</span>
                <span>
                  {Math.round(
                    (JSON.stringify({ customers, interactions }).length / 1024) * 100
                  ) / 100} KB
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">데이터 품질</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>연락처 있는 고객</span>
                <span>{customers.filter(c => c.phone).length}개</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>회사명 있는 고객</span>
                <span>{customers.filter(c => c.companyName).length}개</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>태그 있는 고객</span>
                <span>{customers.filter(c => c.tags && c.tags.length > 0).length}개</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>노트 있는 고객</span>
                <span>{customers.filter(c => c.notes).length}개</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <button
          onClick={handleSaveSettings}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-4 h-4" />
          <span>설정 저장</span>
        </button>
      </motion.div>
    </div>
  );
}

export default Settings;