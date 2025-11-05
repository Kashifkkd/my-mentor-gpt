/**
 * Assistant Field Configurations
 * Defines custom fields for each assistant type to collect user context
 */

export interface AssistantField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select type
  description?: string;
}

export interface AssistantFieldConfig {
  assistantType: string;
  fields: AssistantField[];
}

/**
 * Field configurations for each assistant type
 */
export const assistantFieldConfigs: Record<string, AssistantField[]> = {
  teacher: [
    {
      id: 'subject',
      label: 'Subject/Area of Expertise',
      type: 'text',
      placeholder: 'e.g., Mathematics, Science, English',
      required: true,
      description: 'What subject do you need help with?',
    },
    {
      id: 'gradeLevel',
      label: 'Grade/Level',
      type: 'select',
      placeholder: 'Select grade level',
      required: false,
      options: [
        'Elementary (K-5)',
        'Middle School (6-8)',
        'High School (9-12)',
        'College/University',
        'Adult Learning',
      ],
    },
    {
      id: 'learningGoals',
      label: 'Learning Goals',
      type: 'textarea',
      placeholder: 'What do you want to achieve? What topics do you need help with?',
      required: false,
      description: 'Describe your learning objectives',
    },
    {
      id: 'teachingStyle',
      label: 'Preferred Teaching Style',
      type: 'select',
      placeholder: 'Select preferred style',
      required: false,
      options: [
        'Visual (diagrams, charts)',
        'Step-by-step explanations',
        'Examples and practice',
        'Interactive discussion',
        'Conceptual understanding',
      ],
    },
  ],
  mentor: [
    {
      id: 'industry',
      label: 'Industry/Field',
      type: 'text',
      placeholder: 'e.g., Software Engineering, Marketing, Finance',
      required: true,
      description: 'What industry are you in or targeting?',
    },
    {
      id: 'experienceLevel',
      label: 'Experience Level',
      type: 'select',
      placeholder: 'Select your level',
      required: false,
      options: [
        'Entry Level',
        'Mid-Level (2-5 years)',
        'Senior (5-10 years)',
        'Executive/Leadership',
      ],
    },
    {
      id: 'careerGoals',
      label: 'Career Goals',
      type: 'textarea',
      placeholder: 'What are your career aspirations? What guidance do you need?',
      required: false,
    },
  ],
  therapist: [
    {
      id: 'focusArea',
      label: 'Focus Area',
      type: 'select',
      placeholder: 'What would you like support with?',
      required: true,
      options: [
        'Stress Management',
        'Anxiety',
        'Depression',
        'Relationships',
        'Self-Care',
        'Mindfulness',
        'General Wellness',
      ],
    },
    {
      id: 'preferredApproach',
      label: 'Preferred Approach',
      type: 'select',
      placeholder: 'Select approach',
      required: false,
      options: [
        'Cognitive Behavioral Therapy (CBT)',
        'Mindfulness-based',
        'Solution-focused',
        'Supportive listening',
      ],
    },
  ],
  coach: [
    {
      id: 'coachingArea',
      label: 'Coaching Area',
      type: 'select',
      placeholder: 'What area do you want coaching in?',
      required: true,
      options: [
        'Life Goals',
        'Career Development',
        'Health & Fitness',
        'Relationships',
        'Productivity',
        'Personal Growth',
      ],
    },
    {
      id: 'currentSituation',
      label: 'Current Situation',
      type: 'textarea',
      placeholder: 'Describe where you are now and what you want to achieve',
      required: false,
    },
  ],
  tutor: [
    {
      id: 'subject',
      label: 'Subject',
      type: 'text',
      placeholder: 'e.g., Algebra, Biology, Spanish',
      required: true,
    },
    {
      id: 'difficultyLevel',
      label: 'Difficulty Level',
      type: 'select',
      placeholder: 'Select level',
      required: false,
      options: [
        'Beginner',
        'Intermediate',
        'Advanced',
        'Exam Preparation',
      ],
    },
    {
      id: 'specificTopics',
      label: 'Specific Topics/Questions',
      type: 'textarea',
      placeholder: 'What specific topics or questions do you need help with?',
      required: false,
    },
  ],
  advisor: [
    {
      id: 'adviceType',
      label: 'Type of Advice',
      type: 'select',
      placeholder: 'What kind of advice do you need?',
      required: true,
      options: [
        'General Guidance',
        'Decision Making',
        'Problem Solving',
        'Planning & Strategy',
        'Best Practices',
      ],
    },
    {
      id: 'context',
      label: 'Context',
      type: 'textarea',
      placeholder: 'Provide context about your situation',
      required: false,
    },
  ],
};

/**
 * Get field configuration for an assistant type
 */
export function getAssistantFields(assistantType: string): AssistantField[] {
  return assistantFieldConfigs[assistantType] || [];
}

/**
 * Build system prompt from assistant type and custom fields
 */
export function buildSystemPrompt(
  assistantType: string,
  customFields: Record<string, string>
): string {
  const assistantNames: Record<string, string> = {
    teacher: 'Teacher',
    mentor: 'Mentor',
    therapist: 'Therapist',
    coach: 'Life Coach',
    tutor: 'Tutor',
    advisor: 'Advisor',
  };

  const baseRole = assistantNames[assistantType] || 'Assistant';
  let prompt = `You are a helpful ${baseRole} AI assistant. `;

  // Add context from custom fields
  const fieldDescriptions: string[] = [];
  
  for (const [key, value] of Object.entries(customFields)) {
    if (value && value.trim()) {
      const fieldConfig = assistantFieldConfigs[assistantType]?.find(f => f.id === key);
      if (fieldConfig) {
        fieldDescriptions.push(`${fieldConfig.label}: ${value}`);
      }
    }
  }

  if (fieldDescriptions.length > 0) {
    prompt += `\n\nUser Context:\n${fieldDescriptions.join('\n')}\n`;
    prompt += `\nUse this context to provide personalized, relevant, and helpful responses.`;
  }

  // Add role-specific instructions
  switch (assistantType) {
    case 'teacher':
      prompt += `\n\nAs a teacher, provide clear explanations, examples, and encourage learning. Break down complex topics into understandable parts.`;
      break;
    case 'mentor':
      prompt += `\n\nAs a mentor, provide career guidance, share insights, and help with professional development. Be supportive and encouraging.`;
      break;
    case 'therapist':
      prompt += `\n\nAs a therapist, be empathetic, supportive, and professional. Provide mental health support while encouraging professional help when needed.`;
      break;
    case 'coach':
      prompt += `\n\nAs a life coach, help set goals, provide motivation, and create actionable plans. Be positive and goal-oriented.`;
      break;
    case 'tutor':
      prompt += `\n\nAs a tutor, provide step-by-step explanations, help with homework, and focus on understanding concepts.`;
      break;
    case 'advisor':
      prompt += `\n\nAs an advisor, provide thoughtful guidance, consider different perspectives, and help with decision-making.`;
      break;
  }

  return prompt;
}

