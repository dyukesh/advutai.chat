export type TaskType = 'coding' | 'writing' | 'reasoning' | 'chat' | 'analysis';
export type PersonalityTone = 'professional' | 'friendly' | 'tutor' | 'coder' | 'creative';

const modelMap: Record<TaskType, string> = {
  coding: 'gpt-4o',
  writing: 'gpt-4o-mini',
  reasoning: 'gpt-4o',
  analysis: 'gpt-4o-mini',
  chat: 'gpt-4o-mini',
};

export function getModelForTask(taskType: TaskType) {
  return modelMap[taskType] ?? modelMap.chat;
}

export function getToneSystemPrompt(tone: PersonalityTone) {
  switch (tone) {
    case 'friendly':
      return 'Respond in a friendly, warm, and supportive tone while remaining professional.';
    case 'tutor':
      return 'Respond with an educational tutor style, explaining concepts clearly and step-by-step.';
    case 'coder':
      return 'Respond as a coding expert with practical examples, clean explanations, and developer best practices.';
    case 'creative':
      return 'Respond with creative, imaginative, and engaging language while still being helpful.';
    case 'professional':
    default:
      return 'Respond in a professional, concise, and helpful manner.';
  }
}
