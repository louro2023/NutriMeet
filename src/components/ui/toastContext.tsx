import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }: { children: React.ReactNode }){
  const [toasts, setToasts] = useState<Array<{ id: number; type: 'success'|'error'|'info'; message: string }>>([]);

  function push(type: 'success'|'error'|'info', message: string){
    const id = Date.now();
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded shadow-md text-white ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(){
  const ctx: any = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return {
    success: (msg: string) => ctx.push('success', msg),
    error: (msg: string) => ctx.push('error', msg),
    info: (msg: string) => ctx.push('info', msg),
  };
}

export default ToastContext;
