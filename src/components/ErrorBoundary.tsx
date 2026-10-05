import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
            <h1 className="text-xl font-bold text-rose-400 mb-2">Veloral Digital Shop</h1>
            <p className="text-xs text-slate-400 mb-6">
              অ্যাপ্লিকেশনে একটি সাময়িক লোডিং বিষয় দেখা দিয়েছে। রিসেট করে পুনরায় লোড করতে নিচের বাটনে চাপুন।
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
            >
              রিলোড করুন (Reload App)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
