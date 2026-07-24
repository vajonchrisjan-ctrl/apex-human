import type { ResearchResult } from "@/lib/ai/research";

export type LeadStatus = "new" | "pitched" | "negotiating" | "replied" | "booked";
export type LeadReview = "accepted" | "pending";
export type LeadSource = "manual" | "scrape";

export interface Lead {
  id: string;
  userId: string;
  agentId: string | null;
  name: string;
  title: string | null;
  company: string | null;
  email: string | null;
  status: LeadStatus;
  score: number | null;
  source: LeadSource;
  review: LeadReview;
  profileUrl: string | null;
  platform: string | null;
  research: ResearchResult | null;
  createdAt: Date;
  updatedAt: Date;
}

export const LEAD_STAGES: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "pitched", label: "Pitched" },
  { id: "negotiating", label: "Negotiating" },
  { id: "replied", label: "Replied" },
  { id: "booked", label: "Booked" },
];

export interface OutreachDraft {
  id: string;
  leadId: string;
  agentId: string | null;
  subject: string | null;
  body: string;
  rationale: string | null;
  status: "draft" | "sent";
  createdAt: Date;
  sentAt: Date | null;
}

export interface Proposal {
  id: string;
  leadId: string;
  agentId: string | null;
  title: string;
  body: string;
  packages: string[];
  status: "draft" | "sent";
  createdAt: Date;
  sentAt: Date | null;
}
