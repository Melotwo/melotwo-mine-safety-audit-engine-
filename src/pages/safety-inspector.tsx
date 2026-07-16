import React, { useState } from 'react';
import { MineCompliancePanel } from '../components/MineCompliancePanel';
import { AuditHistoryChart } from '../components/AuditHistoryChart';
import { UserFeedbackWidget } from '../components/UserFeedbackWidget';
import { PromptMetricsDashboard } from '../components/PromptMetricsDashboard';

export interface SafetyInspectorPageProps {
    setPage: (page: 'home' | 'solutions' | 'inspector') => void;
}

export const SafetyInspectorPage: React.FC<SafetyInspectorPageProps> = ({ setPage }) => {
    const [activeTab, setActiveTab] = useState<'compliance' | 'compliance-history' | 'telemetry' | 'feedback'>('compliance');

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-0 py-8 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
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
                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition"
                >
                    ← Back to Home
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-100 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('compliance')}
                    className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition border-b-2 ${
                        activeTab === 'compliance'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Mine Compliance Profiles
                </button>
                <button
                    onClick={() => setActiveTab('compliance-history')}
                    className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition border-b-2 ${
                        activeTab === 'compliance-history'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Compliance History & Analytics
                </button>
                <button
                    onClick={() => setActiveTab('telemetry')}
                    className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition border-b-2 ${
                        activeTab === 'telemetry'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Compliance Telemetry
                </button>
                <button
                    onClick={() => setActiveTab('feedback')}
                    className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition border-b-2 ${
                        activeTab === 'feedback'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Framework Feedback
                </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
                {activeTab === 'compliance' && (
                    <div>
                        <MineCompliancePanel />
                    </div>
                )}

                {activeTab === 'compliance-history' && (
                    <div>
                        <AuditHistoryChart />
                    </div>
                )}

                {activeTab === 'telemetry' && (
                    <div>
                        <PromptMetricsDashboard />
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="max-w-2xl mx-auto">
                        <UserFeedbackWidget />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SafetyInspectorPage;
