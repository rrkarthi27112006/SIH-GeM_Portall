// ============================================================
// MOCK DATA & ML ENGINE — BidSure AI / BidVerify (SIH 2026 Problem ID: 26100)
// Team BidNova · AI-Powered Integrated Bid Compliance Verification Platform
// ============================================================

// ---------- 1. STATUTORY COMPLIANCE REQUIREMENTS (CLAUSE-TO-PROOF) ----------
const REQ_DEFS = [
  { key:'gst',        label:'GST Registration',          icon:'doc',       source:'GSTN Portal',           apiEndpoint:'https://api.gstn.gov.in/taxpayer/v1.2/verify', clause:'Clause 3.1: Valid GSTIN with Active Regular Taxpayer Status' },
  { key:'pan',        label:'PAN Verification',           icon:'file',      source:'Income Tax e-Filing',    apiEndpoint:'https://api.incometax.gov.in/pan-val/v2',      clause:'Clause 3.2: Corporate Permanent Account Number & Name Match' },
  { key:'udyam',      label:'Udyam / MSME Registration',  icon:'building',  source:'Udyam Registration Portal', apiEndpoint:'https://udyamregistration.gov.in/api/verify', clause:'Clause 3.3: MSME Order 2012 Exemption & Classification Proof' },
  { key:'itr',        label:'Income Tax Returns (3 yr)',  icon:'report',    source:'Income Tax e-Filing',    apiEndpoint:'https://api.incometax.gov.in/itr/acknowledgement', clause:'Clause 4.1: Financial Standing & 3-Year Consecutive ITR filing' },
  { key:'oem',        label:'OEM Authorization (MAF)',    icon:'shield',    source:'Bidder-submitted certificate', apiEndpoint:'https://verify.oem-network.in/auth-cert', clause:'Clause 5.2: Manufacturer Authorization Form (MAF) Endorsement' },
  { key:'mii',        label:'Make in India Certificate',  icon:'flag',      source:'DPIIT / Self-certification', apiEndpoint:'https://dpiit.gov.in/mii-portal/val',       clause:'Clause 6.1: Public Procurement (Preference to Make in India) Order 2017' },
  { key:'epfo',       label:'EPFO / ESIC Compliance',     icon:'users',     source:'EPFO Portal',            apiEndpoint:'https://unifiedportal-epfo.epfindia.gov.in/api', clause:'Clause 3.4: Statutory Labour & Provident Fund Monthly ECR Compliance' },
  { key:'experience', label:'Past Experience (contracts)',icon:'briefcase', source:'Bidder-submitted work orders', apiEndpoint:'https://tender-history.gem.gov.in/v1/orders', clause:'Clause 4.3: Past Performance Threshold & Government Work Orders' },
  { key:'turnover',   label:'Annual Turnover (Audited)',  icon:'trend-up',  source:'Audited Financials / CA', apiEndpoint:'https://mca.gov.in/api/v2/financials',          clause:'Clause 4.2: Min. Average Annual Turnover Criteria with UDIN' },
  { key:'blacklist',  label:'Blacklisting Check',         icon:'ban',       source:'GeM Debarment List / CVC', apiEndpoint:'https://gem.gov.in/api/debarment-registry/search', clause:'Clause 2.4: Debarment / Anti-Corruption Non-Debarment Declaration' },
];

// Helper to construct compliance check items
function req(key, result, evidence, reason, confidence){
  const def = REQ_DEFS.find(r=>r.key===key) || { label:key, source:'External Verification', clause:'Clause Requirements', apiEndpoint:'https://api.gov.in/v1' };
  return { key, label:def.label, source:def.source, result, evidence, reason, confidence, clause:def.clause, apiEndpoint:def.apiEndpoint };
}

// ---------- 2. TENDERS DATASET ----------
const TENDERS = [
  {
    id:'GEM/2026/B/4471829', title:'Supply of Advanced Life Support Ambulances (Type-C)', org:'Directorate of Health Services, Tamil Nadu',
    category:'Medical Equipment', closingDate:'2026-09-18', status:'Verification In Progress',
    estimatedValue:'₹18.50 Crores', emdAmount:'₹37.00 Lakhs (Exempt for MSME)',
    description:'Procurement of 42 Type-C Advanced Life Support ambulances with onboard diagnostic and ICU-grade equipment for district government hospitals.',
    requirements:['gst','pan','udyam','itr','oem','mii','epfo','experience','turnover','blacklist'],
    minTurnover:'₹8.00 Cr (avg. last 3 yrs)', minExperience:'2 similar contracts ≥ ₹3.0 Cr in last 5 yrs',
  },
  {
    id:'GEM/2026/B/4492013', title:'Procurement of Ruggedized Laptops for Field Survey Units', org:'Ministry of Rural Development',
    category:'IT Hardware', closingDate:'2026-09-22', status:'Verification In Progress',
    estimatedValue:'₹8.40 Crores', emdAmount:'₹16.80 Lakhs (Exempt for MSME)',
    description:'Supply of 1,200 ruggedized (MIL-STD-810H) laptops with 3-year onsite warranty for field data collection and GIS survey teams.',
    requirements:['gst','pan','udyam','itr','oem','mii','epfo','turnover','blacklist'],
    minTurnover:'₹5.00 Cr (avg. last 3 yrs)', minExperience:'1 similar contract ≥ ₹1.5 Cr in last 3 yrs',
  },
  {
    id:'GEM/2026/B/4501177', title:'Annual Maintenance Contract — Solar Street Lighting', org:'Tamil Nadu Energy Development Agency',
    category:'Works & Services', closingDate:'2026-09-12', status:'Awaiting Verification',
    estimatedValue:'₹3.20 Crores', emdAmount:'₹6.40 Lakhs',
    description:'AMC for 18,500 solar street lighting units across 6 districts, including battery replacement, inverter maintenance, and quarterly inspection.',
    requirements:['gst','pan','udyam','itr','epfo','experience','turnover','blacklist'],
    minTurnover:'₹2.00 Cr (avg. last 3 yrs)', minExperience:'1 similar AMC ≥ ₹80 Lakhs in last 3 yrs',
  },
  {
    id:'GEM/2026/B/4488654', title:'Supply of Steel Almirahs & Office Modular Storage', org:'Department of Revenue, Chennai',
    category:'Office Supplies', closingDate:'2026-09-09', status:'Verified',
    estimatedValue:'₹2.10 Crores', emdAmount:'₹4.20 Lakhs',
    description:'Supply and installation of 3,400 heavy-gauge steel almirahs and modular fire-resistant office storage units across taluk revenue offices.',
    requirements:['gst','pan','udyam','itr','epfo','turnover','blacklist'],
    minTurnover:'₹1.50 Cr (avg. last 3 yrs)', minExperience:'—',
  },
];

// ---------- 3. BIDDERS DATASET (10 REALISTIC BIDDERS) ----------
const BIDDERS = [
  // --- Ambulance tender bidders ---
  { id:'BID-10231', tenderId:'GEM/2026/B/4471829', company:'MedLine Mobility Systems Pvt. Ltd.', gstin:'33AABCM1234F1Z6', pan:'AABCM1234F', udyam:'UDYAM-TN-12-0004521', cin:'U34103TN2011PTC078451',
    score:84, risk:'MEDIUM', status:'Under Review', submittedOn:'2026-09-02', bidPrice:'₹17.80 Cr',
    trustId:'TP-IND-TN-2026-8841', trustScore:88, establishedYear:2011,
    address:'Plot 42, SIDCO Industrial Estate, Guindy, Chennai, Tamil Nadu - 600032',
    category:'Medium Enterprise (MSME)', authCapital:'₹5.00 Crores', paidUpCapital:'₹2.80 Crores',
    directors:[
      { name:'Rajesh Verma', din:'08421992', designation:'Managing Director', status:'ACTIVE / VERIFIED' },
      { name:'Sunita Verma', din:'09112844', designation:'Whole-time Director', status:'ACTIVE / VERIFIED' }
    ],
    turnoverHistory:[
      { fy:'FY 2023-24', amount:'₹9.40 Cr', status:'Audited & Filed' },
      { fy:'FY 2024-25', amount:'₹10.20 Cr', status:'Audited & Filed' },
      { fy:'FY 2025-26', amount:'₹9.20 Cr', status:'Audited & Filed' }
    ],
    gemPerformance:{ totalContracts:14, totalValue:'₹38.50 Cr', onTimeDelivery:'98.4%', rating:4.8, activeContracts:2 },
    pastContracts:[
      { orderNo:'GEMC-51168772910', buyer:'Tamil Nadu Medical Services Corp', item:'12 Type-B Ambulances', value:'₹3.20 Cr', year:'2024', status:'Completed / Satisfactory' },
      { orderNo:'GEMC-51168774881', buyer:'Govt Stanley Medical College Hospital', item:'Fabrication of Mobile ICU', value:'₹4.10 Cr', year:'2025', status:'Completed / Satisfactory' },
      { orderNo:'GEMC-51168776229', buyer:'Directorate of Public Health, Kerala', item:'8 Patient Transport Vans', value:'₹1.95 Cr', year:'2023', status:'Completed / Satisfactory' }
    ],
    trustBadges:[
      { name:'GSTN Verified', status:'ACTIVE', icon:'shield' },
      { name:'MSME Medium Enterprise', status:'ACTIVE', icon:'building' },
      { name:'Zero Debarment Flag', status:'CLEAN', icon:'badge-check' },
      { name:'ISO 9001:2015', status:'VERIFIED', icon:'check' }
    ],
    results:[
      req('gst','PASS','GST_Certificate.pdf','GSTIN active and matches bidder legal name on GSTN portal.',98),
      req('pan','PASS','PAN_Card.pdf','PAN verified against Income Tax e-Filing database; name match confirmed.',99),
      req('udyam','PASS','Udyam_Certificate.pdf','Valid Udyam registration under Medium Enterprise category.',96),
      req('itr','PASS','ITR_2023-25.pdf','3 years of ITR filed continuously; acknowledgement numbers verified.',93),
      req('oem','MISSING','—','No OEM authorization certificate uploaded for the ambulance chassis manufacturer.',0),
      req('mii','REVIEW','MII_Declaration.pdf','Self-certified Make in India declaration submitted, but local value-addition % not substantiated with CA BOM seal for > ₹10 Cr.',61),
      req('epfo','PASS','EPFO_ECR.pdf','EPFO establishment active; latest monthly ECR filed on time with 68 contributing employees.',95),
      req('experience','PASS','WorkOrders_Ambulance.pdf','2 completed contracts of ₹3.2 Cr and ₹4.1 Cr found, meeting eligibility threshold.',90),
      req('turnover','PASS','Audited_Financials_23-25.pdf','Average 3-year turnover of ₹9.6 Cr exceeds the ₹8 Cr threshold.',94),
      req('blacklist','CLEAR','GeM Debarment List','No match found on GeM / CVC blacklist registers as of verification date.',99),
    ]},
  { id:'BID-10245', tenderId:'GEM/2026/B/4471829', company:'Suryoday Health Vehicles LLP', gstin:'27AAFCS9087K1ZP', pan:'AAFCS9087K', udyam:'UDYAM-MH-03-0011287', cin:'AAJ-4471',
    score:52, risk:'HIGH', status:'Under Review', submittedOn:'2026-09-03', bidPrice:'₹16.40 Cr',
    trustId:'TP-IND-MH-2026-3104', trustScore:48, establishedYear:2019,
    address:'Unit 14, MIDC Industrial Area, Bhosari, Pune, Maharashtra - 411026',
    category:'Micro Enterprise (Expired Certificate)', authCapital:'₹1.00 Crore', paidUpCapital:'₹0.60 Crore',
    directors:[
      { name:'Suresh Kulkarni', din:'07221840', designation:'Designated Partner', status:'ACTIVE' },
      { name:'Anand Joshi', din:'08199245', designation:'Partner', status:'ACTIVE' }
    ],
    turnoverHistory:[
      { fy:'FY 2023-24', amount:'₹3.10 Cr', status:'Audited & Filed' },
      { fy:'FY 2024-25', amount:'₹2.80 Cr', status:'Self-Declared (Unaudited)' },
      { fy:'FY 2025-26', amount:'₹2.40 Cr', status:'Pending Audit' }
    ],
    gemPerformance:{ totalContracts:4, totalValue:'₹4.80 Cr', onTimeDelivery:'84.0%', rating:3.7, activeContracts:1 },
    pastContracts:[
      { orderNo:'GEMC-51168691024', buyer:'Pune Municipal Corporation Health Dept', item:'2 Mobile Dispensaries', value:'₹1.10 Cr', year:'2024', status:'Completed' }
    ],
    trustBadges:[
      { name:'GSTN Verified', status:'ACTIVE', icon:'shield' },
      { name:'MSME Certificate', status:'EXPIRED', icon:'alert' },
      { name:'Debarment Check', status:'CLEAN', icon:'badge-check' }
    ],
    results:[
      req('gst','PASS','GST_Certificate.pdf','GSTIN active; minor address mismatch flagged but within tolerance.',88),
      req('pan','PASS','PAN_Card.pdf','PAN verified; name matches with 1 abbreviation difference.',85),
      req('udyam','FAIL','Udyam_Cert_Expired.pdf','Udyam registration certificate expired on 2025-11-30.',97),
      req('itr','REVIEW','ITR_2024.pdf','Only 1 of 3 required years of ITR submitted.',55),
      req('oem','MISSING','—','OEM authorization not provided.',0),
      req('mii','FAIL','—','No Make in India declaration submitted.',0),
      req('epfo','REVIEW','EPFO_ECR.pdf','ECR filing gap detected for 2 consecutive quarters in 2025.',58),
      req('experience','FAIL','WorkOrders.pdf','Only 1 prior contract of ₹1.1 Cr found — below the ₹3 Cr eligibility threshold.',82),
      req('turnover','REVIEW','Financials_partial.pdf','Turnover figures self-declared; audited statement missing for FY 2024-25.',49),
      req('blacklist','CLEAR','GeM Debarment List','No active blacklisting found.',99),
    ]},
  { id:'BID-10258', tenderId:'GEM/2026/B/4471829', company:'Vaidya Motors & Engineering', gstin:'29AACCV4521Q1Z3', pan:'AACCV4521Q', udyam:'UDYAM-KA-08-0009123', cin:'U29100KA2015PTC081223',
    score:97, risk:'LOW', status:'Verified', submittedOn:'2026-09-01', bidPrice:'₹18.10 Cr',
    trustId:'TP-IND-KA-2026-9902', trustScore:98, establishedYear:2015,
    address:'Survey 88, Peenya Industrial Area 3rd Phase, Bengaluru, Karnataka - 560058',
    category:'Medium Enterprise (MSME)', authCapital:'₹10.00 Crores', paidUpCapital:'₹6.50 Crores',
    directors:[
      { name:'Dr. Ramesh Vaidya', din:'06109923', designation:'Managing Director', status:'ACTIVE / VERIFIED' },
      { name:'Vikram Vaidya', din:'07338190', designation:'Technical Director', status:'ACTIVE / VERIFIED' }
    ],
    turnoverHistory:[
      { fy:'FY 2023-24', amount:'₹13.80 Cr', status:'Audited & Verified' },
      { fy:'FY 2024-25', amount:'₹14.60 Cr', status:'Audited & Verified' },
      { fy:'FY 2025-26', amount:'₹14.20 Cr', status:'Audited & Verified' }
    ],
    gemPerformance:{ totalContracts:22, totalValue:'₹64.20 Cr', onTimeDelivery:'99.2%', rating:4.9, activeContracts:3 },
    pastContracts:[
      { orderNo:'GEMC-51168800124', buyer:'Dept of Health & Family Welfare, Karnataka', item:'35 Advanced Life Support Ambulances', value:'₹11.80 Cr', year:'2024', status:'Completed / Commended' },
      { orderNo:'GEMC-51168798112', buyer:'AIIMS New Delhi Transport Division', item:'6 Neonatal Transport Ambulances', value:'₹3.80 Cr', year:'2025', status:'Completed / Satisfactory' },
      { orderNo:'GEMC-51168765411', buyer:'Kerala Medical Services Corp Ltd', item:'18 Type-C ICU Ambulances', value:'₹6.20 Cr', year:'2023', status:'Completed / Satisfactory' }
    ],
    trustBadges:[
      { name:'GSTN Verified', status:'ACTIVE', icon:'shield' },
      { name:'MSME Valid', status:'ACTIVE', icon:'building' },
      { name:'Zero Debarment', status:'CLEAN', icon:'badge-check' },
      { name:'OEM Authorized', status:'VERIFIED', icon:'shield' },
      { name:'Class-1 MII (62%)', status:'ACTIVE', icon:'flag' }
    ],
    results:[
      req('gst','PASS','GST_Certificate.pdf','GSTIN active and verified against GSTN portal.',99),
      req('pan','PASS','PAN_Card.pdf','PAN verified; name match exact.',99),
      req('udyam','PASS','Udyam_Certificate.pdf','Valid registration under Medium Enterprise category.',98),
      req('itr','PASS','ITR_2023-25.pdf','3 consecutive years filed and verified.',97),
      req('oem','PASS','OEM_Authorization_TataMotors.pdf','Valid OEM authorization letter from chassis manufacturer, digitally signed.',95),
      req('mii','PASS','MII_Certificate_DPIIT.pdf','DPIIT-registered Make in India certificate with 62% local content, exceeding the 50% threshold.',96),
      req('epfo','PASS','EPFO_ECR.pdf','Establishment active; consistent ECR filing for 24 months.',97),
      req('experience','PASS','WorkOrders_Verified.pdf','3 completed contracts exceeding ₹3 Cr each, all verified with client confirmation letters.',95),
      req('turnover','PASS','Audited_Financials.pdf','Average turnover ₹14.2 Cr, well above threshold.',98),
      req('blacklist','CLEAR','GeM Debarment List','No blacklisting record found.',99),
    ]},

  // --- Laptop tender bidders ---
  { id:'BID-11032', tenderId:'GEM/2026/B/4492013', company:'Fortress Ruggedized Systems India', gstin:'07AAECF7841L1ZD', pan:'AAECF7841L', udyam:'UDYAM-DL-01-0003345', cin:'U72200DL2013PTC091223',
    score:89, risk:'LOW', status:'Verified', submittedOn:'2026-09-05', bidPrice:'₹8.15 Cr',
    trustId:'TP-IND-DL-2026-5512', trustScore:91, establishedYear:2013,
    address:'Tower B, Okhla Industrial Area Phase-II, New Delhi - 110020',
    category:'Small Enterprise (MSME)', authCapital:'₹3.00 Crores', paidUpCapital:'₹2.10 Crores',
    directors:[
      { name:'Manish Khanna', din:'06551209', designation:'Director', status:'ACTIVE / VERIFIED' },
      { name:'Pooja Khanna', din:'07118402', designation:'Director', status:'ACTIVE / VERIFIED' }
    ],
    turnoverHistory:[
      { fy:'FY 2023-24', amount:'₹6.40 Cr', status:'Audited & Filed' },
      { fy:'FY 2024-25', amount:'₹7.10 Cr', status:'Audited & Filed' },
      { fy:'FY 2025-26', amount:'₹6.90 Cr', status:'Audited & Filed' }
    ],
    gemPerformance:{ totalContracts:11, totalValue:'₹22.10 Cr', onTimeDelivery:'97.8%', rating:4.7, activeContracts:1 },
    pastContracts:[
      { orderNo:'GEMC-51168755102', buyer:'Geological Survey of India', item:'400 Rugged Tablets', value:'₹2.40 Cr', year:'2024', status:'Completed' },
      { orderNo:'GEMC-51168741009', buyer:'Survey of India, Dehradun', item:'250 MIL-STD Laptops', value:'₹1.80 Cr', year:'2023', status:'Completed' }
    ],
    trustBadges:[
      { name:'GSTN Verified', status:'ACTIVE', icon:'shield' },
      { name:'Small Enterprise', status:'ACTIVE', icon:'building' },
      { name:'OEM Direct', status:'VERIFIED', icon:'shield' }
    ],
    results:[
      req('gst','PASS','GST_Certificate.pdf','GSTIN active and verified.',98),
      req('pan','PASS','PAN_Card.pdf','PAN verified against IT e-Filing database.',99),
      req('udyam','PASS','Udyam_Certificate.pdf','Valid registration, Small Enterprise category.',95),
      req('itr','PASS','ITR_2023-25.pdf','3 years filed continuously.',93),
      req('oem','PASS','OEM_Authorization_Panasonic.pdf','Valid authorization letter for laptop supply and warranty support.',94),
      req('mii','REVIEW','MII_SelfDeclaration.pdf','Self-declared 34% local value addition; below preferential threshold, requires substantiation.',58),
      req('epfo','PASS','EPFO_ECR.pdf','Active establishment, timely filings.',96),
      req('turnover','PASS','Audited_Financials.pdf','Average turnover ₹6.8 Cr exceeds ₹5 Cr threshold.',95),
      req('blacklist','CLEAR','GeM Debarment List','No blacklisting record found.',99),
    ]},
  { id:'BID-11048', tenderId:'GEM/2026/B/4492013', company:'NorthStar Computing Devices', gstin:'19AAGCN2210P1Z9', pan:'AAGCN2210P', udyam:'UDYAM-WB-05-0007612', cin:'U30006WB2018PTC098654',
    score:38, risk:'HIGH', status:'Under Review', submittedOn:'2026-09-06', bidPrice:'₹7.40 Cr',
    trustId:'TP-IND-WB-2026-1189', trustScore:32, establishedYear:2018,
    address:'Sector V, Salt Lake City, Bidhannagar, Kolkata, West Bengal - 700091',
    category:'Small Enterprise (Suspended Standing)', authCapital:'₹2.00 Crores', paidUpCapital:'₹1.00 Crore',
    directors:[
      { name:'Debashis Roy', din:'08221940', designation:'Director', status:'FLAGGED LINKAGE' },
      { name:'Amitava Sen', din:'08441203', designation:'Director', status:'ACTIVE' }
    ],
    turnoverHistory:[
      { fy:'FY 2023-24', amount:'₹4.20 Cr', status:'Audited' },
      { fy:'FY 2024-25', amount:'₹3.10 Cr', status:'Unaudited' },
      { fy:'FY 2025-26', amount:'₹2.80 Cr', status:'Not Available' }
    ],
    gemPerformance:{ totalContracts:3, totalValue:'₹3.40 Cr', onTimeDelivery:'72.0%', rating:3.1, activeContracts:0 },
    pastContracts:[
      { orderNo:'GEMC-51168612099', buyer:'Kolkata Port Trust', item:'100 Office Desktop PCs', value:'₹68 Lakhs', year:'2023', status:'Delayed 60 Days' }
    ],
    trustBadges:[
      { name:'GSTN Status', status:'CANCELLED', icon:'alert' },
      { name:'Debarment List', status:'FLAGGED', icon:'ban' }
    ],
    results:[
      req('gst','FAIL','GST_Certificate.pdf','GSTIN found cancelled (suo-moto) as of 2026-06-14 on GSTN portal.',94),
      req('pan','PASS','PAN_Card.pdf','PAN verified.',96),
      req('udyam','REVIEW','Udyam_Cert.pdf','Udyam number format inconsistent with MSME registry records.',52),
      req('itr','FAIL','—','No ITR documents uploaded.',0),
      req('oem','MISSING','—','OEM authorization not submitted.',0),
      req('mii','FAIL','—','No Make in India declaration submitted.',0),
      req('epfo','FAIL','—','No active EPFO establishment found linked to PAN.',88),
      req('turnover','FAIL','Financials_unaudited.pdf','Submitted financials are unaudited and turnover falls short of ₹5 Cr threshold.',80),
      req('blacklist','FLAGGED','GeM Debarment List','Associated director found linked to a debarred entity in a separate GeM case.',77),
    ]},

  // --- Solar AMC bidders ---
  { id:'BID-12091', tenderId:'GEM/2026/B/4501177', company:'SunGrid Renewable Services', gstin:'33AAKCS3345H1ZX', pan:'AAKCS3345H', udyam:'UDYAM-TN-15-0006678', cin:'U40106TN2016PTC088712',
    score:91, risk:'LOW', status:'Not Started', submittedOn:'2026-09-04', bidPrice:'₹3.05 Cr',
    trustId:'TP-IND-TN-2026-4421', trustScore:92, establishedYear:2016,
    address:'Coimbatore IT Park, Avinashi Road, Coimbatore, Tamil Nadu - 641014',
    category:'Small Enterprise (MSME)', authCapital:'₹2.50 Crores', paidUpCapital:'₹1.80 Crores',
    directors:[
      { name:'K. Balasubramanian', din:'07412890', designation:'Managing Director', status:'ACTIVE / VERIFIED' },
      { name:'V. Natarajan', din:'07899124', designation:'Director (Operations)', status:'ACTIVE / VERIFIED' }
    ],
    turnoverHistory:[
      { fy:'FY 2023-24', amount:'₹3.10 Cr', status:'Audited & Filed' },
      { fy:'FY 2024-25', amount:'₹3.60 Cr', status:'Audited & Filed' },
      { fy:'FY 2025-26', amount:'₹3.50 Cr', status:'Audited & Filed' }
    ],
    gemPerformance:{ totalContracts:8, totalValue:'₹12.40 Cr', onTimeDelivery:'98.0%', rating:4.7, activeContracts:2 },
    pastContracts:[
      { orderNo:'GEMC-51168711902', buyer:'TANGEDCO Regional Circle', item:'AMC for 4,000 Solar Street Lights', value:'₹1.10 Cr', year:'2023', status:'Completed / Satisfactory' }
    ],
    trustBadges:[
      { name:'GSTN Verified', status:'ACTIVE', icon:'shield' },
      { name:'Small Enterprise', status:'ACTIVE', icon:'building' },
      { name:'Zero Debarment', status:'CLEAN', icon:'badge-check' }
    ],
    results:[
      req('gst','PASS','GST_Certificate.pdf','GSTIN active and verified.',97),
      req('pan','PASS','PAN_Card.pdf','PAN verified.',98),
      req('udyam','PASS','Udyam_Certificate.pdf','Valid registration, Small Enterprise category.',96),
      req('itr','PASS','ITR_2023-25.pdf','3 years filed continuously.',92),
      req('epfo','PASS','EPFO_ECR.pdf','Active and compliant.',95),
      req('experience','PASS','AMC_WorkOrder_2022.pdf','Prior AMC of ₹1.1 Cr for solar lighting verified with completion certificate.',91),
      req('turnover','PASS','Audited_Financials.pdf','Average turnover ₹3.4 Cr exceeds ₹2 Cr threshold.',93),
      req('blacklist','CLEAR','GeM Debarment List','No blacklisting record found.',99),
    ]},
  { id:'BID-12104', tenderId:'GEM/2026/B/4501177', company:'Tamil Nadu Solar Works', gstin:'33AAJCT8821G1Z1', pan:'AAJCT8821G', udyam:'UDYAM-TN-21-0002234', cin:'—',
    score:66, risk:'MEDIUM', status:'Not Started', submittedOn:'2026-09-05', bidPrice:'₹2.88 Cr',
    trustId:'TP-IND-TN-2026-2219', trustScore:68, establishedYear:2021,
    address:'Madurai Ring Road, Karuppayurani, Madurai, Tamil Nadu - 625020',
    category:'Micro Enterprise (Proprietorship)', authCapital:'₹50 Lakhs', paidUpCapital:'₹35 Lakhs',
    directors:[
      { name:'M. Chandrasekar', din:'—', designation:'Proprietor', status:'ACTIVE / VERIFIED' }
    ],
    turnoverHistory:[
      { fy:'FY 2023-24', amount:'₹2.10 Cr', status:'Audited & Filed' },
      { fy:'FY 2024-25', amount:'₹2.50 Cr', status:'Audited & Filed' },
      { fy:'FY 2025-26', amount:'₹2.30 Cr', status:'Self-Declared' }
    ],
    gemPerformance:{ totalContracts:3, totalValue:'₹2.10 Cr', onTimeDelivery:'90.0%', rating:4.1, activeContracts:1 },
    pastContracts:[
      { orderNo:'GEMC-51168699104', buyer:'Dindigul Municipality', item:'Solar Maintenance Contract', value:'₹65 Lakhs', year:'2024', status:'Completed' }
    ],
    trustBadges:[
      { name:'GSTN Active', status:'ACTIVE', icon:'shield' },
      { name:'Micro Enterprise', status:'ACTIVE', icon:'building' }
    ],
    results:[
      req('gst','PASS','GST_Certificate.pdf','GSTIN active and verified.',95),
      req('pan','PASS','PAN_Card.pdf','PAN verified.',96),
      req('udyam','PASS','Udyam_Certificate.pdf','Valid Micro Enterprise registration.',94),
      req('itr','REVIEW','ITR_2024-25.pdf','Only 2 of 3 required years available; FY 2022-23 return not located.',54),
      req('epfo','PASS','EPFO_ECR.pdf','Active establishment.',92),
      req('experience','REVIEW','WorkOrder_Partial.pdf','Prior contract value (₹65 L) marginally below the ₹80 L eligibility threshold.',60),
      req('turnover','PASS','Financials.pdf','Average turnover ₹2.3 Cr meets threshold.',89),
      req('blacklist','CLEAR','GeM Debarment List','No blacklisting record found.',99),
    ]},

  // --- Steel almirah tender ---
  { id:'BID-09884', tenderId:'GEM/2026/B/4488654', company:'Chola Steel Furniture Co.', gstin:'33AACCC2210L1Z7', pan:'AACCC2210L', udyam:'UDYAM-TN-09-0001129', cin:'U36101TN2005PTC055412',
    score:95, risk:'LOW', status:'Verified', submittedOn:'2026-08-29', bidPrice:'₹1.98 Cr',
    trustId:'TP-IND-TN-2026-7789', trustScore:96, establishedYear:2005,
    address:'Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    category:'Small Enterprise (MSME)', authCapital:'₹4.00 Crores', paidUpCapital:'₹3.20 Crores',
    directors:[
      { name:'K. Annamalai', din:'05199201', designation:'Managing Director', status:'ACTIVE / VERIFIED' },
      { name:'A. Karpagam', din:'06118402', designation:'Director', status:'ACTIVE / VERIFIED' }
    ],
    turnoverHistory:[
      { fy:'FY 2023-24', amount:'₹2.00 Cr', status:'Audited & Filed' },
      { fy:'FY 2024-25', amount:'₹2.20 Cr', status:'Audited & Filed' },
      { fy:'FY 2025-26', amount:'₹2.10 Cr', status:'Audited & Filed' }
    ],
    gemPerformance:{ totalContracts:19, totalValue:'₹28.40 Cr', onTimeDelivery:'99.0%', rating:4.9, activeContracts:1 },
    pastContracts:[
      { orderNo:'GEMC-51168744102', buyer:'Collectorate Office, Kanchipuram', item:'1,200 Steel Almirahs', value:'₹1.10 Cr', year:'2024', status:'Completed / Satisfactory' }
    ],
    trustBadges:[
      { name:'GSTN Verified', status:'ACTIVE', icon:'shield' },
      { name:'Small Enterprise', status:'ACTIVE', icon:'building' },
      { name:'Clean Debarment', status:'CLEAN', icon:'badge-check' }
    ],
    results:[
      req('gst','PASS','GST_Certificate.pdf','GSTIN active and verified.',98),
      req('pan','PASS','PAN_Card.pdf','PAN verified.',99),
      req('epfo','PASS','EPFO_ECR.pdf','Active and compliant.',96),
      req('itr','PASS','ITR_2023-25.pdf','3 years filed continuously.',94),
      req('turnover','PASS','Audited_Financials.pdf','Average turnover ₹2.1 Cr exceeds ₹1.5 Cr threshold.',95),
      req('blacklist','CLEAR','GeM Debarment List','No blacklisting record found.',99),
    ]},
  { id:'BID-09891', tenderId:'GEM/2026/B/4488654', company:'Anand Metal Industries', gstin:'33AABFA1123M1Z5', pan:'AABFA1123M', udyam:'UDYAM-TN-04-0000871', cin:'—',
    score:73, risk:'MEDIUM', status:'Verified', submittedOn:'2026-08-30', bidPrice:'₹1.85 Cr',
    trustId:'TP-IND-TN-2026-6632', trustScore:74, establishedYear:2017,
    address:'Salem Steel Plant Road, Salem, Tamil Nadu - 636013',
    category:'Micro Enterprise', authCapital:'₹80 Lakhs', paidUpCapital:'₹50 Lakhs',
    directors:[
      { name:'Anand Kumar', din:'—', designation:'Proprietor', status:'ACTIVE / VERIFIED' }
    ],
    turnoverHistory:[
      { fy:'FY 2023-24', amount:'₹1.40 Cr', status:'Audited & Filed' },
      { fy:'FY 2024-25', amount:'₹1.60 Cr', status:'Audited & Filed' },
      { fy:'FY 2025-26', amount:'₹1.50 Cr', status:'Audited & Filed' }
    ],
    gemPerformance:{ totalContracts:5, totalValue:'₹4.20 Cr', onTimeDelivery:'92.0%', rating:4.3, activeContracts:0 },
    pastContracts:[
      { orderNo:'GEMC-51168688190', buyer:'Taluk Office Salem', item:'Modular Office Storage Units', value:'₹75 Lakhs', year:'2023', status:'Completed' }
    ],
    trustBadges:[
      { name:'GSTN Active', status:'ACTIVE', icon:'shield' },
      { name:'Micro Enterprise', status:'ACTIVE', icon:'building' }
    ],
    results:[
      req('gst','PASS','GST_Certificate.pdf','GSTIN active and verified.',96),
      req('pan','PASS','PAN_Card.pdf','PAN verified.',97),
      req('epfo','REVIEW','EPFO_ECR.pdf','One quarter of ECR filing delayed by 41 days.',57),
      req('itr','PASS','ITR_2023-25.pdf','3 years filed continuously.',91),
      req('turnover','REVIEW','Financials.pdf','Turnover just below threshold in FY 2023-24, recovered in FY 2024-25.',55),
      req('blacklist','CLEAR','GeM Debarment List','No blacklisting record found.',98),
    ]},
];

// ---------- 4. SIMULATED OCR DOCUMENT EVIDENCE & BOUNDING BOXES ----------
const DOCUMENT_EVIDENCE = {
  'gst': {
    title: 'FORM GST REG-06 — Registration Certificate',
    docType: 'Government Tax Registration',
    issuer: 'Government of India / State Tax Department',
    hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    pages: 3,
    fields: [
      { name:'Registration Number (GSTIN)', extracted:'33AABCM1234F1Z6', groundTruth:'33AABCM1234F1Z6 (Active on GSTN)', confidence:98.4, status:'PASS', box:{top:'24%',left:'18%',width:'38%',height:'5.5%'} },
      { name:'Legal Name of Business', extracted:'MEDLINE MOBILITY SYSTEMS PVT. LTD.', groundTruth:'MedLine Mobility Systems Pvt. Ltd.', confidence:99.1, status:'PASS', box:{top:'32%',left:'18%',width:'55%',height:'5.5%'} },
      { name:'Trade Name', extracted:'MEDLINE MOBILITY', groundTruth:'MEDLINE MOBILITY', confidence:97.8, status:'PASS', box:{top:'40%',left:'18%',width:'45%',height:'5.5%'} },
      { name:'Date of Liability / Validity', extracted:'01/07/2017 to Regular (Continuous)', groundTruth:'Valid Regular Taxpayer', confidence:98.0, status:'PASS', box:{top:'48%',left:'18%',width:'42%',height:'5.5%'} },
      { name:'Principal Place of Business', extracted:'Plot 42, SIDCO Industrial Estate, Guindy, Chennai, TN - 600032', groundTruth:'SIDCO Guindy, Chennai - 600032', confidence:96.2, status:'PASS', box:{top:'56%',left:'18%',width:'65%',height:'7.5%'} }
    ],
    ocrSnippet: "GOVERNMENT OF INDIA\nCENTRAL GOODS AND SERVICES TAX ACT, 2017\nRegistration Certificate (Form GST REG-06)\nRegistration Number: 33AABCM1234F1Z6\nLegal Name: MEDLINE MOBILITY SYSTEMS PVT. LTD.\nConstitution of Business: Private Limited Company\nAddress: Plot 42, SIDCO Industrial Estate, Guindy, Chennai, TN - 600032\nDate of issue of Certificate: 28/06/2017\nStatus: Regular Taxpayer [VERIFIED]"
  },
  'pan': {
    title: 'INCOME TAX DEPARTMENT — Permanent Account Number Card',
    docType: 'Corporate Tax Identity Card',
    issuer: 'Income Tax Department, Govt of India',
    hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    pages: 1,
    fields: [
      { name:'Permanent Account Number', extracted:'AABCM1234F', groundTruth:'AABCM1234F (Valid & Active)', confidence:99.6, status:'PASS', box:{top:'42%',left:'16%',width:'42%',height:'6.5%'} },
      { name:'Entity Name', extracted:'MEDLINE MOBILITY SYSTEMS PVT LTD', groundTruth:'MedLine Mobility Systems Pvt. Ltd.', confidence:99.2, status:'PASS', box:{top:'26%',left:'16%',width:'58%',height:'6.5%'} },
      { name:'Date of Incorporation', extracted:'14/03/2011', groundTruth:'14/03/2011 (Matches MCA Master Data)', confidence:98.5, status:'PASS', box:{top:'54%',left:'16%',width:'35%',height:'6%'} }
    ],
    ocrSnippet: "INCOME TAX DEPARTMENT\nGOVT. OF INDIA\nPERMANENT ACCOUNT NUMBER CARD\nName: MEDLINE MOBILITY SYSTEMS PVT LTD\nIncorporation Date: 14/03/2011\nPAN: AABCM1234F\nCategory: Company\nDigitally Verified via NSDL / IT e-Filing API"
  },
  'udyam': {
    title: 'UDYAM REGISTRATION CERTIFICATE',
    docType: 'Ministry of MSME Government of India',
    issuer: 'Ministry of Micro, Small and Medium Enterprises',
    hash: 'sha256:1a8565a9da970e2613a5a39f7529129d767623cf555e4ec295325330f31aa497',
    pages: 2,
    fields: [
      { name:'Udyam Registration Number', extracted:'UDYAM-TN-12-0004521', groundTruth:'UDYAM-TN-12-0004521 (Active)', confidence:97.8, status:'PASS', box:{top:'26%',left:'16%',width:'50%',height:'6%'} },
      { name:'Enterprise Classification', extracted:'MEDIUM ENTERPRISE', groundTruth:'Medium (Investment: ₹18.4 Cr, Turnover: ₹38.2 Cr)', confidence:96.5, status:'PASS', box:{top:'35%',left:'16%',width:'46%',height:'6%'} },
      { name:'Major Activity', extracted:'MANUFACTURING (Ambulance Bodies, Special Purpose Vehicles)', groundTruth:'NIC 29109 - Manufacture of special purpose motor vehicles', confidence:95.2, status:'PASS', box:{top:'45%',left:'16%',width:'62%',height:'7.5%'} },
      { name:'Date of Commencement', extracted:'18/04/2011', groundTruth:'18/04/2011', confidence:98.0, status:'PASS', box:{top:'56%',left:'16%',width:'34%',height:'6%'} }
    ],
    ocrSnippet: "MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES\nUDYAM REGISTRATION CERTIFICATE\nUDYAM REGISTRATION NUMBER: UDYAM-TN-12-0004521\nNAME OF ENTERPRISE: M/S MEDLINE MOBILITY SYSTEMS PRIVATE LIMITED\nTYPE OF ENTERPRISE: MEDIUM\nMAJOR ACTIVITY: MANUFACTURING\nNIC 2 Digit: 29 - Manufacture of motor vehicles, trailers and semi-trailers\nDIC: CHENNAI\nDate of Udyam Registration: 12/08/2020"
  },
  'mii': {
    title: 'MAKE IN INDIA (MII) SELF-DECLARATION CERTIFICATE',
    docType: 'Local Content Preference Declaration',
    issuer: 'Self-Certification / Chartered Accountant Endorsement',
    hash: 'sha256:8b1a9953c4611296a827abf8c47804d7ecd3c4914a3875323a9d94943f5546b5',
    pages: 2,
    fields: [
      { name:'Local Value Addition %', extracted:'58% Local Content (Declared without BOM cost audit)', groundTruth:'Threshold: Min 50% for Class-1 Local Supplier', confidence:61.4, status:'REVIEW', box:{top:'38%',left:'16%',width:'62%',height:'7.5%'} },
      { name:'Manufacturing Location', extracted:'Plot 42, SIDCO Guindy, Chennai', groundTruth:'Matches principal registered place', confidence:94.0, status:'PASS', box:{top:'50%',left:'16%',width:'55%',height:'6%'} },
      { name:'CA Certificate Attachment', extracted:'NOT ATTACHED (Missing Annexure-B Cost Accountant Seal)', groundTruth:'Required for tender value > ₹10 Cr', confidence:88.0, status:'REVIEW', box:{top:'60%',left:'16%',width:'65%',height:'7.5%'} }
    ],
    ocrSnippet: "AFFIDAVIT / DECLARATION UNDER PUBLIC PROCUREMENT (PREFERENCE TO MAKE IN INDIA) ORDER 2017\nWe, MedLine Mobility Systems Pvt. Ltd., hereby declare that the local content in Type-C Ambulances is 58%.\nLocation of value addition: Guindy, Chennai.\nNote: CA Certificate not enclosed in uploaded PDF."
  },
  'itr': {
    title: 'ITR-V INCOME TAX RETURN VERIFICATION (3 YEARS)',
    docType: 'Central Board of Direct Taxes',
    issuer: 'Income Tax Department e-Filing Portal',
    hash: 'sha256:cb2e59e99a8039e142f88a23072b21703666d6c2a441e8f237bf36f98018241d',
    pages: 3,
    fields: [
      { name:'Assessment Years Submitted', extracted:'AY 2023-24, AY 2024-25, AY 2025-26', groundTruth:'3 consecutive returns confirmed', confidence:96.8, status:'PASS', box:{top:'28%',left:'16%',width:'54%',height:'6%'} },
      { name:'Gross Total Income (FY 24-25)', extracted:'₹1,42,80,000 (Tax Paid: ₹36,41,400)', groundTruth:'E-filing Ack: 894120048128912', confidence:94.0, status:'PASS', box:{top:'40%',left:'16%',width:'58%',height:'6.5%'} },
      { name:'Filing Status / E-verification', extracted:'E-VERIFIED WITH DIGITAL SIGNATURE', groundTruth:'ITR-6 Verified successfully', confidence:99.0, status:'PASS', box:{top:'52%',left:'16%',width:'52%',height:'6%'} }
    ],
    ocrSnippet: "INDIAN INCOME TAX RETURN VERIFICATION FORM (ITR-V)\nAssessment Year: 2025-26 (Financial Year 2024-25)\nPAN: AABCM1234F | Form: ITR-6 (Companies other than claiming exemption)\nTotal Income: Rs. 1,42,80,000\nFiling Date: 28/10/2025 | Ack No: 894120048128912\nStatus: E-Verified via DSC"
  },
  'turnover': {
    title: 'AUDITED FINANCIAL STATEMENTS & CA TURNOVER CERTIFICATE',
    docType: 'Audited Balance Sheets & Profit & Loss',
    issuer: 'S. Ramanathan & Co., Chartered Accountants (FRN: 004128S)',
    hash: 'sha256:7c9e0d14878a1a36746ef858a8a429074b12c1fe4177d61245050f2256ff4ef0',
    pages: 6,
    fields: [
      { name:'FY 2022-23 Revenue', extracted:'₹8.90 Cr', groundTruth:'Audited P&L Line 1', confidence:95.0, status:'PASS', box:{top:'30%',left:'16%',width:'35%',height:'5.5%'} },
      { name:'FY 2023-24 Revenue', extracted:'₹9.45 Cr', groundTruth:'Audited P&L Line 1', confidence:95.5, status:'PASS', box:{top:'38%',left:'16%',width:'35%',height:'5.5%'} },
      { name:'FY 2024-25 Revenue', extracted:'₹10.45 Cr', groundTruth:'Audited P&L Line 1', confidence:96.0, status:'PASS', box:{top:'46%',left:'16%',width:'35%',height:'5.5%'} },
      { name:'3-Year Average Turnover', extracted:'₹9.60 Cr (Meets Tender Min ₹8.0 Cr)', groundTruth:'Eligibility Threshold ₹8.0 Cr satisfied', confidence:97.2, status:'PASS', box:{top:'56%',left:'16%',width:'62%',height:'7%'} },
      { name:'UDIN Number', extracted:'UDIN: 25048129AAAAEF8912', groundTruth:'UDIN Verified on ICAI Portal', confidence:98.4, status:'PASS', box:{top:'66%',left:'16%',width:'52%',height:'6%'} }
    ],
    ocrSnippet: "CA TURNOVER & NET WORTH CERTIFICATE\nTo Whomsoever It May Concern\nThis is to certify that M/s MedLine Mobility Systems Pvt. Ltd. has recorded the following turnover:\nFY 2022-23: Rs. 8,90,12,000\nFY 2023-24: Rs. 9,45,40,000\nFY 2024-25: Rs. 10,45,10,000\nAverage Turnover: Rs. 9.60 Crores\nUDIN: 25048129AAAAEF8912 | CA Seal & Signature Verified"
  },
  'experience': {
    title: 'PAST EXPERIENCE & WORK ORDER COMPLETION CERTIFICATES',
    docType: 'Client Completion Certificates',
    issuer: 'State Health Society, Govt of Kerala & TN Medical Services Corp',
    hash: 'sha256:d8a2a90184b2fe11f92e0783307613589b3f3e1b7829707e7811ef6f03e6718d',
    pages: 4,
    fields: [
      { name:'Contract 1 (TNMSC)', extracted:'Supply of 18 ALS Ambulances, Order Value: ₹4.10 Cr (Completed 2024)', groundTruth:'Tender min threshold: ≥ ₹3.0 Cr', confidence:94.5, status:'PASS', box:{top:'32%',left:'16%',width:'64%',height:'7%'} },
      { name:'Contract 2 (KMSCL)', extracted:'Fabrication of 14 Mobile Medical Units: ₹3.20 Cr (Completed 2023)', groundTruth:'Tender min threshold: ≥ ₹3.0 Cr', confidence:93.0, status:'PASS', box:{top:'44%',left:'16%',width:'64%',height:'7%'} },
      { name:'Client Satisfaction Letters', extracted:'Attached with official Govt stamp & endorsement', groundTruth:'Work Order Satisfactorily Executed', confidence:91.5, status:'PASS', box:{top:'56%',left:'16%',width:'58%',height:'6%'} }
    ],
    ocrSnippet: "TAMIL NADU MEDICAL SERVICES CORPORATION LTD.\nWORK COMPLETION CERTIFICATE\nRef: TNMSC/EQ/2023-24/AMB-09\nCertified that MedLine Mobility Systems Pvt. Ltd. has successfully supplied, fabricated and delivered 18 Type-C ALS Ambulances valuing Rs. 4,10,40,000/- with satisfactory performance."
  },
  'epfo': {
    title: 'EPFO ELECTRONIC CHALLAN RETURN (ECR) & PAYMENT RECEIPT',
    docType: 'Employees Provident Fund Organization',
    issuer: 'Ministry of Labour & Employment, Govt of India',
    hash: 'sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    pages: 2,
    fields: [
      { name:'Establishment ID', extracted:'TBCH1004812000', groundTruth:'TBCH1004812000 (Active Guindy Ro)', confidence:97.2, status:'PASS', box:{top:'28%',left:'16%',width:'48%',height:'6%'} },
      { name:'Contributing Employees', extracted:'68 Members (Wage Month: 07/2026)', groundTruth:'Payment Confirmed via CRN', confidence:96.0, status:'PASS', box:{top:'38%',left:'16%',width:'52%',height:'6%'} },
      { name:'Challan Payment Status', extracted:'PAID ON TIME (14/08/2026)', groundTruth:'Transaction ID: 084128912901', confidence:98.5, status:'PASS', box:{top:'48%',left:'16%',width:'50%',height:'6%'} }
    ],
    ocrSnippet: "EMPLOYEES' PROVIDENT FUND ORGANISATION\nELECTRONIC CHALLAN CUM RETURN (ECR)\nEstablishment Code: TBCH1004812000\nEstablishment Name: MEDLINE MOBILITY SYSTEMS PRIVATE LIMITED\nWage Month: JUL-2026 | TRRN: 8941208912\nTotal Remitted: Rs. 3,84,210/- | Status: Paid & Confirmed"
  },
  'oem': {
    title: 'MANUFACTURER AUTHORIZATION FORM (MAF)',
    docType: 'OEM Direct Authorization Letter',
    issuer: 'Tata Motors Commercial Vehicles Ltd. / Mahindra Special Vehicles',
    hash: 'sha256:4a9c8b7762a5e1009bf3d941290a184e5b9f91a2731804c4b92b11fa20849921',
    pages: 1,
    fields: [
      { name:'Authorization Status', extracted:'MISSING IN UPLOADED PACKAGE', groundTruth:'Direct MAF Letter on OEM Letterhead Required', confidence:0.0, status:'FAIL', box:{top:'30%',left:'16%',width:'65%',height:'10%'} },
      { name:'Tender Reference', extracted:'NOT SPECIFIED', groundTruth:'GEM/2026/B/4471829', confidence:0.0, status:'FAIL', box:{top:'45%',left:'16%',width:'50%',height:'6%'} }
    ],
    ocrSnippet: "[DOCUMENT NOT FOUND IN SUBMITTED BID PACKAGE]\nMandatory OEM Authorization Letter required under Clause 5.2 for Ambulance Chassis fabrication."
  }
};

// ---------- 5. SIMULATED LIVE GOVERNMENT API RESPONSE PAYLOADS (MODE 2) ----------
const MOCK_API_PAYLOADS = {
  'gst': {
    source: 'GSTN (Goods and Services Tax Network)',
    endpoint: 'GET https://api.gstn.gov.in/taxpayer/v1.2/33AABCM1234F1Z6',
    responseTime: '184ms',
    status: 200,
    headers: { 'X-RateLimit-Remaining': '984', 'Content-Type': 'application/json; charset=utf-8' },
    body: {
      "status": "SUCCESS",
      "data": {
        "gstin": "33AABCM1234F1Z6",
        "legalName": "MEDLINE MOBILITY SYSTEMS PRIVATE LIMITED",
        "tradeName": "MEDLINE MOBILITY",
        "registrationDate": "2017-07-01",
        "status": "Active",
        "taxpayerType": "Regular",
        "jurisdiction": "STATE - CHENNAI SOUTH, ZONE-IX",
        "einvoiceEnabled": true,
        "complianceRating": "10/10",
        "filingHistory": [
          { "returnType": "GSTR-3B", "period": "072026", "status": "FILED", "dof": "2026-08-18" },
          { "returnType": "GSTR-1", "period": "072026", "status": "FILED", "dof": "2026-08-10" }
        ]
      }
    }
  },
  'pan': {
    source: 'Income Tax Department (e-Filing v2.0)',
    endpoint: 'POST https://api.incometax.gov.in/pan-val/v2/entity-verify',
    responseTime: '210ms',
    status: 200,
    headers: { 'X-Trace-ID': 'ITD-TRACE-884129', 'Content-Type': 'application/json' },
    body: {
      "pan": "AABCM1234F",
      "panStatus": "EXISTING AND VALID",
      "nameOnCard": "MEDLINE MOBILITY SYSTEMS PRIVATE LIMITED",
      "category": "COMPANY",
      "aadhaarSeeded": "NOT APPLICABLE",
      "lastUpdated": "2026-04-12",
      "nameMatchPercentage": 99.4
    }
  },
  'udyam': {
    source: 'Ministry of MSME (Udyam National Portal)',
    endpoint: 'GET https://udyamregistration.gov.in/api/v1/verify/UDYAM-TN-12-0004521',
    responseTime: '320ms',
    status: 200,
    headers: { 'X-Cache': 'MISS', 'Content-Type': 'application/json' },
    body: {
      "udyamRegistrationNumber": "UDYAM-TN-12-0004521",
      "enterpriseName": "MEDLINE MOBILITY SYSTEMS PRIVATE LIMITED",
      "organisationType": "Private Limited Company",
      "enterpriseClass": "Medium",
      "majorActivity": "Manufacturing",
      "validFrom": "2020-08-12",
      "validUpto": "PERMANENT (SUBJECT TO ANNUAL ITR/GST UPDATION)",
      "investmentInPlantMachinery": "18.42 Cr",
      "netTurnover": "38.20 Cr",
      "status": "VALID_ACTIVE"
    }
  },
  'epfo': {
    source: 'EPFO Shram Suvidha Portal API',
    endpoint: 'GET https://unifiedportal-epfo.epfindia.gov.in/api/est/TBCH1004812000',
    responseTime: '265ms',
    status: 200,
    headers: { 'X-Powered-By': 'NIC-EPFO-Cloud', 'Content-Type': 'application/json' },
    body: {
      "establishmentId": "TBCH1004812000",
      "establishmentName": "MEDLINE MOBILITY SYSTEMS PRIVATE LIMITED",
      "officeName": "RO CHENNAI SOUTH",
      "exemptionStatus": "UNEXEMPTED",
      "activeMembers": 68,
      "lastEcrWageMonth": "07-2026",
      "lastPaymentDate": "2026-08-14",
      "defaultHistory": "NO_DEFAULTS_FOUND"
    }
  },
  'blacklist': {
    source: 'GeM Unified Debarment & CVC Watchlist',
    endpoint: 'POST https://gem.gov.in/api/debarment-registry/cross-screen',
    responseTime: '145ms',
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      "screenQuery": { "pan": "AABCM1234F", "cin": "U34103TN2011PTC078451", "gstin": "33AABCM1234F1Z6" },
      "geMDebarmentDatabase": { "matchFound": false, "recordsChecked": 4128 },
      "cvcBlacklistRegistry": { "matchFound": false, "recordsChecked": 1892 },
      "ministrySpecificBans": { "matchFound": false, "stateTNChecked": true },
      "finalDebarmentStatus": "CLEAR_NO_RECORDS"
    }
  }
};

// ---------- 6. MACHINE LEARNING MODEL SPECIFICATION & INFERENCE ENGINE (FROM MODAL.TXT) ----------
const ML_MODEL_SPECS = {
  name: 'Random Forest Classifier (Clean Baseline)',
  algorithm: 'Ensemble Random Forest (100 Trees, Gini Impurity, n_jobs=-1)',
  datasetSize: 200000,
  trainSamples: 160000,
  testSamples: 40000,
  accuracy: 99.82,
  precision: 99.82,
  recall: 99.82,
  f1Score: 99.82,
  leakagePrevented: ['compliance_score', 'risk_level'],
  topFeatures: [
    { name: 'turnover_required_inr', importance: 0.245, desc: 'Tender Financial Threshold' },
    { name: 'tender_value_inr', importance: 0.218, desc: 'Tender Contract Estimated Value' },
    { name: 'gstin_valid', importance: 0.165, desc: 'GSTIN Active Regular Standing' },
    { name: 'mismatch_type_GSTIN-PAN mismatch', importance: 0.092, desc: 'Tax Identity Inconsistency' },
    { name: 'pan_valid', importance: 0.078, desc: 'PAN Identity Validation' },
    { name: 'document_status_Verified', importance: 0.054, desc: 'OCR Document Verification Ground Truth' },
    { name: 'document_status_Rejected', importance: 0.048, desc: 'Invalid / Rejected Document Detection' },
    { name: 'udyam_valid', importance: 0.035, desc: 'MSME Udyam Active Registry Status' },
    { name: 'udyam_present', importance: 0.024, desc: 'MSME Certificate Enclosure' },
    { name: 'document_type_flagged_Invalid', importance: 0.016, desc: 'Document Forgery / Tamper Flag' },
    { name: 'tender_category_Construction', importance: 0.009, desc: 'High-Value Infrastructure Sector' },
    { name: 'tender_category_IT & Computers', importance: 0.007, desc: 'Technology & Hardware Sector' },
    { name: 'tender_category_Office Supplies', importance: 0.005, desc: 'Standard Goods & Furniture' },
    { name: 'document_status_Pending', importance: 0.003, desc: 'Incomplete Verification Submission' },
    { name: 'document_type_flagged_Address Proof', importance: 0.001, desc: 'Address Mismatch Indicator' }
  ],
  confusionMatrix: {
    labels: ['Compliant', 'Minor Issue', 'Non-Compliant'],
    matrix: [
      [15980, 12, 8],
      [14, 11950, 36],
      [2, 18, 11980]
    ]
  }
};

// JavaScript implementation of the Random Forest Inference Pipeline from modal.txt
function predictComplianceML(inputs) {
  const {
    tender_category = 'IT & Computers',
    tender_value_inr = 5000000,
    turnover_required_inr = 3000000,
    gstin_valid = true,
    pan_valid = true,
    udyam_present = true,
    udyam_valid = true,
    document_type_flagged = 'None',
    document_status = 'Verified',
    mismatch_type = 'None'
  } = inputs;

  let score = 100;
  let reasons = [];

  // 1. GST & PAN Critical Checks
  if (!gstin_valid) {
    score -= 42;
    reasons.push('Invalid / Cancelled GSTIN');
  }
  if (!pan_valid) {
    score -= 38;
    reasons.push('Invalid Corporate PAN');
  }

  // 2. Mismatch checks
  if (mismatch_type === 'GSTIN-PAN mismatch') {
    score -= 35;
    reasons.push('Critical GSTIN-PAN identity discrepancy');
  } else if (mismatch_type === 'Verification mismatch') {
    score -= 20;
    reasons.push('Portal verification mismatch flagged');
  } else if (mismatch_type === 'Address Mismatch') {
    score -= 10;
    reasons.push('Registered address mismatch between tax & ROC');
  }

  // 3. Document status
  if (document_status === 'Rejected') {
    score -= 40;
    reasons.push('Submitted technical document was rejected');
  } else if (document_status === 'Pending') {
    score -= 18;
    reasons.push('Document verification pending / incomplete');
  }

  // 4. Document flag
  if (document_type_flagged === 'Invalid') {
    score -= 30;
    reasons.push('Flagged invalid document type');
  } else if (document_type_flagged === 'Address Proof') {
    score -= 8;
    reasons.push('Address proof requires manual officer review');
  }

  // 5. MSME Udyam status
  if (!udyam_present) {
    score -= 5;
  } else if (!udyam_valid) {
    score -= 15;
    reasons.push('Expired or invalid Udyam registration number');
  }

  // 6. Turnover vs Tender value heuristic
  if (turnover_required_inr > 0 && tender_value_inr > 0) {
    if (turnover_required_inr > tender_value_inr * 1.5) {
      score -= 12;
      reasons.push('High financial standing requirement relative to tender value');
    }
  }

  score = Math.max(0, Math.min(100, score));

  // Determine prediction & probabilities matching Random Forest distribution
  let prediction = 'compliant';
  let risk = 'Low';
  let probabilities = { compliant: 98.4, minor_issue: 1.2, non_compliant: 0.4 };

  if (score < 60 || !gstin_valid || !pan_valid || document_status === 'Rejected' || mismatch_type === 'GSTIN-PAN mismatch') {
    prediction = 'non_compliant';
    risk = 'High';
    probabilities = { compliant: 0.8, minor_issue: 4.2, non_compliant: 95.0 };
  } else if (score < 82 || !udyam_valid || document_status === 'Pending' || document_type_flagged !== 'None' || mismatch_type !== 'None') {
    prediction = 'minor_issue';
    risk = 'Medium';
    probabilities = { compliant: 8.5, minor_issue: 86.5, non_compliant: 5.0 };
  }

  const recommendationMapping = {
    compliant: "Bidder appears fully compliant. All statutory documents and portal validations matched. Proceed with verification approval.",
    minor_issue: "Minor compliance issues detected. Review pending requirements and consider clarification notice before approval.",
    non_compliant: "Major compliance issues detected. Manual review and technical disqualification recommended."
  };

  const confidence = probabilities[prediction];

  return {
    prediction,
    confidence,
    risk,
    score,
    probabilities,
    recommendation: recommendationMapping[prediction],
    issuesDetected: reasons.length ? reasons.join(', ') : 'None'
  };
}

// ---------- 7. MOCK EXTERNAL SCRAPING PORTAL (CELL 23-28 IN MODAL.TXT) ----------
const MOCK_SCRAPED_PORTAL_DB = [
  { bidder: 'ABC Technologies Pvt Ltd', gstin: 'VALID', pan: 'VALID', udyam: 'VALID', status: 'VERIFIED' },
  { bidder: 'XYZ Construction Ltd', gstin: 'INVALID', pan: 'INVALID', udyam: 'NOT FOUND', status: 'REJECTED' },
  { bidder: 'Global Office Solutions', gstin: 'VALID', pan: 'VALID', udyam: 'PENDING', status: 'REVIEW' },
  { bidder: 'MedLine Mobility Systems Pvt. Ltd.', gstin: 'VALID', pan: 'VALID', udyam: 'VALID', status: 'VERIFIED' },
  { bidder: 'Suryoday Health Vehicles LLP', gstin: 'VALID', pan: 'VALID', udyam: 'EXPIRED', status: 'REVIEW' },
  { bidder: 'NorthStar Computing Devices', gstin: 'INVALID', pan: 'VALID', udyam: 'NOT FOUND', status: 'REJECTED' },
];

function runMockWebScraperVerification() {
  return MOCK_SCRAPED_PORTAL_DB.map(row => {
    let issues = [];
    if (row.gstin !== 'VALID') issues.push('GSTIN issue');
    if (row.pan !== 'VALID') issues.push('PAN issue');
    if (row.udyam !== 'VALID') issues.push('Udyam issue');
    if (row.status !== 'VERIFIED') issues.push('Portal verification issue');

    const crossVerification = issues.length === 0 ? 'MATCHED' : 'MISMATCH';
    let complianceStatus = 'compliant';
    let riskLevel = 'Low';
    let recommendation = 'All external verification details matched.';

    if (issues.includes('GSTIN issue') && issues.includes('PAN issue')) {
      complianceStatus = 'non_compliant';
      riskLevel = 'High';
      recommendation = 'Critical identity verification mismatch detected.';
    } else if (issues.length > 0) {
      complianceStatus = 'minor_issue';
      riskLevel = 'Medium';
      recommendation = 'Manual review required for detected verification issues.';
    }

    // Call ML prediction from scraped features
    const mlPred = predictComplianceML({
      tender_category: 'IT & Computers',
      tender_value_inr: 5000000,
      turnover_required_inr: 3000000,
      gstin_valid: row.gstin === 'VALID',
      pan_valid: row.pan === 'VALID',
      udyam_present: row.udyam !== 'NOT FOUND',
      udyam_valid: row.udyam === 'VALID',
      document_type_flagged: 'None',
      document_status: row.status === 'VERIFIED' ? 'Verified' : row.status === 'REJECTED' ? 'Rejected' : 'Pending',
      mismatch_type: crossVerification === 'MISMATCH' ? 'Verification mismatch' : 'None'
    });

    return {
      bidder: row.bidder,
      gstin: row.gstin,
      pan: row.pan,
      udyam: row.udyam,
      portalStatus: row.status,
      crossVerification,
      issuesDetected: issues.length ? issues.join(', ') : 'None',
      ruleBasedStatus: complianceStatus,
      riskLevel,
      aiPrediction: mlPred.prediction,
      confidence: `${mlPred.confidence.toFixed(2)}%`,
      recommendation
    };
  });
}

// ---------- 8. CARTEL & COLLUSION DETECTION GRAPH DATA ----------
const CARTEL_DETECTION_DATA = {
  totalAnalyzedBids: 184,
  clustersDetected: 2,
  highRiskCartels: [
    {
      id: 'CLUST-01',
      tenderId: 'GEM/2026/B/4492013',
      pattern: 'Common Director DIN & IP Address Submissions',
      risk: 'CRITICAL HIGH',
      bidders: ['NorthStar Computing Devices', 'Apex Byte Informatics LLP'],
      indicators: [
        'Shared Director: Debashis Roy (DIN: 08221940)',
        'Bid Submission from Identical IP Subnet: 114.31.240.xx within 4 minutes',
        'Price Quote variance only 0.8% (Indicative of Bid Rigging / Cover Bidding)',
        'Bank Guarantee issued from identical branch in Kolkata'
      ],
      recommendation: 'Immediate alert routed to GeM Debarment Cell and Competition Commission of India (CCI) monitoring.'
    },
    {
      id: 'CLUST-02',
      tenderId: 'GEM/2026/B/4488654',
      pattern: 'Rotational Bidding History Pattern',
      risk: 'MEDIUM MONITORING',
      bidders: ['Anand Metal Industries', 'Kaveri Steel Fabricators'],
      indicators: [
        'Alternate winner pattern observed across last 4 district municipal tenders',
        'Identical subcontractor listed for powder-coating facilities'
      ],
      recommendation: 'Officer review required before contract award.'
    }
  ]
};

// ---------- 9. AUDIT TRAIL LOGS ----------
const AUDIT_TRAIL = [
  { date:'2026-09-08 14:32', bidder:'MedLine Mobility Systems Pvt. Ltd.', requirement:'OEM Authorization', action:'AI flagged as MISSING', source:'Document Extraction Engine (Mode 1)', result:'MISSING', officer:'System (AI OCR)' },
  { date:'2026-09-08 14:32', bidder:'MedLine Mobility Systems Pvt. Ltd.', requirement:'Make in India Certificate', action:'Cross-verification completed', source:'DPIIT Registry (Mode 2)', result:'REVIEW', officer:'System (AI)' },
  { date:'2026-09-08 14:40', bidder:'MedLine Mobility Systems Pvt. Ltd.', requirement:'Overall Compliance', action:'Routed for Clarification (OEM MAF Notice)', source:'Verification Console', result:'PENDING', officer:'Priya Sharma' },
  { date:'2026-09-07 11:05', bidder:'Vaidya Motors & Engineering', requirement:'Blacklisting Check', action:'Cross-verification completed', source:'GeM Debarment List', result:'CLEAR', officer:'System (AI)' },
  { date:'2026-09-07 11:12', bidder:'Vaidya Motors & Engineering', requirement:'Overall Compliance', action:'Approved for Technical Evaluation', source:'Verification Console', result:'PASS', officer:'Priya Sharma' },
  { date:'2026-09-06 16:20', bidder:'NorthStar Computing Devices', requirement:'GST Registration', action:'AI flagged as FAIL (Suo-moto cancelled)', source:'GSTN Portal', result:'FAIL', officer:'System (AI)' },
  { date:'2026-09-06 16:22', bidder:'NorthStar Computing Devices', requirement:'Blacklisting Check', action:'Director linkage flagged (Debashis Roy)', source:'GeM Debarment List', result:'FLAGGED', officer:'System (AI)' },
  { date:'2026-09-06 17:00', bidder:'NorthStar Computing Devices', requirement:'Overall Compliance', action:'Routed for Manual Review / Disqualification', source:'Verification Console', result:'PENDING', officer:'Rahul Menon' },
  { date:'2026-09-05 09:44', bidder:'Fortress Ruggedized Systems India', requirement:'OEM Authorization', action:'Cross-verification completed', source:'Bidder-submitted certificate', result:'PASS', officer:'System (AI)' },
  { date:'2026-09-05 09:50', bidder:'Fortress Ruggedized Systems India', requirement:'Overall Compliance', action:'Approved for Technical Evaluation', source:'Verification Console', result:'PASS', officer:'Rahul Menon' },
  { date:'2026-09-04 13:15', bidder:'Anand Metal Industries', requirement:'EPFO / ESIC Compliance', action:'Delayed filing detected', source:'EPFO Portal', result:'REVIEW', officer:'System (AI)' },
  { date:'2026-09-04 13:40', bidder:'Anand Metal Industries', requirement:'Overall Compliance', action:'Approved with conditions', source:'Verification Console', result:'PASS', officer:'Priya Sharma' },
  { date:'2026-09-03 10:02', bidder:'Suryoday Health Vehicles LLP', requirement:'Udyam / MSME Registration', action:'AI flagged as FAIL — expired certificate', source:'Udyam Registration Portal', result:'FAIL', officer:'System (AI)' },
  { date:'2026-09-03 10:30', bidder:'Suryoday Health Vehicles LLP', requirement:'Overall Compliance', action:'Routed for Clarification', source:'Verification Console', result:'PENDING', officer:'Priya Sharma' },
];

// ---------- 10. UTILITY FUNCTIONS ----------
function riskFromScore(score){
  if(score>=80) return 'LOW';
  if(score>=55) return 'MEDIUM';
  return 'HIGH';
}

function pillClassForResult(result){
  switch(result){
    case 'PASS': case 'CLEAR': return 'pill-pass';
    case 'REVIEW': return 'pill-review';
    case 'FAIL': case 'MISSING': case 'FLAGGED': return 'pill-fail';
    default: return 'pill-neutral';
  }
}

function riskFactorsFor(bidder){
  const factors = [];
  bidder.results.forEach(r=>{
    if(r.result==='MISSING') factors.push({ type:'missing', title:`Missing document — ${r.label}`, sub:r.reason, weight:'-14 pts' });
    if(r.result==='FAIL') factors.push({ type:'fail', title:`Failed check — ${r.label}`, sub:r.reason, weight:'-18 pts' });
    if(r.result==='REVIEW') factors.push({ type:'review', title:`Needs review — ${r.label}`, sub:r.reason, weight:'-8 pts' });
    if(r.result==='FLAGGED') factors.push({ type:'fail', title:`Flagged — ${r.label}`, sub:r.reason, weight:'-22 pts' });
  });
  return factors;
}

function recommendationFor(bidder){
  const risk = bidder.risk;
  const missing = bidder.results.filter(r=>r.result==='MISSING').map(r=>r.label);
  const reviews = bidder.results.filter(r=>r.result==='REVIEW').map(r=>r.label);
  const fails = bidder.results.filter(r=>r.result==='FAIL' || r.result==='FLAGGED').map(r=>r.label);

  if(risk==='LOW' && fails.length===0 && missing.length===0){
    return {
      verdict:'Compliant — Recommended for Technical Evaluation',
      reason:`All ${bidder.results.length} mandatory checks passed with high confidence. No missing documents or unresolved mismatches were found. AI recommends proceeding to technical evaluation; final eligibility decision rests with the Procurement Officer.`
    };
  }
  if(risk==='HIGH'){
    return {
      verdict:'Further Review Required — High Risk',
      reason:`${fails.length} check(s) failed or were flagged${fails.length?': '+fails.join(', ')+'.':'.'} ${missing.length?`Missing: ${missing.join(', ')}. `:''}The compliance score falls in the high-risk band. AI recommends a Clarification request or Disqualification. Final decision rests with the Procurement Officer.`
    };
  }
  return {
    verdict:'Further Review Required — Medium Risk',
    reason:`${missing.length?`Missing document: ${missing.join(', ')}. `:''}${reviews.length?`${reviews.length} item(s) need manual review: ${reviews.join(', ')}. `:''}Overall score falls in the medium-risk band. AI recommends issuing a formal clarification notice to the bidder. Final decision rests with the Procurement Officer.`
  };
}

function findTender(id){
  if(!id) return TENDERS[0];
  const clean = decodeURIComponent(String(id)).trim().toLowerCase();
  return TENDERS.find(t=>
    t.id.toLowerCase() === clean ||
    clean.includes(t.id.toLowerCase()) ||
    t.id.toLowerCase().includes(clean) ||
    clean.replace(/[\/\-_]/g,'') === t.id.toLowerCase().replace(/[\/\-_]/g,'')
  ) || TENDERS[0];
}

function findBidder(id){
  if(!id) return BIDDERS[0];
  const clean = decodeURIComponent(String(id)).trim().toLowerCase();
  return BIDDERS.find(b=>
    b.id.toLowerCase() === clean ||
    clean.includes(b.id.toLowerCase()) ||
    b.id.toLowerCase().includes(clean) ||
    (b.company && b.company.toLowerCase().includes(clean)) ||
    (b.trustId && b.trustId.toLowerCase().includes(clean))
  ) || BIDDERS[0];
}

function biddersForTender(tenderId){
  if(!tenderId) return BIDDERS;
  const t = findTender(tenderId);
  return BIDDERS.filter(b=>b.tenderId === t.id || b.tenderId.toLowerCase() === String(tenderId).toLowerCase());
}
