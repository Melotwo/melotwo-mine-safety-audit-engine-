import { QctoModuleMapping, WorkerCompetencyRecord } from '../types/qcto';

export const QCTO_DISCLAIMER_TEXT =
  'MeloTwo provides digital learning facilitation, toolbox talk logging, and workplace proof-of-competency data to support accredited SDP certifications and tender requirements.';

export const QCTO_ACCREDITATION_NOTICE =
  'Statutory Notice: MeloTwo is an operational SHEQ software platform and workplace training verification companion, not an accredited Skills Development Provider (SDP) issuing formal SAQA certificates. All generated training logs and scenario drill verification stamps serve as verifiable workplace evidence for mining contractor tender safety binders under MHSA Section 10 and OHSA Construction Regulation 9.';

export const QCTO_MODULE_MAPPINGS: QctoModuleMapping[] = [
  {
    moduleId: 1,
    sansCode: 'SANS 10330:2020',
    sansTitle: 'HACCP & Catering Safety Management Systems',
    qualificationTitle: 'Occupational Certificate: Food Safety & HACCP Practitioner',
    saqaId: '99714',
    curriculumCode: '325705-001-00-KM01',
    nqfLevel: 5,
    credits: 16,
    qualityAssuringBody: 'QCTO',
    ofoCode: '325705 (Food Safety Officer)',
    legalFramework: 'MHSA Section 10 / R638 Hygiene Regs / SANS 10330 CCP Protocols',
    targetOccupations: ['Catering Supervisor', 'Mine Mess Hall Cook', 'Food Safety Auditor', 'Camp Manager'],
    knowledgeModules: [
      {
        code: 'KM-01-325705',
        title: 'Microbiological Hazard Controls & Critical Control Point (CCP) Validation',
        credits: 5,
        description: 'Bacterial growth kinetics, salmonella/campylobacter pathogen control in deep-level shaft transport.'
      },
      {
        code: 'KM-02-325705',
        title: 'Cold Chain Integrity & Blast Chilling Dynamics',
        credits: 4,
        description: 'Core temperatures, blast chilling threshold (under 90 min to <5°C), cold food holding parameters.'
      },
      {
        code: 'KM-03-325705',
        title: 'Industrial Kitchen Cross-Contamination & Sanitization Chemistry',
        credits: 7,
        description: 'Color-coded surface separation, chemical ppm contact times, and hygiene prerequisite audits.'
      }
    ],
    practicalModules: [
      {
        code: 'PM-01-325705',
        title: 'Calibrate Digital Probe Thermometers & Audit Hot-Holding Bain-Maries',
        credits: 4
      },
      {
        code: 'PM-02-325705',
        title: 'Execute Shift Sanitation Swabs and Chemical Dilution PPM Verification',
        credits: 4
      }
    ],
    workExperienceModules: [
      {
        code: 'WM-01-325705',
        title: 'Workplace Logging of 30-Day Consecutive CCP Thermal Records in Mine Canteen',
        credits: 8
      }
    ],
    drill: {
      id: 'DRILL-01-HACCP',
      title: 'Shaft Canteen Poultry CCP Thermal Threshold Breach',
      estimatedMinutes: 5,
      sansRef: 'SANS 10330:2020 Clause 7.4.2 (Critical Limits)',
      qctoRef: 'KM-01-325705 / SAQA ID 99714',
      hazardSeverity: 'HIGH',
      scenarioContext:
        'During a shift handover at 11:45 in the Shaft 3 surface mess hall, 180 cooked chicken portions are inspected prior to dispatch down-shaft. A calibrated probe thermometer inserted into the thickest core portion reads 67.2°C.',
      question:
        'What immediate operational protocol must the catering supervisor execute to remain compliant with SANS 10330 and MQA workplace hygiene guidelines?',
      options: [
        {
          id: 'opt-a',
          text: 'Allow down-shaft dispatch since the food is packaged inside insulated thermal transport containers.',
          isCorrect: false,
          feedback:
            'Incorrect. Insulated transport does not kill surviving pathogens if the core temperature failed the mandatory CCP threshold.'
        },
        {
          id: 'opt-b',
          text: 'Immediately halt dispatch, return chicken to the commercial combi oven to reheat above 75°C for at least 2 minutes, and log a CCP Non-Conformance deviation in the shift register.',
          isCorrect: true,
          feedback:
            'Compliant Protocol. SANS 10330 mandates core thermal verification ≥72°C (held 15s) or rapid reheating above 75°C. Immediate corrective action and formal NCR logging are non-negotiable.'
        },
        {
          id: 'opt-c',
          text: 'Extend hot-holding in the bain-marie at 60°C for 45 minutes to let residual heat equalize.',
          isCorrect: false,
          feedback:
            'Incorrect. Hot-holding at 60°C is an incubation temperature danger zone and will fail bacterial safety thresholds.'
        },
        {
          id: 'opt-d',
          text: 'Sprinkle chemical sanitizing food-safe mist over the food containers and proceed.',
          isCorrect: false,
          feedback: 'Critical safety violation. Chemical sprays must never contact consumable food.'
        }
      ],
      correctActionProtocol:
        'Halt food movement. Reheat core to >=75°C for 2 minutes or discard. Record batch ID, initial temp (67.2°C), corrective time, final probe temp, and supervisor sign-off.'
    },
    toolboxTalk: {
      id: 'TT-01-FOOD',
      topic: 'Pre-Shift Cold Chain & Shaft Meal Thermal Integrity',
      targetTrade: 'Mining Mess Hall Staff & Shift Catering Logistics',
      duration: '5 - 7 Minutes',
      statutoryReference: 'SANS 10330 / R638 Regulations / MHSA Section 10',
      mqaSkillCode: 'MQA/SP/0173/13 (Camp & Canteen Hygiene in Mining Operations)',
      overview:
        'Food poisoning underground disrupts whole production shifts and poses acute life risks. Today we reinforce the 72°C cooked core target and the 4-hour rule for deep-level meal transit.',
      keyDiscussionPoints: [
        'Probe thermometer calibration: Zero-point ice bath check (0°C ± 0.5°C) before each cook cycle.',
        'Cooked poultry core minimum is 72°C held for 15 seconds. Never assume cooking by visual brownness.',
        'Shaft insulated transport boxes must be pre-sanitized and sealed with tamper-evident tags.'
      ],
      supervisorActionPoints: [
        'Inspect probe sanitizing wipes supply at the plating station.',
        'Verify logger stamps on down-shaft meal delivery crates.',
        'Randomly probe 2 meal portions before the transport cage drops.'
      ],
      criticalSafetyRules: [
        'RULE 1: No food leaves the kitchen below 65°C hot-hold or above 5°C cold-hold.',
        'RULE 2: Probe needles must be wiped with 70% alcohol swabs between every dish.',
        'RULE 3: Any temperature breach must be logged and reported to the Camp Manager immediately.'
      ]
    }
  },
  {
    moduleId: 2,
    sansCode: 'SANS 10142-1:2021',
    sansTitle: 'Industrial Wiring Code & Low/Medium Voltage Reticulation',
    qualificationTitle: 'Occupational Certificate: Electrician (Mining & Industrial Reticulation)',
    saqaId: '121930',
    curriculumCode: '671101-001-00-KM02',
    nqfLevel: 4,
    credits: 24,
    qualityAssuringBody: 'QCTO / MQA Co-Accredited',
    ofoCode: '671101 (Electrician)',
    legalFramework: 'Electrical Installation Regulations (EIR 6) / MHSA Reg 21 / SANS 10142-1',
    targetOccupations: ['Section Electrician', 'Substation Technician', 'Electrical Foreman', 'Artisan Assistant'],
    knowledgeModules: [
      {
        code: 'KM-01-671101',
        title: 'Statutory Earthing, Bonding and Fault Loop Impedance Calculations',
        credits: 8,
        description: 'Neutral earthing resistors, earth continuity conductors, and step-and-touch potential reduction.'
      },
      {
        code: 'KM-02-671101',
        title: 'Isolation Protocols, Arc Flash Protection & Physical Clearances',
        credits: 8,
        description: 'Mandatory working space (min 800mm clear frontal space), moisture clearances from conductive sinks.'
      },
      {
        code: 'KM-03-671101',
        title: 'Certificate of Compliance (COC) Statutory Sign-Off Procedures',
        credits: 8,
        description: 'Inspection test schedules, insulation resistance testing (1000V megger), earth leakage mA trip tests.'
      }
    ],
    practicalModules: [
      {
        code: 'PM-01-671101',
        title: 'Perform Zero-Voltage Proving & Calibrated LOTO Lockout Sequence',
        credits: 6
      },
      {
        code: 'PM-02-671101',
        title: 'Measure Earth Loop Impedance and Residual Current Device (RCD) Trip Speed',
        credits: 6
      }
    ],
    workExperienceModules: [
      {
        code: 'WM-01-671101',
        title: 'Supervised Commissioning and COC Pre-Audit of a 400V Distribution Board in Mining Plant',
        credits: 12
      }
    ],
    drill: {
      id: 'DRILL-02-ELEC',
      title: '3-Phase Isolator Proximity & Inadequate Wet Zone Clearance',
      estimatedMinutes: 5,
      sansRef: 'SANS 10142-1:2021 Clause 6.1.4 (Proximity to Water)',
      qctoRef: 'KM-02-671101 / SAQA ID 121930',
      hazardSeverity: 'CRITICAL',
      scenarioContext:
        'An electrical contractor has installed a 400V 63A rotary isolator switch 150mm adjacent to a stainless steel dishwashing rinse sink in a plant prep area. Water droplets frequently splash against the isolator housing.',
      question:
        'Under SANS 10142-1 and MQA electrical standards, what is the required compliance directive?',
      options: [
        {
          id: 'opt-a',
          text: 'Acceptable if the isolator is painted with corrosion-resistant polyurethane paint.',
          isCorrect: false,
          feedback: 'Critical error. Paint provides no moisture ingress protection or flashover barrier.'
        },
        {
          id: 'opt-b',
          text: 'Issue an immediate Stop-Work Order: electrical switchgear must maintain strict zoning distances or minimum 1000mm lateral clearance from wet water sources unless IP66 rated with splash barrier baffles.',
          isCorrect: true,
          feedback:
            'Compliant Protocol. SANS 10142-1 prohibits unprotected switchgear in splash zones. The high risk of arc flashover and conductive operator shock requires immediate isolation and relocation.'
        },
        {
          id: 'opt-c',
          text: 'Allow operation if workers wear Class 0 rubber electrical gloves while washing dishes.',
          isCorrect: false,
          feedback: 'Incorrect. PPE does not substitute for engineering and installation clearance compliance.'
        },
        {
          id: 'opt-d',
          text: 'Change the circuit breaker from 63A to 50A to reduce fire risk without moving the switch.',
          isCorrect: false,
          feedback: 'Incorrect. Downsizing the breaker does not eliminate moisture-induced flashover shock hazard.'
        }
      ],
      correctActionProtocol:
        'De-energize circuit, verify zero energy with a two-pole tester, relocate switchgear to compliant zone (>1.0m from water source), and re-issue installation Certificate of Compliance.'
    },
    toolboxTalk: {
      id: 'TT-02-ELEC',
      topic: 'LOTO Zero Energy Verification Before Opening Distribution Boards',
      targetTrade: 'Industrial Electricians, Millwrights & Mechanical Fitters',
      duration: '5 - 7 Minutes',
      statutoryReference: 'SANS 10142-1 / EIR 6 / MHSA Section 10',
      mqaSkillCode: 'MQA Substation & LOTO Safety Standard',
      overview:
        'Electricity is invisible. Never trust a toggle switch or a colleague verbal word. We test before touch using the 3-step live-dead-live proving protocol.',
      keyDiscussionPoints: [
        'Live-Dead-Live Proving: Test proving unit on known live supply, test target isolated circuit, test back on proving unit.',
        'Personal padlock: 1 man, 1 lock, 1 key. Never share lockout keys with coworkers or supervisors.',
        'Arc Flash boundary: Put on certified face shield and flame-retardant balaclava before racking breakers.'
      ],
      supervisorActionPoints: [
        'Audit all lockboxes on the current shift permit-to-work.',
        'Inspect calibrated voltage detectors for valid test tags.',
        'Check that breaker panel doors are secured before energizing.'
      ],
      criticalSafetyRules: [
        'RULE 1: Test before touch - 100% of the time, no exceptions.',
        'RULE 2: Apply danger tag with your name, phone number, and company name clearly legible.',
        'RULE 3: Report missing panel blanks or exposed copper busbars immediately.'
      ]
    }
  },
  {
    moduleId: 3,
    sansCode: 'SANS 10049:2019',
    sansTitle: 'Occupational Hygiene, Sanitation & PPE Material Degradation',
    qualificationTitle: 'Occupational Certificate: Occupational Health and Hygiene Monitor',
    saqaId: 'SP-240503',
    curriculumCode: '325701-001-00-KM03',
    nqfLevel: 3,
    credits: 12,
    qualityAssuringBody: 'MQA / QCTO',
    ofoCode: '325701 (Occupational Health Monitor)',
    legalFramework: 'Hazardous Chemical Substances Regs / DMR Hygiene Code of Practice / SANS 10049',
    targetOccupations: ['Hygiene Sampler', 'Safety Rep', 'Stores Clerk', 'SHEQ Administrator'],
    knowledgeModules: [
      {
        code: 'KM-01-325701',
        title: 'Occupational Exposure Limits (OEL) for Inhalable Mine Dust & Toxic Fumes',
        credits: 4,
        description: 'Respirable crystalline silica limits, personal dust pumps, chemical exposure monitoring.'
      },
      {
        code: 'KM-02-325701',
        title: 'PPE Material Degradation Index & Mechanical Stress Fatigue',
        credits: 4,
        description: 'Acid hydrolytic damage, UV embrittlement, harness webbing abrasion index, footwear sole hydrolysis.'
      },
      {
        code: 'KM-03-325701',
        title: 'Sanitation Verification & Bio-Contamination Control Protocols',
        credits: 4,
        description: 'Locker room change-house sanitation, industrial washing cycle counts, ATP bioluminescence checks.'
      }
    ],
    practicalModules: [
      {
        code: 'PM-01-325701',
        title: 'Perform Fall-Arrest Harness 12-Point Tactile and Stitching Degradation Inspection',
        credits: 3
      },
      {
        code: 'PM-02-325701',
        title: 'Execute Respirator Fit Testing and Chemical Storage Segregation Audit',
        credits: 3
      }
    ],
    workExperienceModules: [
      {
        code: 'WM-01-325701',
        title: 'Conduct Monthly PPE Register Inspections for 100 Active Underground Mine Workers',
        credits: 6
      }
    ],
    drill: {
      id: 'DRILL-03-PPE',
      title: 'Fall-Arrest Harness Webbing Chemical Oxidation & UV Degradation',
      estimatedMinutes: 5,
      sansRef: 'SANS 10049 & SANS 50361 (Full Body Harnesses)',
      qctoRef: 'KM-02-325701 / SAQA ID SP-240503',
      hazardSeverity: 'HIGH',
      scenarioContext:
        'A rigger working on a tailings thickener tower presents a full body harness for shift pre-check. The polyester webbing exhibits surface discoloration, stiffness from acidic reagent splash, and three frayed load-bearing stitches on the dorsal D-ring retainer.',
      question:
        'Under SANS 10049 and MeloTwo PPE Material Degradation Index guidelines, what action must the safety officer mandate?',
      options: [
        {
          id: 'opt-a',
          text: 'Wipe the webbing down with kerosene to soften the stiffness and allow use for surface work only.',
          isCorrect: false,
          feedback: 'Dangerous violation. Solvents further dissolve synthetic webbing polymers.'
        },
        {
          id: 'opt-b',
          text: 'Immediately quarantine and physically cut the harness straps with shears to prevent re-use; log serial number into the decommissioned equipment register.',
          isCorrect: true,
          feedback:
            'Compliant Protocol. Any chemical hardening or broken structural stitching causes catastrophic dynamic tensile failure during a fall. Decommissioning must be irreversible.'
        },
        {
          id: 'opt-c',
          text: 'Tape over the frayed stitches with high-tensile duct tape and clear for 7 days.',
          isCorrect: false,
          feedback: 'Critical safety violation. Tape conceals defects and provides zero tensile strength.'
        },
        {
          id: 'opt-d',
          text: 'Downgrade harness to light-duty baggage lifting lanyard.',
          isCorrect: false,
          feedback: 'Prohibited. PPE must never be re-purposed for rigging or load lifting.'
        }
      ],
      correctActionProtocol:
        'Quarantine harness, cut webbing through dorsal D-ring, log serial number in Register of Scrapped PPE, issue certified new replacement harness.'
    },
    toolboxTalk: {
      id: 'TT-03-PPE',
      topic: 'Pre-Shift PPE Integrity & Respirator Seal Check',
      targetTrade: 'All Underground and Surface Industrial Workers',
      duration: '5 - 7 Minutes',
      statutoryReference: 'SANS 10049 / DMR Hygiene CoP / GSR 2',
      mqaSkillCode: 'MQA Dust & Noise Mitigation Skills Programme',
      overview:
        'Your PPE is the last line of defense between you and a fatal injury. Today we check dust respirator seals and verify boot sole grip before going down-shaft.',
      keyDiscussionPoints: [
        'Respirator positive and negative pressure seal test: Cover filters with palms and inhale gently.',
        'Safety boot inspection: Check for oil embrittlement, cracked soles, and exposed steel toe caps.',
        'Hard hat expiration: Inspect internal shell stamp. Replace after 3 years or any direct heavy impact.'
      ],
      supervisorActionPoints: [
        'Confirm every worker has certified safety eyewear with anti-fog coating.',
        'Verify ear protection NRR rating exceeds 25dB for drill operators.',
        'Ensure replacement dust filters are available at the lamp room.'
      ],
      criticalSafetyRules: [
        'RULE 1: Damaged PPE must be surrendered immediately for instant replacement.',
        'RULE 2: Never modify safety equipment (no cutting boot tops or drilling helmet vent holes).',
        'RULE 3: Respiratory masks must be stored in clean, sealed ziplock bags when not worn.'
      ]
    }
  },
  {
    moduleId: 4,
    sansCode: 'SANS 10108:2020',
    sansTitle: 'Hazardous Explosive Gas & Dust Atmospheres (Ex Zones)',
    qualificationTitle: 'Occupational Certificate: Explosion Prevention Officer (Fiery Mines & Volatile Gases)',
    saqaId: '102148',
    curriculumCode: '311701-001-00-KM04',
    nqfLevel: 5,
    credits: 20,
    qualityAssuringBody: 'MQA / QCTO',
    ofoCode: '311701 (Mining Safety Inspector / Explosion Prevention)',
    legalFramework: 'MHSA Chapter 10 (Hazardous Locations) / SANS 10108 / SANS 60079',
    targetOccupations: ['Ventilation Officer', 'Flameproof Inspector', 'Mining Shift Boss', 'Ex Artisan'],
    knowledgeModules: [
      {
        code: 'KM-01-311701',
        title: 'Classification of Hazardous Explosive Zones (Zone 0, 1, 2 and Zone 20, 21, 22)',
        credits: 7,
        description: 'Methane lower explosive limits (5-15%), coal dust explosion propagation, ventilation aerodynamics.'
      },
      {
        code: 'KM-02-311701',
        title: 'Flameproof (Ex d), Intrinsic Safety (Ex i) & Pressurized Protection Concepts',
        credits: 7,
        description: 'Maximum Experimental Safe Gap (MESG), flange gap tolerances, high-tensile bolt torque specs.'
      },
      {
        code: 'KM-03-311701',
        title: 'Continuous Gas Telemetry, Methanometers & Automatic Tripping Interlocks',
        credits: 6,
        description: 'Sensor calibration curves, 1.0% methane power cutoff interlocks, and emergency withdrawal limits.'
      }
    ],
    practicalModules: [
      {
        code: 'PM-01-311701',
        title: 'Perform Feeler Gauge Gap Checks on Underground Flameproof Enclosure Flanges',
        credits: 5
      },
      {
        code: 'PM-02-311701',
        title: 'Test and Calibrate Handheld Optical Methanometer with Certified Bump Gas',
        credits: 5
      }
    ],
    workExperienceModules: [
      {
        code: 'WM-01-311701',
        title: 'Conduct Explosion Prevention Audits on 20 Operating Flameproof Underground Machines',
        credits: 10
      }
    ],
    drill: {
      id: 'DRILL-04-EX',
      title: 'Missing Fastener on Coal Face Flameproof Shuttle Car Control Box',
      estimatedMinutes: 5,
      sansRef: 'SANS 10108 & SANS 60079-1 (Flameproof Enclosures)',
      qctoRef: 'KM-02-311701 / SAQA ID 102148',
      hazardSeverity: 'CRITICAL',
      scenarioContext:
        'During pre-shift inspection in an underground coal heading (Zone 1 hazardous area), the shift electrician discovers that one of twelve high-tensile retaining bolts on the Ex d flameproof motor control enclosure is missing. The thread hole is packed with coal dust.',
      question:
        'Under SANS 10108 and South African Mine Health and Safety Act Chapter 10 regulations, what is the mandatory immediate protocol?',
      options: [
        {
          id: 'opt-a',
          text: 'Drive a mild steel bolt from the general tool bag into the hole and continue the shift.',
          isCorrect: false,
          feedback:
            'Critical danger. Mild steel bolts shear under explosive internal pressures. Flameproof boxes require certified high-tensile Grade 8.8/10.9 fasteners.'
        },
        {
          id: 'opt-b',
          text: 'Immediately lock out the machine at the gate-end box, tag out the power feed, clean the thread with a brass tap, and install a certified manufacturer replacement bolt torqued to specification before re-energizing.',
          isCorrect: true,
          feedback:
            'Compliant Protocol. A missing bolt compromises flameproof gap integrity. An internal spark can propagate flame into the external atmosphere, triggering a catastrophic coal dust / methane explosion.'
        },
        {
          id: 'opt-c',
          text: 'Apply silicone fire sealant over the open bolt hole and monitor with a methanometer.',
          isCorrect: false,
          feedback: 'Critical safety violation. Silicone has zero mechanical flame containment properties.'
        },
        {
          id: 'opt-d',
          text: 'Operate the machine at half speed until the scheduled weekend maintenance overhaul.',
          isCorrect: false,
          feedback: 'Illegal under MHSA. Explosive gas ignition occurs in milliseconds regardless of machine speed.'
        }
      ],
      correctActionProtocol:
        'Isolate machine electrical supply at gate-end box. De-energize and lock out. Clean thread with brass tooling. Fit approved high-tensile fastener, torque to spec, check flange gaps with 0.2mm feeler gauge, log in flameproof register.'
    },
    toolboxTalk: {
      id: 'TT-04-EX',
      topic: 'Flameproof Integrity & Methane Gas Testing in Fiery Workings',
      targetTrade: 'Coal Mining Crews, Drillers & Machine Operators',
      duration: '5 - 7 Minutes',
      statutoryReference: 'SANS 10108 / MHSA Chapter 10 / SANS 60079',
      mqaSkillCode: 'MQA Fiery Mine Gas Testing & Flameproof Certification',
      overview:
        'Methane gas is odorless, colorless, and highly explosive between 5% and 15%. In hazardous zones, every piece of electrical apparatus must remain flameproof 100% of the time.',
      keyDiscussionPoints: [
        'Continuous gas testing: Test roof, floor, and working face before starting machinery.',
        'Automatic 1.0% trip rule: If methane reaches 1.0%, stop work. At 1.4%, cut all electrical power and evacuate to fresh air intake.',
        'Flameproof enclosures: Never drill, file, or weld any flameproof box on site.'
      ],
      supervisorActionPoints: [
        'Bump-test handheld methanometers with certified test canister before cage descent.',
        'Inspect shuttle car cable reels for jacket punctures or exposed copper braiding.',
        'Verify auxiliary ventilation ducting is within 10 meters of the advancing coal face.'
      ],
      criticalSafetyRules: [
        'RULE 1: No contraband underground - zero lighters, matches, or non-certified cellphones.',
        'RULE 2: All enclosure fasteners must be tightened to specification before energizing.',
        'RULE 3: If ventilation fails, isolate machinery and withdraw immediately.'
      ]
    }
  },
  {
    moduleId: 5,
    sansCode: 'SANS 10375:2021',
    sansTitle: 'Conveyors, Lifting Tackle & Rigging Hardware Safety',
    qualificationTitle: 'Occupational Certificate: Heavy Rigging & Materials Handling Specialist',
    saqaId: '118434',
    curriculumCode: '651501-001-00-KM05',
    nqfLevel: 4,
    credits: 18,
    qualityAssuringBody: 'QCTO / MQA Co-Accredited',
    ofoCode: '651501 (Rigger and Ropesman)',
    legalFramework: 'DMR Lifting Machinery Regulations / Driven Machinery Regs (DMR 18) / SANS 10375',
    targetOccupations: ['Certified Rigger', 'Conveyor Attendant', 'Shaft Ropesman', 'Boilermaker'],
    knowledgeModules: [
      {
        code: 'KM-01-651501',
        title: 'Safe Working Load (SWL) Calculations, Sling Angles & D/d Ratios',
        credits: 6,
        description: 'Tension factors on multi-leg slings, angle deration (60°, 45°, 30°), and synthetic sling cut protection.'
      },
      {
        code: 'KM-02-651501',
        title: 'Conveyor Pull-Wire Emergency Trip Switches, Nip Point Guarding & Splice Auditing',
        credits: 6,
        description: 'Pull-wire cable tension, automatic lock-out reset, tail pulley guarding, and ultrasonic belt splice inspection.'
      },
      {
        code: 'KM-03-651501',
        title: 'Statutory 6-Month Proof Load Testing & Non-Destructive Tackle Certification',
        credits: 6,
        description: 'Magnetic particle inspection (MPI), shackle pin deformation checks, and color-coded tag registers.'
      }
    ],
    practicalModules: [
      {
        code: 'PM-01-651501',
        title: 'Perform Pre-Lift Inspection on Master Links, Bow Shackles and Wire Rope Slings',
        credits: 4
      },
      {
        code: 'PM-02-651501',
        title: 'Test Conveyor Emergency Stop Pull-Wire Trigger Sensitivity and Lockout Reset Mechanism',
        credits: 4
      }
    ],
    workExperienceModules: [
      {
        code: 'WM-01-651501',
        title: 'Supervised Rigging and Tandem Crane Hoisting of a 12-Tonne Heavy Industrial Slurry Pump',
        credits: 8
      }
    ],
    drill: {
      id: 'DRILL-05-RIG',
      title: 'Deformed Bow Shackle Pin & Conveyor Pull-Wire Failure',
      estimatedMinutes: 5,
      sansRef: 'SANS 10375 & DMR 18 (Lifting Tackle Compliance)',
      qctoRef: 'KM-01-651501 / SAQA ID 118434',
      hazardSeverity: 'CRITICAL',
      scenarioContext:
        'A rigging crew preparing to lift a 4.5-tonne conveyor motor discovers a 6.5-tonne SWL bow shackle whose threaded pin shows a 4-degree bend and missing manufacturer batch stamp. The safety color code tag is also 3 months expired.',
      question:
        'Under SANS 10375 and MQA Lifting Machinery Regulations, what protocol must be enforced?',
      options: [
        {
          id: 'opt-a',
          text: 'Hammer the shackle pin straight on an anvil and derate the safe working load to 3 tonnes.',
          isCorrect: false,
          feedback:
            'Critical violation. Cold-straightening or heating alloy lifting pins creates internal micro-cracks that cause sudden catastrophic failure under tension.'
        },
        {
          id: 'opt-b',
          text: 'Immediately scrap the shackle by cutting the body in half with an angle grinder, log the rejection in the lifting tackle register, and select a valid color-coded shackle with valid test certs.',
          isCorrect: true,
          feedback:
            'Compliant Protocol. SANS 10375 and DMR 18 mandate immediate destruction of deformed tackle. Missing identification stamps or expired statutory test dates invalidate equipment legally.'
        },
        {
          id: 'opt-c',
          text: 'Use the bent pin provided the load is lifted no higher than 300mm off the ground.',
          isCorrect: false,
          feedback: 'Dangerous violation. Equipment failure can crush feet or rupture high-pressure piping.'
        },
        {
          id: 'opt-d',
          text: 'Wrap the bent pin in wire rope to reinforce the thread.',
          isCorrect: false,
          feedback: 'Critical safety breach. Never improvise lifting tackle.'
        }
      ],
      correctActionProtocol:
        'Condemn tackle immediately. Render unusable by cutting shackle bow. Remove from site register. Inspect all alternative tackle for current quarterly color-coding and valid load test certificates.'
    },
    toolboxTalk: {
      id: 'TT-05-RIG',
      topic: 'Conveyor Emergency Pull-Wire Line Testing & Nip Point Safety',
      targetTrade: 'Conveyor Attendants, Plant Operators & Maintenance Fitters',
      duration: '5 - 7 Minutes',
      statutoryReference: 'SANS 10375 / MHSA Reg 8.9 / Driven Machinery Regs',
      mqaSkillCode: 'MQA Conveyor Belt & Emergency Stoppage Protocol',
      overview:
        'Conveyor belts move tons of rock per hour and do not stop for human limbs. The emergency pull-wire is your life-line. It must be accessible, responsive, and untangled along the entire gallery.',
      keyDiscussionPoints: [
        'Pull-wire test daily: Pull the cord to verify instantaneous mechanical trip and audible alarm.',
        'Zero reach into nip points: Never attempt to scrape buildup from return idlers while belt is in motion.',
        'Lockout at head and tail drive: Isolate high voltage, lock out, and test zero rotation before cleaning spillage.'
      ],
      supervisorActionPoints: [
        'Check tensioning springs on all conveyor pull-wires across sections.',
        'Ensure interlocked mesh guards on drive pulleys cannot be opened without tooling.',
        'Verify emergency stop sirens are audible above background mill noise.'
      ],
      criticalSafetyRules: [
        'RULE 1: Never cross over or crawl under a moving conveyor belt - use designated crossover bridges.',
        'RULE 2: Loose clothing, jewelry, and untucked shirts are strictly forbidden near rotating pulleys.',
        'RULE 3: If a pull-wire is tripped, verify the entire belt length before resetting the trip switch.'
      ]
    }
  },
  {
    moduleId: 6,
    sansCode: 'ISO 42001:2023 / SANS',
    sansTitle: 'Industrial AI Governance & Predictive Telemetry Safety Management',
    qualificationTitle: 'Part-Qualification: Industrial AI Quality & Predictive Safety Auditor',
    saqaId: '119852',
    curriculumCode: '251901-001-00-KM06',
    nqfLevel: 6,
    credits: 15,
    qualityAssuringBody: 'QCTO',
    ofoCode: '251901 (Industrial Data & AI Systems Analyst)',
    legalFramework: 'ISO/IEC 42001 (AI Management) / POPIA Act / MHSA Defensible Recordkeeping',
    targetOccupations: ['Digital SHEQ Manager', 'Predictive Safety Officer', 'Telemetry Engineer', 'Audit Lead'],
    knowledgeModules: [
      {
        code: 'KM-01-251901',
        title: 'Algorithmic Transparency, Bias Mitigation & Model Explainability in Hazard Scoring',
        credits: 5,
        description: 'Transparent confidence thresholds, telemetry drift detection, and automated severity reconciliation.'
      },
      {
        code: 'KM-02-251901',
        title: 'Immutable Ledger Audit Trails, Cryptographic Signatures & Legal Defensibility',
        credits: 5,
        description: 'Digital chain of custody for statutory proof in Department of Mineral Resources (DMR) inquiries.'
      },
      {
        code: 'KM-03-251901',
        title: 'Human-in-the-Loop Override Architecture for High-Risk Automated Decision Systems',
        credits: 5,
        description: 'Mandatory engineer sign-off gates, override logging, and failure-mode safe-state fallback.'
      }
    ],
    practicalModules: [
      {
        code: 'PM-01-251901',
        title: 'Audit Multi-Standard Automated Rule Reconciliations and Verify Overrides',
        credits: 4
      },
      {
        code: 'PM-02-251901',
        title: 'Execute Automated Compliance Batch Scoring and Export Digitally Stamped Audit Pack',
        credits: 4
      }
    ],
    workExperienceModules: [
      {
        code: 'WM-01-251901',
        title: 'Oversee Automated AI Safety Telemetry Monitoring on 500 Daily IoT Shift Signals',
        credits: 7
      }
    ],
    drill: {
      id: 'DRILL-06-AI',
      title: 'Automated Telemetry Severity Conflict & Human-in-the-Loop Override',
      estimatedMinutes: 5,
      sansRef: 'ISO 42001:2023 Clause 8.4 (Human Oversight)',
      qctoRef: 'KM-03-251901 / SAQA ID 119852',
      hazardSeverity: 'HIGH',
      scenarioContext:
        'An automated sensor monitoring an underground shaft fan bearing reports a minor vibration anomaly (Medium severity) while an adjacent temperature sensor flags severe bearing overheat (89°C, High severity). An algorithm attempts to average the two scores into a single Medium severity ticket.',
      question:
        'Under MeloTwo ISO 42001 Conflict Reconciliation Protocol and human-in-the-loop governance, how must the safety engineer react?',
      options: [
        {
          id: 'opt-a',
          text: 'Accept the averaged Medium severity score to reduce alarm fatigue in the control room.',
          isCorrect: false,
          feedback: 'Dangerous failure. Averaging life-safety risks conceals critical equipment failure.'
        },
        {
          id: 'opt-b',
          text: 'Enforce the Conflict Reconciliation Life-Safety Override: elevate to HIGH severity (Immediate Action Required), dispatch an artisan immediately, and log an algorithm reconciliation note in the compliance ledger.',
          isCorrect: true,
          feedback:
            'Compliant Protocol. ISO 42001 and MeloTwo core governance dictate that safety algorithms must always default to the highest individual severity indicator to preserve life safety, never averaging downward.'
        },
        {
          id: 'opt-c',
          text: 'Disable the temperature sensor to stop the alert until the end of the shift.',
          isCorrect: false,
          feedback: 'Critical safety violation. Disabling sensors creates catastrophic blind spots.'
        },
        {
          id: 'opt-d',
          text: 'Wait 24 hours to see if the vibration trend self-corrects.',
          isCorrect: false,
          feedback: 'Incorrect. Unchecked bearing overheat leads to catastrophic fan seizure and mine evacuation.'
        }
      ],
      correctActionProtocol:
        'Trigger automated life-safety override. Escalate ticket to High (Immediate Action Required). Notify Section Engineer, dispatch mechanical artisan, log human-in-the-loop override into immutable audit trail.'
    },
    toolboxTalk: {
      id: 'TT-06-AI',
      topic: 'Digital Safety Data Integrity & Immediate Reporting in Modern Mines',
      targetTrade: 'Supervisors, Telemetry Clerks & Control Room Operators',
      duration: '5 - 7 Minutes',
      statutoryReference: 'ISO 42001 / MHSA Section 10 / SANS Information Governance',
      mqaSkillCode: 'Advanced Digital Safety & Telemetry Assurance',
      overview:
        'Digital audit logs protect our site from multi-million Rand shutdown fines only if the input data is honest, timely, and tamper-proof. Real-time logging saves lives.',
      keyDiscussionPoints: [
        'Never falsify shift safety logs: Time-stamped data is cryptographically anchored and audited by inspectors.',
        'Acknowledge and clear alerts honestly: Never clear a safety alarm from the control desk without physical field verification.',
        'Offline resilience: When underground with zero Wi-Fi, trust MeloTwo local caching; sync as soon as you reach the shaft station.'
      ],
      supervisorActionPoints: [
        'Check that tablet battery levels exceed 60% before entering underground sections.',
        'Review the daily un-synced queue on the shift supervisor terminal.',
        'Ensure all digital corrective action work orders have assigned responsible artisans.'
      ],
      criticalSafetyRules: [
        'RULE 1: Every near-miss reported digitally is an incident prevented tomorrow.',
        'RULE 2: Digital signatures are legally binding under South African statutory law.',
        'RULE 3: Immediately escalate un-cleared high-priority alerts to the General Manager.'
      ]
    }
  }
];

export const INITIAL_COMPETENCY_RECORDS: WorkerCompetencyRecord[] = [
  {
    id: 'COMP-REC-2026-0891',
    workerName: 'Sipho Ndlovu',
    idNumber: '880412 5192 083',
    companyName: 'Khanya Mining & Engineering (Pty) Ltd',
    moduleId: 1,
    moduleName: 'SANS 10330:2020 (HACCP Food Safety)',
    sansRef: 'SANS 10330:2020 Clause 7.4',
    saqaId: '99714',
    curriculumCode: '325705-001-00-KM01',
    drillScore: 100,
    passed: true,
    completedAt: '2026-09-15 08:42:15',
    location: {
      siteName: 'Shaft 3 Mess Hall Canteen',
      latitude: -26.1952,
      longitude: 28.0346,
      accuracyMeters: 4.2
    },
    supervisorName: 'Tebogo Mokoena',
    supervisorDesignation: 'Senior SHEQ Officer (Pr.Cert.SHEQ)',
    verificationStamp: 'MELOTWO-VERIFIED-99714-SN8804-0915',
    notes: 'Demonstrated exemplary knowledge of 72°C core threshold and blast chiller intervals.',
    attachedToTenderFile: true
  },
  {
    id: 'COMP-REC-2026-0892',
    workerName: 'Johan van der Merwe',
    idNumber: '920815 5041 088',
    companyName: 'Vaal Reticulation & Substation Services',
    moduleId: 2,
    moduleName: 'SANS 10142-1:2021 (Industrial Wiring Code)',
    sansRef: 'SANS 10142-1:2021 Clause 6.1.4',
    saqaId: '121930',
    curriculumCode: '671101-001-00-KM02',
    drillScore: 100,
    passed: true,
    completedAt: '2026-09-16 14:15:30',
    location: {
      siteName: 'Substation B - Concentrator Plant',
      latitude: -26.2014,
      longitude: 28.0411,
      accuracyMeters: 3.8
    },
    supervisorName: 'Tebogo Mokoena',
    supervisorDesignation: 'Senior SHEQ Officer (Pr.Cert.SHEQ)',
    verificationStamp: 'MELOTWO-VERIFIED-121930-JM9208-0916',
    notes: 'Verified zero-energy LOTO and 1000mm water clearance zones on 400V distribution boards.',
    attachedToTenderFile: true
  },
  {
    id: 'COMP-REC-2026-0893',
    workerName: 'Kagiso Molefe',
    idNumber: '951103 5689 081',
    companyName: 'Bojanala Industrial Rigging & Lifting',
    moduleId: 5,
    moduleName: 'SANS 10375:2021 (Conveyors & Rigging Hardware)',
    sansRef: 'SANS 10375 / DMR 18',
    saqaId: '118434',
    curriculumCode: '651501-001-00-KM05',
    drillScore: 100,
    passed: true,
    completedAt: '2026-09-17 07:30:11',
    location: {
      siteName: 'Overland Conveyor Gallery - Line 4',
      latitude: -26.1988,
      longitude: 28.0375,
      accuracyMeters: 5.1
    },
    supervisorName: 'Hendrik Botha',
    supervisorDesignation: 'Appointed Rigging Supervisor (GMR 2.1)',
    verificationStamp: 'MELOTWO-VERIFIED-118434-KM9511-0917',
    notes: 'Identified bent bow shackle pin defect; executed immediate quarantine & destructive discard.',
    attachedToTenderFile: true
  }
];
