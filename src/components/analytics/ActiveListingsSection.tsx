import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, MoreVertical, Edit, XCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface ActiveListing {
  id: string;
  listing_number: string;
  property_name: string;
  quantity: number;
  price_per_token: number;
  status: 'active' | 'pending';
  listed_at: string;
}

export const ActiveListingsSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['my-active-listings', user?.id],
    queryFn: async (): Promise<ActiveListing[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('secondary_listings')
        .select(`
          id,
          listing_number,
          quantity,
          price_per_token,
          status,
          listed_at,
          property_id
        `)
        .eq('seller_id', user.id)
        .in('status', ['active', 'pending'])
        .order('listed_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        return [];
      }

      // For now, return mock data if no real data
      if (!data || data.length === 0) {
        return getMockListings();
      }

      return data.map(listing => ({
        id: listing.id,
        listing_number: listing.listing_number || `LST-${listing.id.slice(0, 6)}`,
        property_name: 'Property', // Would need to join with properties table
        quantity: listing.quantity,
        price_per_token: Number(listing.price_per_token),
        status: listing.status as 'active' | 'pending',
        listed_at: listing.listed_at,
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

  if (isLoading || listings.length === 0) return null;

  return (
    <Card className="bg-card border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">MY ACTIVE LISTINGS</CardTitle>
                <Badge variant="secondary" className="text-xs">{listings.length}</Badge>
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
            {listings.map((listing) => (
              <div key={listing.id} className="p-4 rounded-xl bg-secondary border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{listing.property_name}</h4>
                      <p className="text-xs text-muted-foreground">{listing.listing_number}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Price
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Listing
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="grid grid-cols-4 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Tokens</p>
                    <p className="font-medium text-foreground">{listing.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Price/Token</p>
                    <p className="font-medium text-foreground">{formatCurrency(listing.price_per_token)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Value</p>
                    <p className="font-medium text-foreground">{formatCurrency(listing.quantity * listing.price_per_token)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Listed</p>
                    <p className="font-medium text-foreground">{formatDistanceToNow(new Date(listing.listed_at), { addSuffix: false })} ago</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Badge 
                    variant={listing.status === 'active' ? 'default' : 'secondary'}
                    className={listing.status === 'active' ? 'bg-success/20 text-success border-success/30' : ''}
                  >
                    {listing.status === 'active' ? 'Active' : 'Pending Sale'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

function getMockListings(): ActiveListing[] {
  return [
    {
      id: '1',
      listing_number: 'LST-2026-0042',
      property_name: 'Sunset Apartments',
      quantity: 50,
      price_per_token: 128.50,
      status: 'active',
      listed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      listing_number: 'LST-2026-0038',
      property_name: 'Marina Heights',
      quantity: 25,
      price_per_token: 115.00,
      status: 'active',
      listed_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}
