import { useState } from 'react';
import FinanceSummary from '@features/finance/FinanceSummary';
import FinanceToolbar from '@features/finance/FinanceToolbar';
import FinanceList from '@features/finance/FinanceList';
import FinanceRecordModal from '@features/finance/FinanceRecordModal';

export default function FinanceSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleEdit = (id) => {
    setEditId(id);
    setModalOpen(true);
  };

  const handleOpenModal = () => {
    setEditId(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <FinanceSummary />
      <FinanceToolbar />
      <FinanceList onEdit={handleEdit} onOpenModal={handleOpenModal} />
      <FinanceRecordModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        editId={editId}
      />
    </div>
  );
}
