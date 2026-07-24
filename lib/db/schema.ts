import {
  pgTable,
  text,
  jsonb,
  timestamp,
  integer,
  boolean,
  primaryKey,
  uuid,
  serial,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  name: text("name"),
  workspaceName: text("workspace_name").notNull().default("My Workspace"),
  notifications: jsonb("notifications").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const creatorProfile = pgTable("creator_profile", {
  userId: text("user_id").primaryKey(),
  niche: text("niche"),
  bio: text("bio"),
  platforms: jsonb("platforms").notNull().default([]),
  audience: jsonb("audience").notNull().default({}),
  tone: text("tone"),
  pastDeals: text("past_deals"),
  rateFloor: integer("rate_floor"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const agents = pgTable(
  "agents",
  {
    userId: text("user_id").notNull(),
    id: text("id").notNull(),
    name: text("name").notNull(),
    initials: text("initials").notNull(),
    role: text("role").notNull(),
    color: text("color").notNull().default("#171717"),
    status: text("status").notNull().default("idle"),
    task: text("task"),
    score: integer("score"),
    goal: text("goal"),
    char: integer("char"),
    type: text("type").notNull().default("custom"),
    capabilities: jsonb("capabilities").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.id] }),
  })
);

export const agentConfig = pgTable(
  "agent_config",
  {
    userId: text("user_id").notNull(),
    agentId: text("agent_id").notNull(),
    role: text("role"),
    goal: text("goal"),
    permissions: jsonb("permissions"),
    settings: jsonb("settings"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.agentId] }),
  })
);

export const agentStates = pgTable(
  "agent_states",
  {
    userId: text("user_id").notNull(),
    agentId: text("agent_id").notNull(),
    removed: boolean("removed").notNull().default(false),
    paused: boolean("paused").notNull().default(false),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.agentId] }),
  })
);

export const teams = pgTable(
  "teams",
  {
    userId: text("user_id").notNull(),
    id: text("id").notNull(),
    name: text("name").notNull(),
    icon: text("icon"),
    iconBg: text("icon_bg"),
    description: text("description"),
    goal: text("goal"),
    members: jsonb("members").notNull().default([]),
    activity: jsonb("activity").notNull().default([]),
    meetings: integer("meetings").notNull().default(0),
    pipeline: integer("pipeline").notNull().default(0),
    leads: integer("leads").notNull().default(0),
    template: text("template"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.id] }),
  })
);

export const teamMembers = pgTable(
  "team_members",
  {
    userId: text("user_id").notNull(),
    teamId: text("team_id").notNull(),
    members: jsonb("members").notNull().default([]),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.teamId] }),
  })
);

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  agentId: text("agent_id"),
  name: text("name").notNull(),
  title: text("title"),
  company: text("company"),
  email: text("email"),
  status: text("status").notNull().default("new"),
  score: integer("score"),
  source: text("source").notNull().default("manual"),
  review: text("review").notNull().default("accepted"),
  profileUrl: text("profile_url"),
  platform: text("platform"),
  research: jsonb("research"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const activity = pgTable("activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  agentId: text("agent_id"),
  type: text("type").notNull(),
  leadId: uuid("lead_id"),
  text: text("text").notNull(),
  dismissed: boolean("dismissed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  agentId: text("agent_id"),
  kind: text("kind").notNull(),
  status: text("status").notNull().default("queued"),
  params: jsonb("params"),
  result: jsonb("result"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const outreachDrafts = pgTable("outreach_drafts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  agentId: text("agent_id"),
  leadId: uuid("lead_id").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  rationale: text("rationale"),
  status: text("status").notNull().default("draft"),
  dismissed: boolean("dismissed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  agentId: text("agent_id"),
  leadId: uuid("lead_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  products: jsonb("products").notNull().default([]),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  agentId: text("agent_id"),
  leadId: uuid("lead_id"),
  title: text("title").notNull(),
  kind: text("kind").notNull().default("call"),
  whenAt: timestamp("when_at", { withTimezone: true }).notNull(),
  whenLabel: text("when_label"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  agentId: text("agent_id"),
  who: text("who").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
