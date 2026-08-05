import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const NotificationToast = ({ toast, onClose }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="toast-container">
      <div className={`toast ${isSuccess ? 'toast-success' : 'toast-error'}`}>
        {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span>{toast.message}</span>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
