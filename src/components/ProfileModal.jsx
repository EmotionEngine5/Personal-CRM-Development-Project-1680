import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useProfile } from '../context/ProfileContext';
import { useNotification } from '../context/NotificationContext';

const { FiX, FiCamera, FiSave, FiUser, FiMail, FiPhone, FiBriefcase, FiMapPin, FiGlobe, FiTrash2 } = FiIcons;

function ProfileModal({ isOpen, onClose }) {
  const { profile, updateProfile, updateProfileImage, removeProfileImage } = useProfile();
  const { addNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    position: profile.position || '',
    company: profile.company || '',
    department: profile.department || '',
    bio: profile.bio || '',
    address: profile.address || '',
    website: profile.website || ''
  });
  
  const [previewImage, setPreviewImage] = useState(profile.profileImage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 기본 유효성 검사
    const validationErrors = {};
    if (!formData.name.trim()) {
      validationErrors.name = '이름을 입력해주세요';
    }
    if (!formData.email.trim()) {
      validationErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = '유효한 이메일 형식이 아닙니다';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // 프로필 업데이트
      updateProfile(formData);
      
      // 프로필 이미지가 변경된 경우
      if (previewImage !== profile.profileImage) {
        // previewImage가 null이면 이미지 제거
        if (previewImage === null) {
          removeProfileImage();
        }
        // 이미 updateProfileImage()에서 호출됨
      }
      
      addNotification({
        title: '프로필 업데이트 완료',
        message: '프로필 정보가 성공적으로 업데이트되었습니다.',
        type: 'success'
      });
      
      onClose();
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      addNotification({
        title: '프로필 업데이트 실패',
        message: '프로필 정보 업데이트 중 오류가 발생했습니다.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 오류 메시지 제거
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: '이미지 크기는 5MB 이하여야 합니다'
        }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: '이미지 파일만 업로드할 수 있습니다'
        }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
        updateProfileImage(file);
      };
      reader.onerror = () => {
        setErrors(prev => ({
          ...prev,
          image: '이미지 로드 중 오류가 발생했습니다'
        }));
      };
      reader.readAsDataURL(file);
      
      // 이미지 오류 메시지 제거
      if (errors.image) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
  };

  const getProfileInitials = () => {
    if (formData.name) {
      return formData.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">개인정보 관리</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="프로필" 
                      className="w-full h-full object-cover"
                      onError={() => {
                        setPreviewImage(null);
                        setErrors(prev => ({
                          ...prev,
                          image: '이미지 로드에 실패했습니다'
                        }));
                      }}
                    />
                  ) : (
                    <span className="text-primary-600 font-bold text-2xl">
                      {getProfileInitials()}
                    </span>
                  )}
                </div>
                
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                  <SafeIcon icon={FiCamera} className="w-4 h-4" />
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                
                {previewImage && (
                  <button 
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute bottom-0 left-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">클릭하여 프로필 사진 변경</p>
              {errors.image && (
                <p className="text-sm text-red-600 mt-1">{errors.image}</p>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiUser} className="w-4 h-4 inline mr-2" />
                  이름 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiMail} className="w-4 h-4 inline mr-2" />
                  이메일 *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiPhone} className="w-4 h-4 inline mr-2" />
                  연락처
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="01012345678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiBriefcase} className="w-4 h-4 inline mr-2" />
                  직책
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="영업 담당자"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사명
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="EmotionEngine"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  부서
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="영업팀"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 inline mr-2" />
                주소
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="서울특별시 강남구 테헤란로 123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiGlobe} className="w-4 h-4 inline mr-2" />
                웹사이트
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://www.example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                소개
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="자신에 대한 간단한 소개를 작성해주세요..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>저장 중...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiSave} className="w-4 h-4" />
                    <span>저장</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfileModal;