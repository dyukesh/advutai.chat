function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
}

export function getOpenAiApiKey() {
  return getEnvVar('OPENAI_API_KEY');
}

export function getDatabaseUrl() {
  return getEnvVar('DATABASE_URL');
}

export function getNextAuthSecret() {
  return getEnvVar('NEXTAUTH_SECRET');
}
