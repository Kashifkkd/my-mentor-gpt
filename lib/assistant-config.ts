import { Brain, GraduationCap, Heart, Briefcase, Code, BookOpen } from 'lucide-react';
import type { AssistantType } from './types/assistant';

export const assistantTypes: AssistantType[] = [
  {
    id: 'therapist',
    name: 'Therapist',
    description: 'Mental health and wellness support',
    color: 'blue',
  },
  {
    id: 'teacher',
    name: 'Teacher',
    description: 'Educational guidance and learning',
    color: 'green',
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Career and professional guidance',
    color: 'purple',
  },
  {
    id: 'coach',
    name: 'Life Coach',
    description: 'Personal development and goals',
    color: 'orange',
  },
  {
    id: 'tutor',
    name: 'Tutor',
    description: 'Academic support and homework help',
    color: 'indigo',
  },
  {
    id: 'advisor',
    name: 'Advisor',
    description: 'General advice and guidance',
    color: 'pink',
  },
];

export const defaultWorkspaces: Array<{
  id: string;
  name: string;
  slug: string;
  image?: string;
}> = [
  {
    id: 'personal',
    name: 'Personal',
    slug: 'personal',
  },
  {
    id: 'work',
    name: 'Work',
    slug: 'work',
  },
  {
    id: 'education',
    name: 'Education',
    slug: 'education',
  },
];

export function getAssistantIcon(typeId: string) {
  const icons: Record<string, typeof Brain> = {
    therapist: Brain,
    teacher: GraduationCap,
    mentor: Briefcase,
    coach: Heart,
    tutor: BookOpen,
    advisor: Code,
  };
  return icons[typeId] || Brain;
}

