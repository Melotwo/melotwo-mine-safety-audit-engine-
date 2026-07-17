import React from 'react';
import { MineCompliancePanel } from '../components/MineCompliancePanel';
import { AuditHistoryChart } from '../components/AuditHistoryChart';
import { UserFeedbackWidget } from '../components/UserFeedbackWidget';
import { PromptMetricsDashboard } from '../components/PromptMetricsDashboard';

interface SafetyInspectorPageProps {
  setPage: (page: 'home' | 'solutions' | 'inspector') => void;
}

export const SafetyInspectorPage: React.FC<SafetyInspectorPageProps> = ({ setPage }) => {
  return (
    <div className="w-full px-4 md:px-0 max-w-7xl mx-auto pt-6 pb-24 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Deep Auditing Terminal
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Real-time SANS compliance dashboards, historical trend analysis, and risk mitigation tracking for South African mining & industrial operations.
          </p>
        </div>
        <button
          onClick={() => setPage('home')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition"
        >
          ← Back to Home
        </button>
      </div>

      {/* Mine Compliance Panel */}
      <section>
        <MineCompliancePanel />
      </section>

      {/* Audit History & Analytics */}
      <section>
        <AuditHistoryChart />
      </section>

      {/* Compliance Metrics Dashboard */}
      <section>
        <PromptMetricsDashboard />
      </section>

      {/* User Feedback Widget */}
      <section className="mb-8">
        <UserFeedbackWidget />
      </section>
    </div>
  );
};
