import { MineParams, SANSStandard } from "./types";

export const MINE_SECTOR_LABELS: Record<MineParams['miningSector'], { label: string; province: string; typicalHazards: string[] }> = {
  gold: {
    label: "Witwatersrand Deep-Shaft Gold Reefs",
    province: "Gauteng / Free State",
    typicalHazards: ["Acid Mine Drainage", "Thermal/Flash Fire", "Ambient Heat Stress", "High Humidity", "Mechanical Crushing"]
  },
  coal: {
    label: "Mpumalanga Combustible Coal Seams",
    province: "Mpumalanga",
    typicalHazards: ["Thermal/Flash Fire", "Combustible Dust (Coal)", "Mechanical Crushing", "High Humidity"]
  },
  platinum: {
    label: "Merensky Bushveld Igneous Platinum Smelters",
    province: "North West / Limpopo",
    typicalHazards: ["Electric Arc", "Thermal/Flash Fire", "Ambient Heat Stress", "Mechanical Crushing"]
  },
  iron_ore: {
    label: "Kumba Open-Cast Iron Ore Pit",
    province: "Northern Cape",
    typicalHazards: ["Mechanical Crushing", "Ambient Heat Stress"]
  },
  diamond: {
    label: "Kimberlite Deep Pipe Diamond Pit",
    province: "Northern Cape / Limpopo",
    typicalHazards: ["Mechanical Crushing", "High Humidity", "Acid Mine Drainage"]
  },
  copper: {
    label: "Phalaborwa Massive Open Pit & Underground Copper",
    province: "Limpopo",
    typicalHazards: ["Acid Mine Drainage", "Ambient Heat Stress", "Mechanical Crushing"]
  }
};

export const MINE_PRESETS: { name: string; description: string; data: MineParams }[] = [
  {
    name: "Witwatersrand Ultra-Deep Gold Shaft 4",
    description: "Deep subterranean (2,400m) with high sulfuric acidity water and 90%+ humidity face temperatures.",
    data: {
      mineName: "Witwatersrand Deep Shaft Reef 4",
      miningSector: "gold",
      depthLevel: 2400,
      headcount: 1450,
      environmentHazards: ["Acid Mine Drainage", "Mechanical Crushing", "High Humidity", "Ambient Heat Stress"],
      currentPPE: {
        fabricType: "D59 Untreated Cotton Flame-Retardant (Traditional)",
        fabricWashCycles: 0,
        footwearSoleMaterial: "Standard PU (Polyurethane) Sole",
        footwearSpecification: "None / Generic Steel-toe",
        arcRatingValue: "No rating"
      }
    }
  },
  {
    name: "Mpumalanga Coal Blast Shaft Section B",
    description: "Underground coal face dealing with severe combustible methane pockets and potential flash fire exposures.",
    data: {
      mineName: "Mpumalanga Coal Blast B",
      miningSector: "coal",
      depthLevel: 310,
      headcount: 850,
      environmentHazards: ["Thermal/Flash Fire", "High Humidity", "Mechanical Crushing"],
      currentPPE: {
        fabricType: "Treated Flame-Retardant Cotton (Pyrovatex Coating)",
        fabricWashCycles: 74, // Severely degraded past safe usage!
        footwearSoleMaterial: "Nitrile Rubber Sole",
        footwearSpecification: "SANS 20345 compliant",
        arcRatingValue: "No rating"
      }
    }
  },
  {
    name: "Rustenburg Platinum Arc Smelter Substation",
    description: "High voltage electrical switching control room & feed smelter terminal with electrical fault threat.",
    data: {
      mineName: "Rustenburg Platinum Smelter Fault Area",
      miningSector: "platinum",
      depthLevel: 0, // Surface
      headcount: 120,
      environmentHazards: ["Electric Arc", "Thermal/Flash Fire", "Ambient Heat Stress"],
      currentPPE: {
        fabricType: "Polyester-Cotton General Conti Suits (65/35)",
        fabricWashCycles: 15,
        footwearSoleMaterial: "Nitrile Rubber Sole",
        footwearSpecification: "SANS 20345 compliant",
        arcRatingValue: "No rating"
      }
    }
  },
  {
    name: "Kumba Open Pit Heavy Mech Fleet",
    description: "Extreme Northern Cape ambient heat waves (up to 44°C) with crushing hazards from earthmovers.",
    data: {
      mineName: "Kumba Pit Fleet Area",
      miningSector: "iron_ore",
      depthLevel: 0,
      headcount: 620,
      environmentHazards: ["Mechanical Crushing", "Ambient Heat Stress"],
      currentPPE: {
        fabricType: "D59 Untreated Cotton Flame-Retardant (Traditional)",
        fabricWashCycles: 30,
        footwearSoleMaterial: "Standard PU (Polyurethane) Sole",
        footwearSpecification: "SANS 20345 compliant",
        arcRatingValue: "No rating"
      }
    }
  }
];

export const SANS_STANDARDS: SANSStandard[] = [
  {
    code: "SANS 724:2018",
    title: "Personal Protective Equipment - Arc Flash Protection",
    scope: "Specifies raw materials and garments worn by personnel exposed to the electrical risks associated with arc-flash explosions.",
    relevance: "Mandatory for heavy mine switchgear operators or plant electricians. Under SANS 724, garments are classified into clear ATPV ranges. Fabric must not melt.",
    auditCheck: "Verifies if arc-rated garments are in use and check skin fusion risks. Polyester/synthetic fabrics are strictly banned."
  },
  {
    code: "SANS 20345:2014",
    title: "Personal Protective Equipment - Safety Footwear",
    scope: "Defines international testing and protection guidelines for protective safety boots on South African industrial faces (toe cap impact >= 200J).",
    relevance: "Underground deep shafts have constant presence of Acid Mine Drainage (AMD). Acid rapidly hydrolyzes cheap PU soles, whereas vulcanized Nitrile rubber resists pH < 2 environments.",
    auditCheck: "Cross-checks boots records for sole material. Flags PU rubber soles for acidic environments."
  },
  {
    code: "SANS 434:2018",
    title: "General Protective Clothing (Conti Suits)",
    scope: "Prescribes structural patterns, sewing thread density, bar tack counts, dimension guidelines for iconic South African two-piece protective conti suits.",
    relevance: "Establishes standard sizes, pocket requirements, and mandatory reflective tape width (50mm premium flame-retardant retroreflective tapes).",
    auditCheck: "Ensures structural strength of the garment, triple-needle seam requirements, and stress point reinforcement."
  },
  {
    code: "SANS 1423-1:1987",
    title: "Flame-retardant industrial garments - Textile Performance",
    scope: "Establishes physical flaming rate metrics, self-extinguishing duration bounds (char length <= 100mm), and wash durability requirements.",
    relevance: "Differentiates between Treated FR Cotton (leaches chemical finish in alkaline laundries) and inherent fibers.",
    auditCheck: "Audits wash count statistics to assess active safety factor decay across the inventory."
  },
  {
    code: "SANS 10119",
    title: "Reduction of Explosive & Ignition Risks (Coal Mines)",
    scope: "Covers mechanical, electrical and structural static spark mitigation protocols on active coal production heads.",
    relevance: "Prohibits static-retaining fibers like untreated synthetics in coal mine airways to block spontaneous gas ignitions.",
    auditCheck: "Audits garment synthetic blends and surface conduction qualities to prevent spark generation."
  }
];
