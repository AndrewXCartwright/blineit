import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface LiquidityRequest {
  id: string;
  request_number: string;
  property_name: string;
  quantity: number;
  net_payout: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'denied';
  requested_at: string;
  progress: number;
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', progress: 25 },
  approved: { label: 'Approved', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', progress: 50 },
  processing: { label: 'Processing', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', progress: 75 },
  completed: { label: 'Completed', color: 'bg-success/20 text-success border-success/30', progress: 100 },
  denied: { label: 'Denied', color: 'bg-destructive/20 text-destructive border-destructive/30', progress: 0 },
};

export const LiquidityRequestsSection = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['my-liquidity-requests', user?.id],
    queryFn: async (): Promise<LiquidityRequest[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('liquidity_requests')
        .select('*')
        .eq('investor_id', user.id)
        .order('requested_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching liquidity requests:', error);
        return [];
      }

      // For now, return mock data if no real data
      if (!data || data.length === 0) {
        return getMockRequests();
      }

      return data.map(request => ({
        id: request.id,
        request_number: request.request_number,
        property_name: 'Property', // Would need to join
        quantity: request.quantity,
        net_payout: Number(request.net_payout),
        status: request.status as LiquidityRequest['status'],
        requested_at: request.requested_at,
        progress: statusConfig[request.status as keyof typeof statusConfig]?.progress || 0,
      }));
    },
    enabled: !!user?.id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (isLoading || requests.length === 0) return null;

  return (
    <Card className="bg-card border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">LIQUIDITY REQUESTS</CardTitle>
                <Badge variant="secondary" className="text-xs">{requests.length}</Badge>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {requests.map((request) => {
              const config = statusConfig[request.status];
              
              return (
                <div key={request.id} className="p-4 rounded-xl bg-secondary border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Shield className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{request.property_name}</h4>
                        <p className="text-xs text-muted-foreground">{request.request_number}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={config.color}>
                      {config.label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Tokens</p>
                      <p className="font-medium text-foreground">{request.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Net Payout</p>
                      <p className="font-medium text-success">{formatCurrency(request.net_payout)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="font-medium text-foreground">{formatDistanceToNow(new Date(request.requested_at), { addSuffix: false })} ago</p>
                    </div>
                  </div>

                  {request.status !== 'denied' && request.status !== 'completed' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{request.progress}%</span>
                      </div>
                      <Progress value={request.progress} className="h-2" />
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

function getMockRequests(): LiquidityRequest[] {
  return [
    {
      id: '1',
      request_number: '#LIQ-2026-0847',
      property_name: 'Downtown Tower',
      quantity: 100,
      net_payout: 11580,
      status: 'processing',
      requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 75,
    },
    {
      id: '2',
      request_number: '#LIQ-2026-0839',
      property_name: 'Pacific View Plaza',
      quantity: 50,
      net_payout: 5825,
      status: 'completed',
      requested_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 100,
    },
  ];
}
