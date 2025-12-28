import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, RefreshCw, Calendar, TrendingUp, Play, Pause, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { useAutoInvestPlans, useAutoInvestStats, AutoInvestPlan } from '@/hooks/useAutoInvest';
import { formatCurrency } from '@/lib/formatters';
import { format, formatDistanceToNow } from 'date-fns';

const frequencyLabels: Record<string, string> = {
  weekly: 'week',
  biweekly: '2 weeks',
  monthly: 'month',
  quarterly: 'quarter',
};

const PlanCard = ({ plan }: { plan: AutoInvestPlan }) => {
  const navigate = useNavigate();
  const nextDate = new Date(plan.next_execution_date);
  const isUpcoming = nextDate > new Date();

  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => navigate(`/auto-invest/${plan.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <RefreshCw className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{plan.name}</h3>
            </div>
          </div>
          <Badge 
            variant={plan.status === 'active' ? 'default' : plan.status === 'paused' ? 'secondary' : 'outline'}
            className={plan.status === 'active' ? 'bg-green-500' : ''}
          >
            {plan.status === 'active' && <span className="mr-1">●</span>}
            {plan.status === 'paused' && <Pause className="h-3 w-3 mr-1" />}
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          {formatCurrency(plan.amount)}/{frequencyLabels[plan.frequency]}
        </p>

        {plan.status === 'active' && isUpcoming && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span>Next: {format(nextDate, 'MMM d, yyyy')} ({formatDistanceToNow(nextDate, { addSuffix: false })})</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Total invested: {formatCurrency(plan.total_invested)} ({plan.total_executions} executions)</span>
        </div>
      </CardContent>
    </Card>
  );
};

const AutoInvest = () => {
  const { data: plans, isLoading: plansLoading } = useAutoInvestPlans();
  const { data: stats, isLoading: statsLoading } = useAutoInvestStats();

  const activePlans = plans?.filter(p => p.status !== 'cancelled') || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Auto-Invest</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Set it and forget it. Build wealth automatically.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats?.activePlans || 0}</p>
              <p className="text-xs text-muted-foreground">Active Plans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{formatCurrency(stats?.monthlyAmount || 0)}</p>
              <p className="text-xs text-muted-foreground">Monthly Amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{formatCurrency(stats?.totalInvested || 0)}</p>
              <p className="text-xs text-muted-foreground">Total Invested</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats?.totalExecutions || 0}</p>
              <p className="text-xs text-muted-foreground">Total Executions</p>
            </CardContent>
          </Card>
        </div>

        {/* Plans List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Auto-Invest Plans</h2>

          {plansLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activePlans.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Auto-Invest Plans Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first plan to start investing automatically
                </p>
                <Link to="/auto-invest/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activePlans.map(plan => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>

        {/* Create New Plan Button */}
        {activePlans.length > 0 && (
          <div className="flex justify-center">
            <Link to="/auto-invest/create">
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create New Plan
              </Button>
            </Link>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default AutoInvest;
