import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCRM } from '../context/CRMContext';
import InteractionForm from '../components/InteractionForm';
import { format } from 'date-fns';

const { FiArrowLeft, FiEdit, FiTrash2, FiMail, FiPhone, FiMapPin, FiBriefcase, FiPlus, FiMessageSquare } = FiIcons;

function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContactById, getInteractionsByContactId, deleteContact } = useCRM();
  const [showInteractionForm, setShowInteractionForm] = useState(false);

  const contact = getContactById(id);
  const interactions = getInteractionsByContactId(id);

  if (!contact) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Contact not found</h3>
        <button
          onClick={() => navigate('/contacts')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Back to Contacts
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      deleteContact(id);
      navigate('/contacts');
    }
  };

  const getInteractionIcon = (type) => {
    switch (type) {
      case 'call': return FiPhone;
      case 'email': return FiMail;
      case 'meeting': return FiBriefcase;
      default: return FiMessageSquare;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/contacts')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
            {contact.company && (
              <p className="text-gray-600">{contact.position} at {contact.company}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100">
            <SafeIcon icon={FiEdit} className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
          >
            <SafeIcon icon={FiTrash2} className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold text-2xl">
                  {contact.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
              {contact.company && (
                <p className="text-gray-500">{contact.company}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiMail} className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiPhone} className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{contact.phone}</span>
                </div>
              )}
              {contact.address && (
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiMapPin} className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{contact.address}</span>
                </div>
              )}
              {contact.position && (
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiBriefcase} className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{contact.position}</span>
                </div>
              )}
            </div>

            {contact.tags && contact.tags.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {contact.notes && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{contact.notes}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Interactions */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Interactions</h3>
              <button
                onClick={() => setShowInteractionForm(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                <span>Add Interaction</span>
              </button>
            </div>

            <div className="space-y-4">
              {interactions.length > 0 ? (
                interactions
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((interaction) => (
                    <div
                      key={interaction.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <SafeIcon 
                              icon={getInteractionIcon(interaction.type)} 
                              className="w-4 h-4 text-primary-600" 
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 capitalize">
                              {interaction.type}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {format(new Date(interaction.createdAt), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          {interaction.subject && (
                            <p className="text-sm font-medium text-gray-700 mt-1">
                              {interaction.subject}
                            </p>
                          )}
                          {interaction.notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              {interaction.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={FiMessageSquare} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No interactions yet</h4>
                  <p className="text-gray-500 mb-4">
                    Start tracking your conversations and meetings with this contact.
                  </p>
                  <button
                    onClick={() => setShowInteractionForm(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add First Interaction
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Interaction Form Modal */}
      {showInteractionForm && (
        <InteractionForm
          contactId={id}
          onClose={() => setShowInteractionForm(false)}
        />
      )}
    </div>
  );
}

export default ContactDetail;