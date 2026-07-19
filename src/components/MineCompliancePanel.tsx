import React, { useState, useEffect, useMemo } from 'react';
import { CountUp } from './CountUp';
import { trackGA4Event } from '../App';

// --- Mine Compliance Profile Interfaces & Mock Data ---
export interface MineProfile {
  id: string;
  name: string;
  type: string;
  location: string;
  complianceScore: number;
  activeAuditsCount: number;
  safetyRating: string;
  stats: {
    airQuality: number; // %
    waterRecycling: number; // %
    noiseLevel: number; // dBA
    ppeAdherence: number; // %
  };
  audits: { id: string; date: string; category: string; score: number; status: 'Passed' | 'Action Required' }[];
}

export const MINE_PROFILES_BASELINE: MineProfile[] = [
  {
    id: 'witwatersrand-gold',
    name: 'Witwatersrand Gold Deep Reef',
    type: 'Gold Mine (Deep Reef Reef)',
    location: 'Gauteng, South Africa',
    complianceScore: 92,
    activeAuditsCount: 14,
    safetyRating: 'A+',
    stats: {
      airQuality: 94,
      waterRecycling: 88,
      noiseLevel: 82,
      ppeAdherence: 98,
    },
    audits: [
      { id: 'AUD-W-103', date: '2026-06-28', category: 'SANS 10108: Hazardous Areas', score: 89, status: 'Passed' },
      { id: 'AUD-W-102', date: '2026-06-15', category: 'SANS 10330: HACCP / Canteen', score: 95, status: 'Passed' },
      { id: 'AUD-W-101', date: '2026-05-10', category: 'SANS 10142: Electrical', score: 91, status: 'Passed' },
      { id: 'AUD-W-100', date: '2026-04-02', category: 'SANS 10049: Hygiene', score: 90, status: 'Passed' },
    ]
  },
  {
    id: 'mpumalanga-coal',
    name: 'Mpumalanga Coal Open-Cast',
    type: 'Coal Mine (Open-Cast Operations)',
    location: 'Mpumalanga, South Africa',
    complianceScore: 84,
    activeAuditsCount: 8,
    safetyRating: 'B',
    stats: {
      airQuality: 78,
      waterRecycling: 92,
      noiseLevel: 89,
      ppeAdherence: 85,
    },
    audits: [
      { id: 'AUD-M-203', date: '2026-06-18', category: 'SANS 10108: Hazardous Areas', score: 59, status: 'Action Required' },
      { id: 'AUD-M-202', date: '2026-06-20', category: 'SANS 10142: Electrical', score: 82, status: 'Action Required' },
      { id: 'AUD-M-201', date: '2026-05-15', category: 'SANS 10330: HACCP / Canteen', score: 88, status: 'Passed' },
      { id: 'AUD-M-200', date: '2026-03-22', category: 'SANS 10049: Hygiene', score: 81, status: 'Action Required' },
    ]
  },
  {
    id: 'western-cape-rare-earth',
    name: 'Western Cape Rare Earths',
    type: 'Rare Earth Elements (Surface Excavation)',
    location: 'Western Cape, South Africa',
    complianceScore: 96,
    activeAuditsCount: 6,
    safetyRating: 'A',
    stats: {
      airQuality: 98,
      waterRecycling: 95,
      noiseLevel: 72,
      ppeAdherence: 96,
    },
    audits: [
      { id: 'AUD-R-303', date: '2026-06-29', category: 'SANS 10108: Hazardous Areas', score: 98, status: 'Passed' },
      { id: 'AUD-R-302', date: '2026-06-25', category: 'SANS 10049: Hygiene', score: 97, status: 'Passed' },
      { id: 'AUD-R-301', date: '2026-05-18', category: 'SANS 10330: HACCP / Canteen', score: 95, status: 'Passed' },
      { id: 'AUD-R-300', date: '2026-04-11', category: 'SANS 10142: Electrical', score: 96, status: 'Passed' },
    ]
  }
];

// --- Helper: Get deterministic trend data for Sparklines ---
const getTrendData = (currentVal: number, metricKey: string, profileId: string): number[] => {
  let hash = 0;
  const str = profileId + metricKey;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const offset1 = ((Math.abs(hash) % 7) - 3); // -3 to +3
  const offset2 = ((Math.abs(hash >> 3) % 7) - 3); // -3 to +3
  const isNoise = metricKey === 'noiseLevel';
  const limit = isNoise ? 120 : 100;
  const minLimit = isNoise ? 40 : 50;

  const m2 = Math.max(minLimit, Math.min(limit, currentVal + offset1));
  const m1 = Math.max(minLimit, Math.min(limit, currentVal + offset2));
  const m3 = currentVal;
  return [m2, m1, m3];
};

// --- Component: Sparkline Trend Visualizer ---
const Sparkline: React.FC<{
  data: number[];
  color: string;
  isNoise?: boolean;
}> = ({ data, color, isNoise = false }) => {
  const width = 80;
  const height = 18;
  const padding = 2;
  const minVal = isNoise ? 60 : 60;
  const maxVal = isNoise ? 100 : 100;

  const getX = (index: number) => {
    return padding + (index * (width - padding * 2)) / (data.length - 1);
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    const normalized = (val - minVal) / range;
    return height - padding - normalized * (height - padding * 2);
  };

  const points = data.map((val, idx) => ({
    x: getX(idx),
    y: getY(val),
    val
  }));

  const linePath = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2"
            fill={color}
            stroke="#ffffff"
            strokeWidth="0.75"
            className="transition-all duration-300"
          />
        ))}
      </svg>
      <span className="text-[9px] font-bold font-mono text-gray-600">
        {data[data.length - 1]}{isNoise ? '' : '%'}
      </span>
    </div>
  );
};

// --- Component: ProfileAuditTrendChart ---
interface ProfileAuditTrendChartProps {
  audits: {
    id: string;
    date: string;
    category: string;
    score: number;
    status: string;
  }[];
}

const ProfileAuditTrendChart: React.FC<ProfileAuditTrendChartProps> = ({ audits }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const sortedAudits = useMemo(() => {
    return [...audits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [audits]);

  const width = 500;
  const height = 150;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const points = useMemo(() => {
    if (sortedAudits.length === 0) return [];
    
    const scores = sortedAudits.map(a => a.score);
    const minScore = Math.max(0, Math.min(...scores) - 10);
    const maxScore = 100;
    const scoreRange = maxScore - minScore || 1;

    const stepX = (width - paddingLeft - paddingRight) / Math.max(1, sortedAudits.length - 1);

    return sortedAudits.map((audit, i) => {
      const x = paddingLeft + i * stepX;
      const y = height - paddingBottom - ((audit.score - minScore) / scoreRange) * (height - paddingTop - paddingBottom);
      return {
        x,
        y,
        score: audit.score,
        date: audit.date,
        id: audit.id,
        category: audit.category
      };
    });
  }, [sortedAudits]);

  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const basePath = points.reduce((path, p) => `${path} L ${p.x} ${p.y}`, `M ${first.x} ${height - paddingBottom}`);
    return `${basePath} L ${last.x} ${height - paddingBottom} Z`;
  }, [points]);

  const gradientId = useMemo(() => `profile-grad-${Math.floor(Math.random() * 1000000)}`, []);

  return (
    <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-2 relative">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">SANS Compliance Progression Trend</span>
        {hoveredIdx !== null && points[hoveredIdx] && (
          <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            {points[hoveredIdx].id}: {points[hoveredIdx].score}%
          </span>
        )}
      </div>
      <div className="w-full h-[120px]">
        {sortedAudits.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            No audit history available
          </div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Y axis horizontal guides */}
            {[0, 0.5, 1].map((ratio, i) => {
              const y = paddingTop + ratio * (height - paddingTop - paddingBottom);
              const scores = sortedAudits.map(a => a.score);
              const minScore = Math.max(0, Math.min(...scores) - 10);
              const maxScore = 100;
              const scoreVal = Math.round(maxScore - ratio * (maxScore - minScore));
              return (
                <g key={i} className="opacity-20">
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke="#475569" 
                    strokeWidth={1} 
                    strokeDasharray="3 3" 
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={y + 3} 
                    fill="#475569" 
                    fontSize={9} 
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {scoreVal}%
                  </text>
                </g>
              );
            })}

            {/* X axis lines and labels */}
            {points.map((p, i) => (
              <g key={i}>
                <line
                  x1={p.x}
                  y1={paddingTop}
                  x2={p.x}
                  y2={height - paddingBottom}
                  stroke="#475569"
                  strokeWidth={0.5}
                  strokeDasharray="2 2"
                  className="opacity-10"
                />
                <text
                  x={p.x}
                  y={height - 10}
                  fill="#64748b"
                  fontSize={8}
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="opacity-85"
                >
                  {p.date.substring(5)}
                </text>
              </g>
            ))}

            {/* Area under path */}
            <path d={areaPath} fill={`url(#${gradientId})`} className="transition-all duration-300" />

            {/* Line Path */}
            <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

            {/* Data point circles */}
            {points.map((p, i) => (
              <g
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIdx === i ? 6 : 4}
                  fill={p.score >= 80 ? '#10b981' : '#ef4444'}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  className="transition-all duration-150"
                />
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
};

// --- Component: MineCompliancePanel ---
export const MineCompliancePanel: React.FC = () => {
  const [profiles, setProfiles] = useState<MineProfile[]>(() => {
    const saved = localStorage.getItem('melotwo_mine_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return MINE_PROFILES_BASELINE;
  });

  const [activeProfile, setActiveProfile] = useState<MineProfile>(() => {
    return profiles[0] || MINE_PROFILES_BASELINE[0];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMineName, setNewMineName] = useState('');
  const [newMineType, setNewMineType] = useState('Chrome & Platinum Operation');
  const [newMineLocation, setNewMineLocation] = useState('Mokopane, South Africa');

  useEffect(() => {
    localStorage.setItem('melotwo_mine_profiles', JSON.stringify(profiles));
  }, [profiles]);

  const selectProfile = (profile: MineProfile) => {
    setActiveProfile(profile);
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMineName.trim()) return;

    const newId = `mine-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Generate organic metrics
    const complianceScore = Math.floor(Math.random() * 15) + 82; // 82 to 97%
    const safetyRating = complianceScore >= 95 ? 'A+' : complianceScore >= 90 ? 'A' : complianceScore >= 85 ? 'B+' : 'B';
    
    const newProfile: MineProfile = {
      id: newId,
      name: newMineName.trim(),
      type: newMineType.trim(),
      location: newMineLocation.trim(),
      complianceScore,
      activeAuditsCount: 3,
      safetyRating,
      stats: {
        airQuality: Math.floor(Math.random() * 15) + 80,
        waterRecycling: Math.floor(Math.random() * 15) + 80,
        noiseLevel: Math.floor(Math.random() * 15) + 75,
        ppeAdherence: Math.floor(Math.random() * 8) + 90,
      },
      audits: [
        { id: `AUD-${newId.substring(5, 8).toUpperCase()}-101`, date: new Date().toISOString().split('T')[0], category: 'SANS 10330: HACCP / Canteen', score: complianceScore, status: 'Passed' },
        { id: `AUD-${newId.substring(5, 8).toUpperCase()}-102`, date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0], category: 'SANS 10142: Electrical', score: Math.max(70, complianceScore - 4), status: complianceScore - 4 >= 80 ? 'Passed' : 'Action Required' },
        { id: `AUD-${newId.substring(5, 8).toUpperCase()}-103`, date: new Date(Date.now() - 86400000 * 12).toISOString().split('T')[0], category: 'SANS 10049: Hygiene', score: Math.max(70, complianceScore - 2), status: 'Passed' },
      ]
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    setActiveProfile(newProfile);
    setShowAddForm(false);
    setNewMineName('');
    setNewMineType('Chrome & Platinum Operation');
    setNewMineLocation('Mokopane, South Africa');
    
    trackGA4Event('ai_generation_success', {
      action: 'add_custom_mine_profile',
      mine_name: newProfile.name,
      mine_type: newProfile.type,
      location: newProfile.location,
      compliance_score: newProfile.complianceScore
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8 animate-fade-in-up">
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Industrial Operations</span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1">Mine Compliance Profiles</h2>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => selectProfile(profile)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                activeProfile.id === profile.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {profile.name}
            </button>
          ))}
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center shadow-sm cursor-pointer"
          >
            ＋ Add Custom Profile
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProfile} className="p-8 bg-slate-50 border-b border-gray-100 animate-fade-in-up">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                Register Custom Mine Profile (Mokopane & Regional Operations)
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 font-mono">Mine / Operation Name</label>
                <input
                  type="text"
                  required
                  value={newMineName}
                  onChange={(e) => setNewMineName(e.target.value)}
                  placeholder="e.g. Ivanplats Platinum, Mokopane Chrome"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 font-mono">Operation Type</label>
                <input
                  type="text"
                  required
                  value={newMineType}
                  onChange={(e) => setNewMineType(e.target.value)}
                  placeholder="e.g. Platinum & Chrome, Gold Deep Reef"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 font-mono">Geographic Location</label>
                <input
                  type="text"
                  required
                  value={newMineLocation}
                  onChange={(e) => setNewMineLocation(e.target.value)}
                  placeholder="e.g. Mokopane, South Africa"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md cursor-pointer"
              >
                Save & Select Profile
              </button>
            </div>
          </div>
        </form>
      )}
      
      <div className="p-8 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activeProfile.type}</span>
              <span className="px-3 py-1 text-[10px] font-black bg-indigo-50 text-indigo-700 rounded-full">{activeProfile.safetyRating} Safety Grade</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{activeProfile.name}</h3>
            <p className="text-xs text-gray-500 mb-6">{activeProfile.location}</p>
          </div>
          <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-lg">
            <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase block mb-1">Overall Compliance</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black"><CountUp value={activeProfile.complianceScore} />%</span>
              <span className="text-xs text-green-400 font-medium">↑ Verified</span>
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${activeProfile.complianceScore}%` }}></div>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-6">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">SANS Operational Metrics</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Air Quality Card */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                  <span>Environmental Air Quality</span>
                  <span className="font-bold text-gray-900">{activeProfile.stats.airQuality}%</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: `${activeProfile.stats.airQuality}%` }}></div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-200/40 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono font-medium">3M Trend</span>
                <Sparkline 
                  data={getTrendData(activeProfile.stats.airQuality, 'airQuality', activeProfile.id)} 
                  color="#14b8a6" 
                />
              </div>
            </div>

            {/* PPE Adherence Card */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                  <span>PPE Adherence Rate</span>
                  <span className="font-bold text-gray-900">{activeProfile.stats.ppeAdherence}%</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${activeProfile.stats.ppeAdherence}%` }}></div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-200/40 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono font-medium">3M Trend</span>
                <Sparkline 
                  data={getTrendData(activeProfile.stats.ppeAdherence, 'ppeAdherence', activeProfile.id)} 
                  color="#6366f1" 
                />
              </div>
            </div>

            {/* Water Recycling Card */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                  <span>Water Recycling Index</span>
                  <span className="font-bold text-gray-900">{activeProfile.stats.waterRecycling}%</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${activeProfile.stats.waterRecycling}%` }}></div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-200/40 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono font-medium">3M Trend</span>
                <Sparkline 
                  data={getTrendData(activeProfile.stats.waterRecycling, 'waterRecycling', activeProfile.id)} 
                  color="#3b82f6" 
                />
              </div>
            </div>

            {/* Noise Level Card */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                  <span>Noise Level Regulation</span>
                  <span className="font-bold text-gray-900">{activeProfile.stats.noiseLevel} dBA</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (activeProfile.stats.noiseLevel / 90) * 100)}%` }}></div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-200/40 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono font-medium">3M Trend</span>
                <Sparkline 
                  data={getTrendData(activeProfile.stats.noiseLevel, 'noiseLevel', activeProfile.id)} 
                  color="#f59e0b" 
                  isNoise={true}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Table section */}
              <div className="lg:col-span-7">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Active SANS Audits</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="pb-2">Audit ID</th>
                        <th className="pb-2">Standard Category</th>
                        <th className="pb-2">Audit Date</th>
                        <th className="pb-2 text-right">Score</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-600">
                      {activeProfile.audits.map((audit) => (
                        <tr key={audit.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-mono font-semibold text-gray-900">{audit.id}</td>
                          <td className="py-2.5">{audit.category}</td>
                          <td className="py-2.5 text-gray-500">{audit.date}</td>
                          <td className="py-2.5 text-right font-bold text-gray-900">{audit.score}%</td>
                          <td className="py-2.5 text-right">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              audit.status === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {audit.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chart section */}
              <div className="lg:col-span-5">
                <ProfileAuditTrendChart audits={activeProfile.audits} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
