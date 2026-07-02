import React, { useState, useEffect } from 'react';
import DataTable from '../components/reusable/DataTable';
import { axiosInstance } from '../config/axiosInstance';
import SubtleButton from '../components/reusable/SubtleButton';
import { MoreVertical, Key, Edit2, Trash2 } from 'lucide-react';

export default function WorkingStages() { // Fixed typo here
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stageName, setStageName] = useState('');
  const [editingStage, setEditingStage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 1. Added missing state to track which dropdown is open
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // 2. Mock permissions (Replace these with your actual auth logic)
  const hasEditPerm = true;
  const hasDeletePerm = true;

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const response = await axiosInstance.get('/api/working-stages');
      setStages(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStage) {
        await axiosInstance.put(`/api/working-stages/${editingStage.id}`, { name: stageName });
      } else {
        await axiosInstance.post('/api/working-stages', { name: stageName });
      }
      closeModal();
      fetchStages();
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stage?')) return;
    try {
      await axiosInstance.delete(`/api/working-stages/${id}`);
      fetchStages();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const openEditModal = (stage) => {
    setEditingStage(stage);
    setStageName(stage.name);
    setIsModalOpen(true);
  };

  // 3. Added missing function for the credentials button
  const openCredModal = (stage) => {
    console.log('Open credentials modal for:', stage);
    // Add your credentials modal logic here
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStage(null);
    setStageName('');
  };

  const columns = [
    { label: 'ID', key: 'id', sortable: true },
    { label: 'Stage Name', key: 'name', sortable: true },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="relative">
          <button
            onClick={() => setOpenDropdownId(openDropdownId === row.id ? null : row.id)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <MoreVertical size={16} className="text-slate-500" />
          </button>

          {openDropdownId === row.id && (
            <>
              {/* 4. Added an invisible overlay to close the dropdown when clicking outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setOpenDropdownId(null)} 
              />
              
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                {hasEditPerm && (
                  <>
                   
                    <button
                      // 5. Fixed function call: handleEdit -> openEditModal
                      onClick={() => { openEditModal(row); setOpenDropdownId(null); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50"
                    >
                      <Edit2 size={14} className="text-gray-500" /> Edit
                    </button>
                  </>
                )}
                {hasDeletePerm && (
                  <button
                    onClick={() => { handleDelete(row.id); setOpenDropdownId(null); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} className="text-red-500" /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading...</div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-md">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Project Working Stages</h2>
        <SubtleButton onClick={() => setIsModalOpen(true)}>+ Add New Stage</SubtleButton>
      </div>

      <DataTable columns={columns} data={stages} />

      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-opacity-30 z-40 " onClick={closeModal} />
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 p-6">
            <h3 className="text-lg font-bold mb-4">
              {editingStage ? 'Edit Working Stage' : 'Add Working Stage'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
                required
                placeholder="Enter stage name"
              />
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2">Cancel</button>
                <SubtleButton type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </SubtleButton>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}