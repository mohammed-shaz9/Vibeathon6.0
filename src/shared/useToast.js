import { useState } from 'react';
export function useToast() {
  const [toast, setToast] = useState('');
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };
  return { toast, showToast };
}
