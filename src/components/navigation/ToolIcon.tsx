import React from 'react';
import { 
  Activity, 
  Compass, 
  Sliders, 
  Atom, 
  Zap, 
  Gauge, 
  Sparkles, 
  BrainCircuit, 
  ArrowRightLeft, 
  BookOpen,
  Wrench
} from 'lucide-react';

interface ToolIconProps {
  name: string;
  className?: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'Activity':
      return <Activity className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Sliders':
      return <Sliders className={className} />;
    case 'Atom':
      return <Atom className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Gauge':
      return <Gauge className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'BrainCircuit':
      return <BrainCircuit className={className} />;
    case 'ArrowRightLeft':
      return <ArrowRightLeft className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    default:
      return <Wrench className={className} />;
  }
};

export function getCategoryBadgeStyle(categoryEn: string): { bg: string; text: string; border: string; dot: string } {
  switch (categoryEn) {
    case 'Kinematics':
      return {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        dot: 'bg-cyan-400',
      };
    case 'Dynamics':
      return {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        border: 'border-indigo-500/30',
        dot: 'bg-indigo-400',
      };
    case 'Work & Energy':
    case 'Power & Work':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    case 'AI Tutor':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
      };
    case 'Self Test':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-400',
      };
    case 'Unit Tools':
      return {
        bg: 'bg-sky-500/10',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        dot: 'bg-sky-400',
      };
    case 'Reference':
    default:
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        dot: 'bg-purple-400',
      };
  }
}
