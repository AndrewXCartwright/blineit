import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, Play, Pause, Settings, Trash2, RefreshCw, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BottomNav } from '@/components/BottomNav';
import { useAutoInvestPlan, useAutoInvestExecutions, usePausePlan, useResumePlan, useCancelPlan } from '@/hooks/useAutoInvest';
import { formatCurrency } from '@/lib/formatters';
import { format, formatDistanceToNow, addMonths } from 'date-fns';

const frequencyLabels: Record<string, string> = {
  weekly: 'week',
  biweekly: '2 weeks',
  monthly: 'month',
  quarterly: 'quarter',
};

const AutoInvestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: plan, isLoading } = useAutoInvestPlan(id);
  const { data: executions } = useAutoInvestExecutions(id);
  const pausePlan = usePausePlan();
  const resumePlan = useResumePlan();
  const cancelPlan = useCancelPlan();

  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [pauseDuration, setPauseDuration] = useState<'indefinite' | '1month' | '3months'>('indefinite');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/auto-invest">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          </div>
        </header>
        <main className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
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
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <Link to="/auto-invest">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </header>
        <main className="p-4 text-center py-12">
          <p className="text-muted-foreground">Plan not found</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  const nextDate = new Date(plan.next_execution_date);
  const isUpcoming = nextDate > new Date();

  const handlePause = async () => {
    let pauseUntil: string | undefined;
    if (pauseDuration === '1month') {
      pauseUntil = format(addMonths(new Date(), 1), 'yyyy-MM-dd');
    } else if (pauseDuration === '3months') {
      pauseUntil = format(addMonths(new Date(), 3), 'yyyy-MM-dd');
    }
    await pausePlan.mutateAsync({ planId: plan.id, pauseUntil });
    setShowPauseDialog(false);
  };

  const handleResume = async () => {
    await resumePlan.mutateAsync(plan.id);
  };

  const handleCancel = async () => {
    await cancelPlan.mutateAsync(plan.id);
    setShowCancelDialog(false);
    navigate('/auto-invest');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/auto-invest">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-bold">{plan.name}</h1>
              </div>
            </div>
          </div>
          <Badge 
            variant={plan.status === 'active' ? 'default' : plan.status === 'paused' ? 'secondary' : 'outline'}
            className={plan.status === 'active' ? 'bg-green-500' : ''}
          >
            {plan.status === 'active' && <span className="mr-1">●</span>}
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </Badge>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold">{formatCurrency(plan.amount)}</p>
              <p className="text-xs text-muted-foreground">/{frequencyLabels[plan.frequency]}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold">{formatCurrency(plan.total_invested)}</p>
              <p className="text-xs text-muted-foreground">Total Invested</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold">{plan.total_executions}</p>
              <p className="text-xs text-muted-foreground">Executions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">Dividends Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Next Investment */}
        {plan.status === 'active' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Next Investment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">
                {format(nextDate, 'MMMM d, yyyy')} ({formatDistanceToNow(nextDate, { addSuffix: true })})
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Will invest {formatCurrency(plan.amount)}:</p>
                {plan.allocations?.map(alloc => (
                  <p key={alloc.id}>
                    • {alloc.property?.name || alloc.category}: {formatCurrency(plan.amount * alloc.allocation_percent / 100)} ({alloc.allocation_percent}%)
                  </p>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Skip Next</Button>
                <Button size="sm">
                  <Zap className="h-4 w-4 mr-1" />
                  Invest Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Allocation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plan.allocations?.map(alloc => (
                <div key={alloc.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alloc.property?.name || alloc.category}</p>
                    {alloc.property && (
                      <p className="text-sm text-muted-foreground">
                        {alloc.property.city}, {alloc.property.state} • {alloc.property.apy}% APY
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{alloc.allocation_percent}%</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(plan.amount * alloc.allocation_percent / 100)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Investment History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Investment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {executions && executions.length > 0 ? (
              <div className="space-y-3">
                {executions.slice(0, 5).map(exec => (
                  <Link 
                    key={exec.id} 
                    to={`/auto-invest/execution/${exec.id}`}
                    className="flex items-center justify-between p-2 -mx-2 rounded hover:bg-accent/50"
                  >
                    <div>
                      <p className="font-medium">{format(new Date(exec.execution_date), 'MMM d, yyyy')}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(exec.actual_amount)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={exec.status === 'completed' ? 'default' : exec.status === 'partial' ? 'secondary' : 'destructive'}>
                        {exec.status === 'completed' && '✓'}
                        {exec.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
                {executions.length > 5 && (
                  <Button variant="ghost" className="w-full">View Full History</Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No executions yet. First investment on {format(nextDate, 'MMM d, yyyy')}.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Plan Settings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Plan Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Edit Plan
              </Button>
              {plan.status === 'active' ? (
                <Button variant="outline" size="sm" onClick={() => setShowPauseDialog(true)}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause Plan
                </Button>
              ) : plan.status === 'paused' ? (
                <Button variant="outline" size="sm" onClick={handleResume}>
                  <Play className="h-4 w-4 mr-1" />
                  Resume Plan
                </Button>
              ) : null}
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => setShowCancelDialog(true)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Cancel Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Pause Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Auto-Invest Plan</DialogTitle>
            <DialogDescription>
              Your next scheduled investment on {format(nextDate, 'MMM d, yyyy')} will be skipped.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={pauseDuration} onValueChange={(v) => setPauseDuration(v as any)}>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
              <RadioGroupItem value="indefinite" />
              <span>Indefinitely (manual resume required)</span>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
              <RadioGroupItem value="1month" />
              <span>1 month (auto-resume)</span>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
              <RadioGroupItem value="3months" />
              <span>3 months (auto-resume)</span>
            </label>
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>Cancel</Button>
            <Button onClick={handlePause} disabled={pausePlan.isPending}>
              {pausePlan.isPending ? 'Pausing...' : 'Pause Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Auto-Invest Plan</DialogTitle>
            <DialogDescription>
              This plan has invested {formatCurrency(plan.total_invested)} over {plan.total_executions} executions.
              Cancelling will stop all future investments. Your existing holdings will NOT be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep Plan</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelPlan.isPending}>
              {cancelPlan.isPending ? 'Cancelling...' : 'Cancel Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default AutoInvestDetail;
