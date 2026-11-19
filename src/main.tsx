import React, { StrictMode, Component, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary caught an error:", error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
            <div className="text-4xl mb-3">🤠</div>
            <h1 className="font-fredoka text-xl font-bold text-amber-300 mb-2">
              Bingo el Chamo
            </h1>
            <p className="text-sm text-slate-300 mb-6">
              Hubo una pequeña interrupción al cargar. Pulsa el botón abajo para reiniciar rápidamente la aplicación.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-fredoka font-bold py-3 px-6 rounded-2xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              Reiniciar Bingo
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const rootEl = document.getElementById("root");
if (rootEl) {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    rootEl.setAttribute("data-mounted", "true");
  } catch (err: any) {
    console.error("Failed to mount Bingo el Chamo:", err);
    const showBootError = (window as any).__CHAMO_SHOW_BOOT_ERROR__;
    if (typeof showBootError === "function") {
      showBootError(err?.message || String(err));
    }
  }
}
