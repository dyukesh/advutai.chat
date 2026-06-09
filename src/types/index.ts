export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joined_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  workspace_id: string | null;
  title: string;
  folder: string | null;
  model: string;
  pinned: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: string | null;
  tokens_used: number;
  created_at: string;
}

export interface Memory {
  id: string;
  user_id: string;
  category: 'preference' | 'project' | 'interest' | 'work' | 'prompt' | 'general';
  title: string;
  content: string;
  auto_extracted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  workspace_id: string | null;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectItem {
  id: string;
  project_id: string;
  type: 'document' | 'prompt' | 'note' | 'research' | 'code' | 'image';
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  workspace_id: string | null;
  project_id: string | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  ai_generated: boolean;
  parent_task_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FileItem {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  type: string;
  size: number;
  url: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ResearchReport {
  id: string;
  user_id: string;
  title: string;
  query: string;
  summary: string | null;
  sources: unknown[];
  report_content: string | null;
  status: 'pending' | 'researching' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  feature: string;
  model: string | null;
  tokens_used: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type AIModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const AI_MODELS: AIModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Most capable GPT-4 model' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Fast and affordable' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', description: 'Previous gen GPT-4' },
  { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', provider: 'Anthropic', description: 'Balanced performance' },
  { id: 'claude-4-opus', name: 'Claude 4 Opus', provider: 'Anthropic', description: 'Most capable Claude' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', description: 'Advanced reasoning' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', description: 'Fast responses' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', description: 'Reasoning model' },
  { id: 'grok-2', name: 'Grok 2', provider: 'xAI', description: 'Real-time aware' },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', description: 'European AI model' },
];

export const PRICING_PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: 0,
    features: ['50 messages/day', '5 file uploads/day', 'Basic models', '2 projects', '1 workspace'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 20,
    features: ['Unlimited messages', '50 file uploads/day', 'All AI models', 'Research agent', 'Content studio', 'Unlimited projects', 'Memory system', 'Priority support'],
  },
  {
    id: 'team' as const,
    name: 'Team',
    price: 40,
    features: ['Everything in Pro', 'Team collaboration', 'Shared workspaces', 'Role permissions', 'Team analytics', '10 workspaces', 'Admin dashboard'],
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: 99,
    features: ['Everything in Team', 'Unlimited everything', 'SSO/SAML', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'Audit logs', 'Custom models'],
  },
];
