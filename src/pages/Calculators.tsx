import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, Landmark, Target, PieChart, RefreshCw, Calculator } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';

const calculators = [
  {
    id: 'equity',
    title: 'Equity Return Calculator',
    description: 'Calculate potential returns from property token investments including dividends and appreciation.',
    icon: Building2,
    path: '/calculators/equity',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'debt',
    title: 'Debt Return Calculator',
    description: 'Model fixed income returns from loan investments with interest payment schedules.',
    icon: Landmark,
    path: '/calculators/debt',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'prediction',
    title: 'Prediction Payout Calculator',
    description: 'Calculate potential winnings based on bet amount and current market odds.',
    icon: Target,
    path: '/calculators/prediction',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    id: 'portfolio',
    title: 'Portfolio Builder',
    description: 'Plan your ideal portfolio allocation across multiple assets and see projected returns.',
    icon: PieChart,
    path: '/calculators/portfolio',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'compound',
    title: 'Compound Growth Calculator',
    description: 'See how reinvesting dividends can grow your wealth over time with compound interest.',
    icon: RefreshCw,
    path: '/calculators/compound',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
];

export default function Calculators() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">Investment Calculators</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Model Your Returns</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Use our calculators to project potential returns and make informed investment decisions before committing funds.
          </p>
        </div>

        {/* Calculator Cards */}
        <div className="space-y-4">
          {calculators.map((calc) => (
            <Link key={calc.id} to={calc.path}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${calc.bgColor}`}>
                      <calc.icon className={`h-6 w-6 ${calc.color}`} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">{calc.title}</CardTitle>
                  <CardDescription>{calc.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Tips */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">💡 Investment Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Diversify across equity, debt, and predictions to balance risk</p>
            <p>• Reinvesting dividends can significantly boost long-term returns</p>
            <p>• Consider your investment timeline when choosing assets</p>
            <p>• Save your calculations to track and compare scenarios</p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
