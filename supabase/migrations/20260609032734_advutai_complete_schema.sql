/*
# AdvutAI Complete Schema - Multi-user SaaS Platform

1. New Tables
- `profiles` — user profile data (display name, avatar, preferences)
- `workspaces` — team/org workspaces
- `workspace_members` — workspace membership with roles
- `chats` — AI chat conversations
- `messages` — chat messages with model tracking
- `memories` — AI memory/knowledge entries with vector embeddings
- `projects` — workspace projects for organizing content
- `project_items` — items within projects (docs, prompts, notes, research)
- `tasks` — task management items
- `files` — uploaded file metadata
- `research_reports` — saved research reports
- `subscriptions` — Stripe subscription tracking
- `usage_logs` — AI usage/billing tracking

2. Security
- RLS enabled on all tables
- Owner-scoped policies for personal data
- Workspace membership checks for shared data
- DEFAULT auth.uid() on all owner columns

3. Indexes
- Performance indexes on foreign keys and frequently queried columns
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- WORKSPACE MEMBERS
CREATE TABLE IF NOT EXISTS workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- CHATS
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'New Chat',
  folder text,
  model text NOT NULL DEFAULT 'gpt-4o',
  pinned boolean DEFAULT false,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  model text,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- MEMORIES
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('preference', 'project', 'interest', 'work', 'prompt', 'general')),
  title text NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  auto_extracted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  icon text DEFAULT 'folder',
  color text DEFAULT '#38bdf8',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PROJECT ITEMS
CREATE TABLE IF NOT EXISTS project_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('document', 'prompt', 'note', 'research', 'code', 'image')),
  title text NOT NULL,
  content text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  ai_generated boolean DEFAULT false,
  parent_task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- FILES
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL,
  size bigint NOT NULL DEFAULT 0,
  url text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- RESEARCH REPORTS
CREATE TABLE IF NOT EXISTS research_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  query text NOT NULL,
  summary text,
  sources jsonb DEFAULT '[]',
  report_content text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'researching', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- USAGE LOGS
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  model text,
  tokens_used integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_workspace_id ON chats(workspace_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_items_project_id ON project_items(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_research_user_id ON research_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- WORKSPACES policies
DROP POLICY IF EXISTS "select_own_workspaces" ON workspaces;
CREATE POLICY "select_own_workspaces" ON workspaces FOR SELECT TO authenticated USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspaces.id AND workspace_members.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_workspaces" ON workspaces;
CREATE POLICY "insert_own_workspaces" ON workspaces FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "update_own_workspaces" ON workspaces;
CREATE POLICY "update_own_workspaces" ON workspaces FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "delete_own_workspaces" ON workspaces;
CREATE POLICY "delete_own_workspaces" ON workspaces FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- WORKSPACE_MEMBERS policies
DROP POLICY IF EXISTS "select_workspace_members" ON workspace_members;
CREATE POLICY "select_workspace_members" ON workspace_members FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_workspace_members" ON workspace_members;
CREATE POLICY "insert_workspace_members" ON workspace_members FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid()));
DROP POLICY IF EXISTS "update_workspace_members" ON workspace_members;
CREATE POLICY "update_workspace_members" ON workspace_members FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid()));
DROP POLICY IF EXISTS "delete_workspace_members" ON workspace_members;
CREATE POLICY "delete_workspace_members" ON workspace_members FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid()));

-- CHATS policies
DROP POLICY IF EXISTS "select_own_chats" ON chats;
CREATE POLICY "select_own_chats" ON chats FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_chats" ON chats;
CREATE POLICY "insert_own_chats" ON chats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_chats" ON chats;
CREATE POLICY "update_own_chats" ON chats FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_chats" ON chats;
CREATE POLICY "delete_own_chats" ON chats FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- MESSAGES policies
DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages" ON messages FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages" ON messages FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));

-- MEMORIES policies
DROP POLICY IF EXISTS "select_own_memories" ON memories;
CREATE POLICY "select_own_memories" ON memories FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_memories" ON memories;
CREATE POLICY "insert_own_memories" ON memories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_memories" ON memories;
CREATE POLICY "update_own_memories" ON memories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_memories" ON memories;
CREATE POLICY "delete_own_memories" ON memories FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PROJECTS policies
DROP POLICY IF EXISTS "select_own_projects" ON projects;
CREATE POLICY "select_own_projects" ON projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_projects" ON projects;
CREATE POLICY "insert_own_projects" ON projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_projects" ON projects;
CREATE POLICY "update_own_projects" ON projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_projects" ON projects;
CREATE POLICY "delete_own_projects" ON projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PROJECT_ITEMS policies
DROP POLICY IF EXISTS "select_own_project_items" ON project_items;
CREATE POLICY "select_own_project_items" ON project_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_items.project_id AND projects.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_project_items" ON project_items;
CREATE POLICY "insert_own_project_items" ON project_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_items.project_id AND projects.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_project_items" ON project_items;
CREATE POLICY "update_own_project_items" ON project_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_items.project_id AND projects.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_project_items" ON project_items;
CREATE POLICY "delete_own_project_items" ON project_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_items.project_id AND projects.user_id = auth.uid()));

-- TASKS policies
DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- FILES policies
DROP POLICY IF EXISTS "select_own_files" ON files;
CREATE POLICY "select_own_files" ON files FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_files" ON files;
CREATE POLICY "insert_own_files" ON files FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_files" ON files;
CREATE POLICY "delete_own_files" ON files FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RESEARCH_REPORTS policies
DROP POLICY IF EXISTS "select_own_research" ON research_reports;
CREATE POLICY "select_own_research" ON research_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_research" ON research_reports;
CREATE POLICY "insert_own_research" ON research_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_research" ON research_reports;
CREATE POLICY "update_own_research" ON research_reports FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_research" ON research_reports;
CREATE POLICY "delete_own_research" ON research_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- SUBSCRIPTIONS policies
DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- USAGE_LOGS policies
DROP POLICY IF EXISTS "select_own_usage" ON usage_logs;
CREATE POLICY "select_own_usage" ON usage_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_usage" ON usage_logs;
CREATE POLICY "insert_own_usage" ON usage_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
