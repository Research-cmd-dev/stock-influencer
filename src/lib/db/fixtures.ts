import type { Person, Statement, Theme, StockMention } from "@/lib/schemas";
import { statementDedupeHash } from "@/lib/hash";

/**
 * Seed fixtures: 5 tracked executives, several sample statements, derived themes,
 * and stock mentions. This is the single source of truth for offline/demo data and
 * for the DAL fixture implementation. Real ingestion + LLM analysis (Phases 2–3)
 * produce data in this same shape.
 */

export const PEOPLE: Person[] = [
  {
    id: "p_jensen_huang",
    name: "Jensen Huang",
    role: "Founder & CEO",
    company: "NVIDIA",
    ticker: "NVDA",
    xHandle: "@nvidia",
    bio: "Co-founder and CEO of NVIDIA, the dominant supplier of AI accelerators and the CUDA platform.",
  },
  {
    id: "p_lisa_su",
    name: "Lisa Su",
    role: "Chair & CEO",
    company: "AMD",
    ticker: "AMD",
    xHandle: "@LisaSu",
    bio: "Chair and CEO of AMD, driving its data-center GPU and CPU challenge in the AI compute market.",
  },
  {
    id: "p_satya_nadella",
    name: "Satya Nadella",
    role: "Chairman & CEO",
    company: "Microsoft",
    ticker: "MSFT",
    xHandle: "@satyanadella",
    bio: "Chairman and CEO of Microsoft, steering its Azure cloud and OpenAI-aligned AI strategy.",
  },
  {
    id: "p_sundar_pichai",
    name: "Sundar Pichai",
    role: "CEO",
    company: "Alphabet",
    ticker: "GOOGL",
    xHandle: "@sundarpichai",
    bio: "CEO of Alphabet and Google, overseeing Gemini, TPUs, and Google Cloud's AI infrastructure.",
  },
  {
    id: "p_andy_jassy",
    name: "Andy Jassy",
    role: "President & CEO",
    company: "Amazon",
    ticker: "AMZN",
    xHandle: "@ajassy",
    bio: "CEO of Amazon, overseeing AWS, custom Trainium/Inferentia silicon, and the Anthropic partnership.",
  },
];

function buildStatement(s: Omit<Statement, "dedupeHash" | "createdAt"> & { createdAt?: string }): Statement {
  return {
    ...s,
    dedupeHash: statementDedupeHash({ personId: s.personId, source: s.source, rawText: s.rawText }),
    createdAt: s.createdAt ?? `${s.date}T12:00:00.000Z`,
  };
}

export const STATEMENTS: Statement[] = [
  buildStatement({
    id: "s_jensen_gtc_2026",
    personId: "p_jensen_huang",
    source: "keynote",
    sourceUrl: "https://www.nvidia.com/gtc/keynote/",
    title: "GTC 2026 Keynote",
    date: "2026-03-18",
    rawText:
      "We are at the beginning of a decade-long buildout of AI factories. Every data center will be rebuilt for accelerated computing. Demand for our Blackwell platform far exceeds supply, and the next generation is already in production.",
    keyQuotes: [
      "Every data center will be rebuilt for accelerated computing.",
      "Demand for our Blackwell platform far exceeds supply.",
    ],
    extractedSignals: [
      { text: "Multi-year AI data-center capex supercycle", category: "ai-compute" },
      { text: "Supply-constrained accelerator demand", category: "chips-semis" },
    ],
  }),
  buildStatement({
    id: "s_jensen_earnings_2026q1",
    personId: "p_jensen_huang",
    source: "transcript",
    sourceUrl: "https://investor.nvidia.com/",
    title: "Q1 FY2026 Earnings Call",
    date: "2026-02-21",
    rawText:
      "Sovereign AI and enterprise inference are becoming major demand drivers alongside the hyperscalers. Networking, with Spectrum-X and NVLink, is now a multi-billion-dollar business.",
    keyQuotes: ["Sovereign AI and enterprise inference are becoming major demand drivers."],
    extractedSignals: [
      { text: "Sovereign AI as a new demand vector", category: "ai-compute" },
      { text: "Networking emerging as a major revenue line", category: "infrastructure" },
    ],
  }),
  buildStatement({
    id: "s_lisa_su_ces_2026",
    personId: "p_lisa_su",
    source: "keynote",
    sourceUrl: "https://www.amd.com/",
    title: "CES 2026 Address",
    date: "2026-01-07",
    rawText:
      "The data-center AI accelerator market will reach hundreds of billions of dollars. Our MI400 series gives customers a credible second source, and our software stack has matured dramatically.",
    keyQuotes: ["Our MI400 series gives customers a credible second source."],
    extractedSignals: [
      { text: "Credible second-source AI accelerator", category: "chips-semis" },
      { text: "Maturing open software stack (ROCm)", category: "software" },
    ],
  }),
  buildStatement({
    id: "s_satya_earnings_2026q2",
    personId: "p_satya_nadella",
    source: "transcript",
    sourceUrl: "https://www.microsoft.com/investor",
    title: "FY2026 Q2 Earnings Call",
    date: "2026-01-28",
    rawText:
      "Azure AI demand continues to outstrip capacity. We are expanding data-center footprint aggressively, and our capital expenditures will remain elevated to meet the demand for AI compute.",
    keyQuotes: ["Azure AI demand continues to outstrip capacity."],
    extractedSignals: [
      { text: "Hyperscaler capex remains elevated", category: "data-centers" },
      { text: "Cloud AI capacity is the bottleneck", category: "infrastructure" },
    ],
  }),
  buildStatement({
    id: "s_sundar_io_2026",
    personId: "p_sundar_pichai",
    source: "keynote",
    sourceUrl: "https://io.google/",
    title: "Google I/O 2026",
    date: "2026-05-12",
    rawText:
      "Our custom TPUs let us serve Gemini at massive scale efficiently. We see power availability becoming the key constraint on AI infrastructure over the next several years.",
    keyQuotes: ["Power availability is becoming the key constraint on AI infrastructure."],
    extractedSignals: [
      { text: "Custom silicon (TPU) for cost-efficient inference", category: "chips-semis" },
      { text: "Power/energy as the binding constraint", category: "energy-power" },
    ],
  }),
  buildStatement({
    id: "s_jassy_reinvent_2026",
    personId: "p_andy_jassy",
    source: "keynote",
    sourceUrl: "https://reinvent.awsevents.com/",
    title: "AWS re:Invent 2026",
    date: "2026-12-02",
    rawText:
      "Trainium adoption is accelerating as customers seek better price-performance for training. Generative AI is already a multi-billion-dollar revenue run-rate business at AWS.",
    keyQuotes: ["Trainium adoption is accelerating for better price-performance."],
    extractedSignals: [
      { text: "Custom training silicon gaining adoption", category: "chips-semis" },
      { text: "GenAI at multi-billion revenue run-rate", category: "ai-compute" },
    ],
  }),
];

export const STOCK_MENTIONS: StockMention[] = [
  {
    id: "m_nvda_jensen_gtc",
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    kind: "stock",
    context: "Blackwell platform demand far exceeds supply; multi-year AI factory buildout.",
    sentiment: "bullish",
    sourceStatementId: "s_jensen_gtc_2026",
  },
  {
    id: "m_amd_lisa_ces",
    ticker: "AMD",
    name: "Advanced Micro Devices",
    kind: "stock",
    context: "MI400 series positioned as a credible second-source AI accelerator.",
    sentiment: "bullish",
    sourceStatementId: "s_lisa_su_ces_2026",
  },
  {
    id: "m_msft_satya",
    ticker: "MSFT",
    name: "Microsoft Corporation",
    kind: "stock",
    context: "Azure AI demand outstrips capacity; elevated data-center capex.",
    sentiment: "bullish",
    sourceStatementId: "s_satya_earnings_2026q2",
  },
  {
    id: "m_googl_sundar",
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    kind: "stock",
    context: "Custom TPUs serve Gemini efficiently; power is the key constraint.",
    sentiment: "neutral",
    sourceStatementId: "s_sundar_io_2026",
  },
  {
    id: "m_smh_compute",
    ticker: "SMH",
    name: "VanEck Semiconductor ETF",
    kind: "etf",
    context: "Broad semiconductor exposure to the AI accelerator supercycle.",
    sentiment: "bullish",
    sourceStatementId: "s_jensen_gtc_2026",
  },
];

export const THEMES: Theme[] = [
  {
    id: "t_ai_factory_buildout",
    title: "The Multi-Year AI Factory Buildout",
    summary:
      "Hyperscalers and sovereigns are rebuilding data centers around accelerated computing, driving a sustained capex supercycle in GPUs, networking, and infrastructure.",
    category: "ai-compute",
    confidence: 0.86,
    relatedStatementIds: ["s_jensen_gtc_2026", "s_satya_earnings_2026q2", "s_jassy_reinvent_2026"],
    relatedStockMentionIds: ["m_nvda_jensen_gtc", "m_msft_satya", "m_smh_compute"],
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "t_second_source_silicon",
    title: "The Rise of Second-Source & Custom Silicon",
    summary:
      "Customers want alternatives to a single accelerator supplier. AMD's MI-series plus hyperscaler custom chips (TPU, Trainium) are maturing into credible options.",
    category: "chips-semis",
    confidence: 0.72,
    relatedStatementIds: ["s_lisa_su_ces_2026", "s_sundar_io_2026", "s_jassy_reinvent_2026"],
    relatedStockMentionIds: ["m_amd_lisa_ces", "m_googl_sundar"],
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "t_power_constraint",
    title: "Power Becomes the Binding Constraint",
    summary:
      "As compute scales, electricity availability and data-center power are emerging as the dominant bottleneck — elevating energy and infrastructure plays.",
    category: "energy-power",
    confidence: 0.64,
    relatedStatementIds: ["s_sundar_io_2026", "s_satya_earnings_2026q2"],
    relatedStockMentionIds: ["m_googl_sundar"],
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
];
