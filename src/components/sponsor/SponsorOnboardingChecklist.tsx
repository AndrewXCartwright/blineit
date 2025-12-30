import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  User, 
  Shield, 
  CreditCard, 
  PlusCircle,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  completed: boolean;
}

interface SponsorOnboardingChecklistProps {
  onDismiss?: () => void;
  className?: string;
}

export function SponsorOnboardingChecklist({ onDismiss, className }: SponsorOnboardingChecklistProps) {
  // In a real app, this would come from user data
  const [steps] = useState<OnboardingStep[]>([
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add logo, bio, and social links',
      icon: User,
      link: '/sponsor/settings?tab=profile',
      completed: true,
    },
    {
      id: 'verify',
      title: 'Verify your identity',
      description: 'Upload required documents',
      icon: Shield,
      link: '/sponsor/settings?tab=company',
      completed: false,
    },
    {
      id: 'banking',
      title: 'Connect banking',
      description: 'Set up for distributions',
      icon: CreditCard,
      link: '/sponsor/settings?tab=banking',
      completed: false,
    },
    {
      id: 'first_deal',
      title: 'List your first deal',
      description: 'Start raising capital',
      icon: PlusCircle,
      link: '/sponsor/deals/new',
      completed: false,
    },
  ]);

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;
  const allComplete = completedCount === steps.length;

  if (allComplete && onDismiss) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </div>
          {allComplete && onDismiss && (
            <Button variant="ghost" size="icon" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Progress value={progressPercent} className="flex-1 h-2" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {completedCount} of {steps.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {steps.map((step) => (
          <Link
            key={step.id}
            to={step.link}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              step.completed 
                ? 'bg-primary/5 hover:bg-primary/10' 
                : 'hover:bg-muted'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              step.completed 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${step.completed ? 'text-muted-foreground line-through' : ''}`}>
                {step.title}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {step.description}
              </p>
            </div>
            {!step.completed && (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
