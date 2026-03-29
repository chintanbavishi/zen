import type { TeamChoice, OfficeChoice, B2CGrowth, B2BGrowth, TemptationId, CurveballId } from "./gameState";

export interface TeamOption {
  id: TeamChoice;
  title: string;
  subtitle: string;
  icon: string;
  monthlyCost: number;
  oneTimeCost: number;
}

export interface OfficeOption {
  id: OfficeChoice;
  title: string;
  subtitle: string;
  icon: string;
  monthlyCost: number;
  oneTimeCost: number;
}

export interface GrowthOption<T extends string> {
  id: T;
  title: string;
  subtitle: string;
  icon: string;
  monthlyCost: number;
  oneTimeCost: number;
}

export interface TemptationOption {
  id: TemptationId;
  title: string;
  subtitle: string;
  icon: string;
  cost: number;
}

export interface CurveballOption {
  id: CurveballId;
  title: string;
  subtitle: string;
  icon: string;
  fixCost: number;
  ignoreText: string;
}

export const teamChoices: TeamOption[] = [
  {
    id: "cto_friend",
    title: "CTO Friend",
    subtitle: "$0 cash, 25% equity. writes code at 2am. will have a breakdown by month 9.",
    icon: "🤝",
    monthlyCost: 0,
    oneTimeCost: 0,
  },
  {
    id: "senior",
    title: "Senior Engineer",
    subtitle: "$12K/mo. wants health insurance. actually knows what they're doing.",
    icon: "👨‍💻",
    monthlyCost: 12_000,
    oneTimeCost: 0,
  },
  {
    id: "offshore",
    title: "Offshore Team",
    subtitle: "$8K/mo total. timezone hell, but you ship fast.",
    icon: "🌏",
    monthlyCost: 8_000,
    oneTimeCost: 0,
  },
  {
    id: "solo",
    title: "Solo Founder",
    subtitle: "$0. you are the engineer, the designer, the PM, and the therapist.",
    icon: "🧘",
    monthlyCost: 0,
    oneTimeCost: 0,
  },
];

export const officeChoices: OfficeOption[] = [
  {
    id: "apartment",
    title: "Home / Apartment",
    subtitle: "$0/mo. your cofounder's cat is on every zoom call.",
    icon: "🏠",
    monthlyCost: 0,
    oneTimeCost: 0,
  },
  {
    id: "wework",
    title: "WeWork",
    subtitle: "$600/mo. free beer on tap. you'll network with 14 crypto bros.",
    icon: "☕",
    monthlyCost: 600,
    oneTimeCost: 0,
  },
  {
    id: "real_office",
    title: "Real Office",
    subtitle: "$4,500/mo. SF rent hits different. but investors love walking into a 'space'.",
    icon: "🏢",
    monthlyCost: 4_500,
    oneTimeCost: 0,
  },
  {
    id: "bangalore",
    title: "Bangalore Hub",
    subtitle: "$800/mo. burn rate drops 60%. good luck with those SF investor meetings.",
    icon: "🇮🇳",
    monthlyCost: 800,
    oneTimeCost: 0,
  },
];

export const b2cGrowthChoices: GrowthOption<B2CGrowth>[] = [
  {
    id: "organic",
    title: "Organic Growth",
    subtitle: "Word of mouth. SEO. Hope. The holy trinity.",
    icon: "🌱",
    monthlyCost: 0,
    oneTimeCost: 0,
  },
  {
    id: "paid_ads",
    title: "Paid Ads",
    subtitle: "$5K/mo in Facebook ads. Your CAC will haunt your dreams.",
    icon: "📢",
    monthlyCost: 5_000,
    oneTimeCost: 0,
  },
  {
    id: "influencer",
    title: "Influencer Deal",
    subtitle: "$15K one-time. One TikTok. Millions of views. Zero conversions.",
    icon: "⭐",
    monthlyCost: 0,
    oneTimeCost: 15_000,
  },
  {
    id: "pr_stunt",
    title: "PR Stunt",
    subtitle: "$2K one-time. Goes viral once. Then silence.",
    icon: "🎪",
    monthlyCost: 0,
    oneTimeCost: 2_000,
  },
];

export const b2bGrowthChoices: GrowthOption<B2BGrowth>[] = [
  {
    id: "cold_email",
    title: "Cold Email",
    subtitle: "$500/mo for Apollo. 0.3% reply rate. But every reply is a potential $10K deal.",
    icon: "📧",
    monthlyCost: 500,
    oneTimeCost: 0,
  },
  {
    id: "sales_rep",
    title: "Sales Rep",
    subtitle: "$8K/mo. They close deals. And take credit for deals you already closed.",
    icon: "💼",
    monthlyCost: 8_000,
    oneTimeCost: 0,
  },
  {
    id: "content",
    title: "Content Marketing",
    subtitle: "$2K/mo. Blog posts. LinkedIn. Takes 6 months to see results.",
    icon: "✍️",
    monthlyCost: 2_000,
    oneTimeCost: 0,
  },
  {
    id: "network",
    title: "Network / Referrals",
    subtitle: "$0. Calling in favors. The original growth hack.",
    icon: "🤙",
    monthlyCost: 0,
    oneTimeCost: 0,
  },
];

export const temptations: TemptationOption[] = [
  {
    id: "lisbon",
    title: "Workation in Lisbon",
    subtitle: "It's a business trip. Kind of. The Atlantic sunsets are crucial for creativity.",
    icon: "🇵🇹",
    cost: 3_500,
  },
  {
    id: "rebrand",
    title: "Emergency Rebrand",
    subtitle: "Your logo needed gradients. Non-negotiable. $8K well spent.",
    icon: "🎨",
    cost: 8_000,
  },
  {
    id: "sxsw",
    title: "SXSW Booth",
    subtitle: "$12K to talk to 200 people who are also trying to sell something.",
    icon: "🎸",
    cost: 12_000,
  },
  {
    id: "merch",
    title: "Company Merch",
    subtitle: "$2,500 in hoodies. You'll wear them to your next job.",
    icon: "👕",
    cost: 2_500,
  },
];

export const curveballs: CurveballOption[] = [
  {
    id: "cto_equity",
    title: "CTO Wants More Equity",
    subtitle: "Your technical co-founder just discovered they're building the whole product for 10%.",
    icon: "😤",
    fixCost: 5_000,
    ignoreText: "Ghost them on Slack. This will definitely resolve itself.",
  },
  {
    id: "aws_bill",
    title: "Surprise AWS Bill",
    subtitle: "Someone left a GPU instance running. For 3 months.",
    icon: "☁️",
    fixCost: 6_000,
    ignoreText: "Dispute the charges. Amazon loves that.",
  },
  {
    id: "refund",
    title: "Customer Refund Demands",
    subtitle: "Your biggest customer wants their money back. All of it.",
    icon: "💸",
    fixCost: 4_000,
    ignoreText: "Mark their emails as spam. Professional.",
  },
  {
    id: "competitor",
    title: "Competitor Launches",
    subtitle: "A well-funded competitor just copied your entire product. With a better UI.",
    icon: "🥊",
    fixCost: 3_000,
    ignoreText: "Post about it on Twitter. Engagement is engagement.",
  },
  {
    id: "pivot",
    title: "The Pivot",
    subtitle: "Your users want something completely different. Do you listen?",
    icon: "🔄",
    fixCost: 10_000,
    ignoreText: "Stay the course. The market is wrong.",
  },
];
