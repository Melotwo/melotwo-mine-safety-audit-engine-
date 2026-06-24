import { useState } from "react";
import { Shield, Sparkles, Flame, RefreshCw, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function WashCycleSimulator() {
  const [washCycles, setWashCycles] = useState<number>(35);
  const [isIgnited, setIsIgnited] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Treated FR state calculation
  const getTreatedStatus = (washes: number) => {
    if (washes <= 20) {
      return {
        level: "Fully Secure",
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
        desc: "Surface chemical layer is fully active. Flammability self-extinguishes instantly.",
        safetyPct: 100,
        integrity: "95% Flame Retardancy"
      };
    } else if (washes <= 45) {
      return {
        level: "Degradation Commenced",
        color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
        desc: "Surface polymer is leaching. Longer flame self-extinguishing cycles observed.",
        safetyPct: 75,
        integrity: "70% Flame Retardancy"
      };
    } else if (washes <= 60) {
      return {
        level: "High Safety Deficit",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        desc: "Severe chemical erosion. Fabric will sustain burning pockets under intense flame load.",
        safetyPct: 35,
        integrity: "35% Flame Retardancy - UNSAFE"
      };
    } else {
      return {
        level: "INVISIBLE FATAL LIABILITY",
        color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
        desc: "ALL chemical flame-retardants have washed out. The garment is now basic high-volatile cotton.",
        safetyPct: 0,
        integrity: "0% Flame Retardancy - LIQUIDATION RISK"
      };
    }
  };

  const treated = getTreatedStatus(washCycles);

  const handleIgnite = () => {
    setIsIgnited(true);
    setTimeout(() => {
      // Keep ignition visual for a few seconds
    }, 4000);
  };

  const handleReset = () => {
    setIsIgnited(false);
    setIsResetting(true);
    setTimeout(() => setIsResetting(false), 500);
  };

  return (
    <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 shadow-xl relative overflow-hidden" id="wash-cycle-sim-container">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 font-display">
            <RefreshCw className="w-5 h-5 text-sky-400 animate-spin-slow" />
            Active FR Atomic Laundry Degradation Simulator
          </h3>
          <p className="text-sm text-slate-400 font-sans">
            Differentiate between surface-chemically bonded (Treated) and core-atomic (Inherent) safety wear
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={isIgnited ? handleReset : handleIgnite}
            className={`px-4 py-2 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer border-none ${
              isIgnited 
                ? "bg-[#0f172a] hover:bg-slate-950 text-slate-300 border border-slate-700" 
                : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black shadow-lg shadow-sky-950/45"
            }`}
            id="ignite-trigger"
          >
            {isIgnited ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" /> Reset Matrix
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 animate-pulse" /> Trigger Thermal Fault Exposure
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulator Slider */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 mb-6 font-sans">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Laundering Wash Cycle Lifespan</span>
          <span className="text-sm font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
            {washCycles} Cycles Completed
          </span>
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          value={washCycles}
          onChange={(e) => setWashCycles(Number(e.target.value))}
          disabled={isIgnited}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
          id="wash-cycle-slider"
        />
        
        <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
          <span>0 (Fresh Roll-Out)</span>
          <span>25 (Medium Duty)</span>
          <span>55 (DMRE Retirement Guide)</span>
          <span>100 (Compromised Material)</span>
        </div>
      </div>

      {/* Dual Material Visualizer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fabric A: Treated FR */}
        <div className="bg-slate-950/50 rounded-xl border border-slate-700 p-5 relative flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono">
                  FABRIC CLASSIFICATION A
                </span>
                <h4 className="text-sm font-bold text-slate-200 mt-1">Treated Flame-Retardant Cotton</h4>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded font-bold border ${treated.color}`}>
                {treated.level}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 h-12">
              Coated with temporary organo-phosphorus chemical surface reagents (e.g., Pyrovatex/Proban) that bond on raw cotton fibers.
            </p>

            {/* Interactive Swatch Area */}
            <div className="relative h-44 bg-slate-950 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center mb-4">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
              
              {/* Fiber Representation */}
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Visual Swatch representing the fabric */}
                <motion.div 
                  className="w-32 h-20 rounded-md border shadow-md relative overflow-hidden flex items-center justify-center"
                  style={{
                    backgroundColor: isIgnited 
                      ? (washCycles > 60 ? "#110b0b" : washCycles > 40 ? "#2d1612" : "#3b2c29") 
                      : "#334155",
                    borderColor: isIgnited 
                      ? (washCycles > 60 ? "#dc2626" : "#f97316") 
                      : "#475569"
                  }}
                  animate={isIgnited ? { scale: [1, 0.98, 1.02, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <span className="text-[9px] font-mono text-slate-400 select-none">Treated Swatch</span>
                  
                  {/* Coated Reagents Visual representation (dots on fabric) */}
                  {washCycles < 70 && !isIgnited && (
                    <div className="absolute inset-2 grid grid-cols-6 gap-2 opacity-60">
                      {Array.from({ length: Math.max(0, Math.floor((100 - washCycles) / 6)) }).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-sky-400 animate-pulse" />
                      ))}
                    </div>
                  )}

                  {/* Ignited State Graphic */}
                  <AnimatePresence>
                    {isIgnited && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/40"
                      >
                        {/* CSS Flame effect depending on safety percentage */}
                        {washCycles > 60 ? (
                          // Totally burns
                          <div className="flex flex-col items-center">
                            <Flame className="w-10 h-10 text-rose-500 animate-bounce" />
                            <span className="text-[10px] text-rose-500 font-extrabold animate-pulse uppercase">RAPID CATASTROPHIC BURNING</span>
                          </div>
                        ) : washCycles > 35 ? (
                          // Moderate burning
                          <div className="flex flex-col items-center">
                            <Flame className="w-8 h-8 text-amber-500 animate-pulse" />
                            <span className="text-[9px] text-amber-400 font-bold">SUSTAINED FLAMING</span>
                          </div>
                        ) : (
                          // Normal extinguishes
                          <div className="flex flex-col items-center text-emerald-450 font-sans">
                            <Flame className="w-5 h-5 text-emerald-400 opacity-60" />
                            <span className="text-[9px] font-mono font-bold">Self-Extinguishing</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="mt-3 w-4/5 text-center font-sans">
                  <div className="flex justify-between text-[10px] font-mono text-slate-450 mb-1">
                    <span>Chemical Integrity:</span>
                    <span className={washCycles > 45 ? "text-rose-400 font-bold" : "text-sky-400"}>
                      {100 - washCycles}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        washCycles > 60 ? "bg-rose-500" : washCycles > 35 ? "bg-yellow-500" : "bg-sky-450"
                      }`}
                      style={{ width: `${Math.max(0, 100 - washCycles)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 mt-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${washCycles > 40 ? 'text-rose-400' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-bold text-slate-300">Hazard Profile Assessment:</p>
                <p className="text-[11px] text-slate-450 mt-0.5 leading-relaxed font-sans">
                  {treated.desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fabric B: Inherent FR */}
        <div className="bg-slate-950/50 rounded-xl border border-slate-700 p-5 relative flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] bg-slate-900 text-sky-400 border border-slate-700 px-2 py-0.5 rounded font-mono">
                  S-TIER INDUSTRIAL CLASSIFICATION B
                </span>
                <h4 className="text-sm font-bold text-slate-200 mt-1">Inherent Flame-Resistant Blend</h4>
              </div>
              <span className="text-[10px] px-2 py-1 rounded font-bold border text-emerald-400 bg-emerald-500/10 border-emerald-500/30 font-sans">
                LIFETIME ATOMIC BOND
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 h-12 font-sans">
              Durette / Nomex / Modacrylic molecular chains where thermal inertness is native, never affected by water or laundry compounds.
            </p>

            {/* Swatch Area */}
            <div className="relative h-44 bg-slate-950 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center mb-4">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
              
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Swatch */}
                <motion.div 
                  className="w-32 h-20 rounded-md border border-sky-500/30 shadow-md relative overflow-hidden flex items-center justify-center bg-sky-950/40"
                  animate={isIgnited ? { scale: [1, 1.01, 0.99, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <span className="text-[9px] font-mono text-sky-400 select-none">Inherent Swatch</span>
                  
                  {/* Molecular bond visuals (connected node grid) */}
                  {!isIgnited && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-65">
                      <div className="grid grid-cols-4 gap-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            <div className="w-2 h-[1px] bg-sky-500/40" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ignited State Graphic */}
                  <AnimatePresence>
                    {isIgnited && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80"
                      >
                        <div className="flex flex-col items-center text-emerald-450 text-center px-1 font-sans">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
                          <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wide">
                            Blocks Burn Hazard
                          </span>
                          <span className="text-[8px] text-slate-400 mt-0.5 leading-tight">
                            Atomic structure char-carbonizes to form insulation shield
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="mt-3 w-4/5 text-center font-sans">
                  <div className="flex justify-between text-[10px] font-mono text-slate-450 mb-1">
                    <span>Atomic Integrity:</span>
                    <span className="text-emerald-400 font-bold">100% Perpetual</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-450" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 mt-2">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 shrink-0 text-emerald-450" />
              <div>
                <p className="text-xs font-bold text-slate-300">Atomic Armor Assessment:</p>
                <p className="text-[11px] text-emerald-400 mt-0.5 leading-relaxed font-semibold font-sans">
                  Zero decay. Even under intense arc/fire, the fibers carbonize to swell, creating an insulating thermal barrier preventing the transfer of flash energies to the wearer.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
