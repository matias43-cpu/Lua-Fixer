import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useValidateLua } from "@workspace/api-client-react";
import { Terminal, ShieldAlert, ShieldCheck, ChevronRight, Activity, Cpu } from "lucide-react";

// Use a single instance of QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function MainApp() {
  const [code, setCode] = useState("");
  const validateMutation = useValidateLua();

  const handleValidate = () => {
    if (!code.trim()) return;
    validateMutation.mutate({ data: { code } });
  };

  const isScanning = validateMutation.isPending;
  const result = validateMutation.data;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 scanline-container">
      {/* Header */}
      <header className="w-full max-w-5xl mb-8 flex items-end justify-between border-b border-primary/30 pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-wider glitch-glow uppercase">LUA_STATION // V1.0</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-2">
              <Activity className="w-3 h-3 text-primary/50" />
              Automated Diagnostics & Repair
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-xs text-primary/50 uppercase tracking-widest text-right">
          SYS_STATUS: <span className="text-primary glitch-glow">ONLINE</span><br/>
          UPLINK: <span className="text-primary glitch-glow">SECURE</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl flex flex-col gap-6 relative z-10 flex-grow">
        
        {/* Input Section */}
        <section className="terminal-panel flex flex-col">
          <div className="bg-secondary/50 border-b border-border px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-bold text-primary flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> input.lua
            </span>
            <span className="text-xs text-muted-foreground uppercase">RAW_SOURCE</span>
          </div>
          <div className="relative p-4 flex-grow">
            <textarea
              className="w-full min-h-[300px] bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-y outline-none font-mono text-sm scrollbar-custom"
              placeholder="-- Paste your unverified Lua code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              disabled={isScanning}
            />
          </div>
          <div className="border-t border-border p-4 bg-background/50 flex justify-end">
            <button
              onClick={handleValidate}
              disabled={!code.trim() || isScanning}
              className="group relative px-6 py-2 bg-primary/10 border border-primary text-primary font-bold uppercase tracking-wider text-sm transition-all hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              data-testid="button-submit-validate"
            >
              {isScanning ? (
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 animate-pulse" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Validate & Fix <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
              {isScanning && <div className="absolute inset-0 scanline-sweep bg-primary/20" />}
            </button>
          </div>
        </section>

        {/* Results Section */}
        {result && !isScanning && (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result.valid ? (
              // Success State
              <section className="terminal-panel border-[#00ff66]/30 bg-[#00ff66]/5 p-8 flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-16 h-16 text-[#00ff66] mb-4 success-glow" />
                <h2 className="text-2xl font-bold uppercase tracking-widest success-glow mb-2">Code is Valid</h2>
                <p className="text-sm text-foreground/80 font-mono">No structural anomalies detected. Protocol ready.</p>
              </section>
            ) : (
              // Errors State
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Errors List */}
                <section className="terminal-panel border-destructive/50 flex flex-col h-full">
                  <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-bold flex items-center gap-2 error-glow">
                      <ShieldAlert className="w-4 h-4" /> Errors Detected
                    </span>
                    <span className="text-xs text-destructive font-mono">{result.errors.length} FAULT(S)</span>
                  </div>
                  <div className="p-4 flex-grow overflow-auto bg-destructive/5 max-h-[400px] scrollbar-custom">
                    <ul className="space-y-3 font-mono text-sm">
                      {result.errors.map((error, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-destructive border-l-2 border-destructive pl-3 py-1 bg-destructive/10">
                          <span className="shrink-0 mt-0.5 opacity-70">[{idx + 1}]</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {/* Fixed Code */}
                <section className="terminal-panel border-[#00ff66]/30 flex flex-col h-full">
                  <div className="bg-[#00ff66]/10 border-b border-[#00ff66]/30 px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-bold flex items-center gap-2 success-glow">
                      <ShieldCheck className="w-4 h-4" /> Fixed Code
                    </span>
                    <span className="text-xs text-[#00ff66] uppercase">AUTO_CORRECTED</span>
                  </div>
                  <div className="relative p-4 flex-grow bg-[#00ff66]/5 max-h-[400px] overflow-auto scrollbar-custom">
                    <pre className="font-mono text-sm text-[#e0e0e0] whitespace-pre-wrap break-all">
                      <code>{result.fixedCode}</code>
                    </pre>
                  </div>
                  <div className="border-t border-[#00ff66]/30 p-2 bg-[#00ff66]/10 flex justify-end">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.fixedCode);
                      }}
                      className="text-xs text-[#00ff66] hover:text-[#00ff66] hover:underline uppercase tracking-wider font-bold px-4 py-1"
                    >
                      [ Copy to Clipboard ]
                    </button>
                  </div>
                </section>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 w-full max-w-5xl text-center pb-8 z-10 relative">
        <a 
          href="https://bolt.host" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors font-mono group"
        >
          <span className="text-primary/50 group-hover:text-primary transition-colors">&gt;</span> 
          See my previous version on Bolt.host
          <span className="inline-block w-2 h-4 bg-primary/50 group-hover:bg-primary animate-pulse ml-1 align-middle"></span>
        </a>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}

export default App;
