export interface MineParams {
  mineName: string;
  miningSector: 'gold' | 'coal' | 'platinum' | 'iron_ore' | 'diamond' | 'copper';
  depthLevel: number; // in meters (0 to 4500m)
  headcount: number; // worker capacity
  environmentHazards: string[]; // e.g. ["Electric Arc", "Thermal/Flash Fire", "Acid Mine Drainage", "Mechanical Crushing", "High Humidity", "Ambient Heat Stress"]
  currentPPE: {
    fabricType: string; // e.g. "D59 Cotton", "Treated FR Cotton", "Inherent FR Aramid", "Generic Poly Cotton"
    fabricWashCycles: number; // e.g. 10, 50, 100
    footwearSoleMaterial: string; // e.g. "Standard PU (Polyurethane)", "Nitrile Rubber", "Dual-density rubber with AMD-resistant treatment"
    footwearSpecification: string; // e.g. "SANS 20345 compliant", "None", "Generic non-spec Steel-toe"
    arcRatingValue: string; // e.g. "No rating", "4 cal/cm2", "8 cal/cm2", "40 cal/cm2"
  }
}

export interface AuditSummary {
  complianceScore: number; // 0 to 100
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  regulatoryFrameworksChecked: string[];
  primaryThreatIdentified: string;
}

export interface RiskAnalysis {
  theVillain: string;
  technicalDeficitReasoning: string;
  potentialFinancialImpact: string;
}

export interface ComplianceActionPlan {
  theVow: string;
  immediateRemediationSteps: string[];
  requiredMaterialSpecifications: {
    fabricTypeRequired: string;
    minimumPerformanceRating: string;
    footwearSpecification: string;
  }
}

export interface VendorMatchingCriteria {
  targetSupplierCategory: string;
  bulkOrderSpecsSummary: string;
}

export interface AuditReportResponse {
  auditSummary: AuditSummary;
  riskAnalysis: RiskAnalysis;
  complianceActionPlan: ComplianceActionPlan;
  vendorMatchingCriteria: VendorMatchingCriteria;
  historyLog?: {
    id: string;
    date: string;
    mineName: string;
    complianceScore: number;
    riskLevel: string;
    summary: string;
  };
  riskHeatmap?: {
    likelihood: string;
    consequence: string;
    score: string;
    zone: string;
    mitigation: string;
  };
  pdfExport?: {
    title: string;
    subtitle: string;
    sections: {
      header: string;
      content: string[];
    }[];
  };
  dailyShiftBriefing?: {
    briefingTitle: string;
    mineType: string;
    hazardsOverview: string;
    gearChecklist: string[];
    toolboxMessage: string;
  };
  dailyDstiBriefing?: {
    briefingTitle: string;
    siteName: string;
    constructionSector: string;
    hazardsOverview: string;
    toolboxMessage: string;
    heightsChecklist: string[];
    scaffoldChecklist: string[];
    electricalChecklist: string[];
  };
  _fallback?: boolean;
}

export interface SANSStandard {
  code: string;
  title: string;
  scope: string;
  relevance: string;
  auditCheck: string;
}
