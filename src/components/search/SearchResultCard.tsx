import { useNavigate } from 'react-router-dom';
import { Building2, Landmark, Target, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface SearchResultCardProps {
  result: SearchResult;
  highlightQuery?: string;
}

export function SearchResultCard({ result, highlightQuery }: SearchResultCardProps) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (result.type) {
      case 'property':
        return <Building2 className="h-5 w-5" />;
      case 'loan':
        return <Landmark className="h-5 w-5" />;
      case 'prediction':
        return <Target className="h-5 w-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (result.type) {
      case 'property':
        return 'Property';
      case 'loan':
        return 'Loan';
      case 'prediction':
        return 'Prediction';
    }
  };

  const getTypeColor = () => {
    switch (result.type) {
      case 'property':
        return 'bg-blue-500/10 text-blue-500';
      case 'loan':
        return 'bg-green-500/10 text-green-500';
      case 'prediction':
        return 'bg-purple-500/10 text-purple-500';
    }
  };

  const handleClick = () => {
    switch (result.type) {
      case 'property':
        navigate(`/property/${result.id}`);
        break;
      case 'loan':
        navigate(`/loan/${result.id}`);
        break;
      case 'prediction':
        navigate(`/predict?market=${result.id}`);
        break;
    }
  };

  const highlightText = (text: string) => {
    if (!highlightQuery) return text;
    
    const words = highlightQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return text;

    const regex = new RegExp(`(${words.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (words.some(word => part.toLowerCase() === word)) {
        return (
          <mark key={index} className="bg-primary/20 text-primary px-0.5 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <Card 
      className="hover:border-primary/50 transition-colors cursor-pointer group"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', getTypeColor())}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {getTypeLabel()}
              </Badge>
            </div>
            <h3 className="font-semibold truncate">
              {highlightText(result.title)}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {result.subtitle}
            </p>
            {result.matches.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Matches: {result.matches.map((m, i) => (
                  <span key={i}>
                    {i > 0 && ', '}
                    <span className="text-primary">"{m}"</span>
                  </span>
                ))}
              </p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
