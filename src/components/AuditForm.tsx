import React, { useState, useEffect } from "react";
import { MineParams } from "../types";
import { MINE_PRESETS, MINE_SECTOR_LABELS } from "../data";
import { Flame, Beaker, Users, ShieldAlert, Sliders, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";

interface AuditFormProps {
  onRunAudit: (params: MineParams, dailyShiftCheck?: boolean) => void;
  isLoading: boolean;
}

export function AuditForm({ onRunAudit, isLoading }: AuditFormProps) {
  // Setup standard state mimicking the MineParams structure
  const [mineName, setMineName] = useState("Vaal River Gold Reef Shaft 2");
  const [sector, setSector] = useState<MineParams['miningSector']>("gold");
  const [depth, setDepth] = useState<number>(1800);
  const [headcount, setHeadcount] = useState<number>(1200);
  const [selectedHazards, setSelectedHazards] = useState<string[]>(["Acid Mine Drainage", "High Humidity", "Ambient Heat Stress"]);
  
  const [fabricType, setFabricType] = useState("D59 Untreated Cotton Flame-Retardant (Traditional)");
  const [washCycles, setWashCycles] = useState<number>(45);
  const [footwearSole, setFootwearSole] = useState("Standard PU (Polyurethane) Sole");
  const [footwearSpec, setFootwearSpec] = useState("None / Generic Steel-toe");
  const [arcValue, setArcValue] = useState("No rating");

  // Multi-select handler
  const toggleHazard = (hazard: string) => {
    if (selectedHazards.includes(hazard)) {
      setSelectedHazards(selectedHazards.filter(h => h !== hazard));
    } else {
      setSelectedHazards([...selectedHazards, hazard]);
    }
  };

  // Preset Applicator
  const loadPreset = (presetIndex: number) => {
    const preset = MINE_PRESETS[presetIndex];
    if (!preset) return;
    setMineName(preset.data.mineName);
    setSector(preset.data.miningSector);
    setDepth(preset.data.depthLevel);
    setHeadcount(preset.data.headcount);
    setSelectedHazards(preset.data.environmentHazards);
    setFabricType(preset.data.currentPPE.fabricType);
    setWashCycles(preset.data.currentPPE.fabricWashCycles);
    setFootwearSole(preset.data.currentPPE.footwearSoleMaterial);
    setFootwearSpec(preset.data.currentPPE.footwearSpecification);
    setArcValue(preset.data.currentPPE.arcRatingValue);
  };

  // Automatically update suggested environmental hazards when changing Sector
  useEffect(() => {
    const meta = MINE_SECTOR_LABELS[sector];
    if (meta) {
      setSelectedHazards(meta.typicalHazards);
    }
  }, [sector]);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunAudit({
      mineName,
      miningSector: sector,
      depthLevel: depth,
      headcount,
      environmentHazards: selectedHazards,
      currentPPE: {
        fabricType,
        fabricWashCycles: washCycles,
        footwearSoleMaterial: footwearSole,
        footwearSpecification: footwearSpec,
        arcRatingValue: arcValue
      }
    });
  };

  const handleDailyShiftCheck = (e: React.MouseEvent) => {
    e.preventDefault();
    onRunAudit({
      mineName,
      miningSector: sector,
      depthLevel: depth,
      headcount,
      environmentHazards: selectedHazards,
      currentPPE: {
        fabricType,
        fabricWashCycles: washCycles,
        footwearSoleMaterial: footwearSole,
        footwearSpecification: footwearSpec,
        arcRatingValue: arcValue
      }
    }, true);
  };

  // Auto-warning calculator for instant UX feedback
  const getInstantWarnings = () => {
    const warnings: string[] = [];
    if (sector === "coal" && fabricType.includes("Poly")) {
      warnings.push("CRITICAL SHIELDS FLINK: Coal Mine regulations prohibit synthetic melt fibers (polyester) due to static electrical ignition risks.");
    }
    if (selectedHazards.includes("Acid Mine Drainage") && footwearSole.includes("PU")) {
      warnings.push("SOLE DEGRADATION WARNING: Polyurethane soles disintegrate rapidly under acidic mining waters. Nitrile vulcanized material is required.");
    }
    if (fabricType.includes("Treated") && washCycles > 50) {
      warnings.push("INVISIBLE FR LEACHING GAPS: Treated garment has exceeded 50 washes. Normal alkaline friction renders surface flameproofings inert.");
    }
    if (selectedHazards.includes("Electric Arc") && arcValue === "No rating") {
      warnings.push("ARC BURN INTENSITY THREAT: Substation switching zones mandate certified electrical arc clothing matching SANS 724 (ATPV >= 8 cal/cm²).");
    }
    return warnings;
  };

  const instantWarnings = getInstantWarnings();

  return (
    <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 shadow-xl relative" id="audit-form-container">
      {/* Top Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 font-display">
            <Sliders className="w-5 h-5 text-sky-400" />
            Mine Profile & Safety Inventory Audit Input
          </h3>
          <p className="text-sm text-slate-400">Configure subterranean environmental elements and current active workwear gear</p>
        </div>

        {/* Preset Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block md:inline">Load Pre-Configured Mines Profile:</span>
          <div className="flex flex-wrap gap-1">
            {MINE_PRESETS.map((preset, idx) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => loadPreset(idx)}
                className="text-[10px] bg-slate-900 hover:bg-slate-950 border border-slate-700 text-slate-300 hover:text-slate-100 px-2.5 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
                id={`preset-btn-${idx}`}
              >
                {preset.name.split(" ")[0]} ({preset.data.miningSector.toUpperCase()})
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Column 1: Environmental Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-1 flex items-center gap-1.5 font-display">
              <Beaker className="w-3.5 h-3.5 text-sky-400" /> 1. Subterranean Environment Scope
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Mine / Joint-Venture Operating Name</label>
              <input
                type="text"
                required
                value={mineName}
                onChange={(e) => setMineName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                placeholder="e.g. Vaal River Shaft 4"
                id="mine-name-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">South African Mining Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as MineParams['miningSector'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer"
                  id="mining-sector-select"
                >
                  <option value="gold">Gold Reef Operations</option>
                  <option value="coal">Coal mining seams</option>
                  <option value="platinum">Platinum Smelting</option>
                  <option value="iron_ore">Iron Ore opencast</option>
                  <option value="diamond">Kimberlite Diamond pipes</option>
                  <option value="copper">Copper pits / shafts</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Prov: {MINE_SECTOR_LABELS[sector]?.province}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Headcount (Shift Cohort size)</label>
                <div className="relative">
                  <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    required
                    value={headcount}
                    onChange={(e) => setHeadcount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                    id="headcount-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                <span>Working Chamber Depth Floor Level</span>
                <span className="font-mono text-sky-400 font-bold">{depth} meters underground</span>
              </div>
              <input
                type="range"
                min="0"
                max="4500"
                step="50"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-400"
                id="depth-slider"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Surface / Plant (0m)</span>
                <span>Mild underground (1,500m)</span>
                <span>Ultra Deep Reef (4,050m+)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Operational Hazards Actively Encountered</label>
              <div className="grid grid-cols-2 gap-2">
                {["Acid Mine Drainage", "Thermal/Flash Fire", "Electric Arc", "Mechanical Crushing", "High Humidity", "Ambient Heat Stress"].map((hz) => {
                  const isChecked = selectedHazards.includes(hz);
                  return (
                    <button
                      key={hz}
                      type="button"
                      onClick={() => toggleHazard(hz)}
                      className={`text-left p-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between border cursor-pointer ${
                        isChecked 
                          ? "bg-sky-500/10 border-sky-500/35 text-slate-100 font-bold" 
                          : "bg-slate-950/50 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-950"
                      }`}
                      id={`hazard-checkbox-${hz.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <span className="truncate">{hz}</span>
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${
                        isChecked ? "bg-sky-500 border-sky-500 text-slate-950" : "border-slate-800"
                      }`}>
                        {isChecked && "✓"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Current Inventory / Safety Spec */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-1 flex items-center gap-1.5 font-display">
              <Flame className="w-3.5 h-3.5 text-sky-400" /> 2. Current Procurement Wear Configuration
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Conti Garment Fabric Material Composition</label>
              <select
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer text-xs sm:text-sm"
                id="fabric-type-select"
              >
                <option value="D59 Untreated Cotton Flame-Retardant (Traditional)">D59 Cotton Flame-Retardant (Traditional / Raw)</option>
                <option value="Treated Flame-Retardant Cotton (Pyrovatex Coating)">Treated FR Cotton (Pyrovatex Chemical Impregnated)</option>
                <option value="Polyester-Cotton General Conti Suits (65/35)">Polyester-Cotton Blend Conti Suits (65% Poly, 35% Cotton)</option>
                <option value="Inherent FR Modacrylic / Aramid blended fiber">Inherent FR Modacrylic-Kevlar blend (Aramid / Atomic level)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Industrial Laundry wash counts</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={washCycles}
                  onChange={(e) => setWashCycles(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/50 text-xs sm:text-sm"
                  id="wash-cycles-input"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Typical wash count prior to retirement</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Garment Electric Arc Rating</label>
                <select
                  value={arcValue}
                  onChange={(e) => setArcValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer text-xs sm:text-sm"
                  id="arc-rating-select"
                >
                  <option value="No rating">Unrated / General Workwear</option>
                  <option value="4 cal/cm² (HRC 1)">4 cal/cm² (HRC 1)</option>
                  <option value="8 cal/cm² (HRC 2)">8 cal/cm² (HRC 2)</option>
                  <option value="40 cal/cm² (HRC 4)">40 cal/cm² (HRC 4)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Safety Footwear Soling Material</label>
              <select
                value={footwearSole}
                onChange={(e) => setFootwearSole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer text-xs sm:text-sm"
                id="footwear-sole-select"
              >
                <option value="Standard PU (Polyurethane) Sole">Standard Single-Density PU (Polyurethane) Sole</option>
                <option value="Dual-density PU/PU Rubber Sole">Dual-density PU/PU Rubber Sole</option>
                <option value="Nitrile Rubber Sole">Standard Vulcanized Nitrile Rubber Sole</option>
                <option value="Dual-density rubber with AMD-resistant treatment">Premium Dual-density Rubber sole (AMD high-spec)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Safety Footwear National SANS Certified Code</label>
              <select
                value={footwearSpec}
                onChange={(e) => setFootwearSpec(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer text-xs sm:text-sm"
                id="footwear-spec-select"
              >
                <option value="None / Generic Steel-toe">None / Standard Steel-toe shoes (non-SANS certified)</option>
                <option value="SANS 20345 compliant">SANS 20345 compliant (Toe Protection 200 Joules)</option>
                <option value="SANS 20345 Class I S3 rating">SANS 20345 Class I S3 rating (Anti-static, water-resistant, puncture-proof)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Real-time warnings (if any) */}
        {instantWarnings.length > 0 && (
          <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 space-y-2">
            <h5 className="text-xs font-bold text-amber-550 flex items-center gap-1.5 uppercase font-display">
              <ShieldAlert className="w-4 h-4 animate-bounce" /> Live Sensory Gaps Warnings Detected
            </h5>
            <ul className="list-disc pl-4 space-y-1">
              {instantWarnings.map((warning, i) => (
                <li key={i} className="text-[11px] text-slate-350 leading-relaxed font-mono">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bottom buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={handleDailyShiftCheck}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 font-sans"
            id="daily-shift-briefing-btn"
          >
            Daily Toolbox Shift Briefing ⚡
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-lg font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              isLoading
                ? "bg-slate-800 text-slate-400 cursor-wait border border-slate-700"
                : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black shadow-lg shadow-sky-950/45 transform hover:-translate-y-0.5 active:translate-y-0"
            }`}
            id="audit-submit-btn"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4.5 w-4.5 text-slate-450" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                SANS Compliance Audit
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
