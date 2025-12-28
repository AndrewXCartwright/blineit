import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Webhook, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateWebhook } from "@/hooks/useDeveloperApi";

const AVAILABLE_EVENTS = [
  { id: "dividend.paid", label: "Dividend Paid", description: "When a dividend payment is received" },
  { id: "interest.paid", label: "Interest Paid", description: "When loan interest is received" },
  { id: "investment.completed", label: "Investment Completed", description: "When a new investment is made" },
  { id: "trade.executed", label: "Trade Executed", description: "When a secondary market trade completes" },
  { id: "order.filled", label: "Order Filled", description: "When your order is filled" },
  { id: "order.cancelled", label: "Order Cancelled", description: "When an order is cancelled" },
  { id: "price_alert.triggered", label: "Price Alert Triggered", description: "When a price alert is hit" },
  { id: "prediction.resolved", label: "Prediction Resolved", description: "When a prediction market resolves" },
  { id: "property.new", label: "New Property", description: "When a new property is listed" },
  { id: "property.funded", label: "Property Funded", description: "When a property is fully funded" },
  { id: "loan.new", label: "New Loan", description: "When a new loan is available" },
];

const DeveloperWebhookCreate = () => {
  const navigate = useNavigate();
  const createWebhook = useCreateWebhook();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSubmit = () => {
    if (!url || selectedEvents.length === 0) return;

    createWebhook.mutate({
      name: name || "My Webhook",
      url,
      events: selectedEvents,
    }, {
      onSuccess: () => navigate("/developers/webhooks")
    });
  };

  const isValid = url.startsWith("https://") && selectedEvents.length > 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/developers/webhooks")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Webhook</h1>
            <p className="text-muted-foreground text-sm">Receive real-time notifications</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                placeholder="My Webhook"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Webhook URL</Label>
              <Input
                id="url"
                placeholder="https://your-server.com/webhook"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Must be HTTPS</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {AVAILABLE_EVENTS.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleEvent(event.id)}
                >
                  <Checkbox
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => toggleEvent(event.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.label}</p>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                  </div>
                  {selectedEvents.includes(event.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full" 
          disabled={!isValid || createWebhook.isPending}
          onClick={handleSubmit}
        >
          {createWebhook.isPending ? "Creating..." : "Create Webhook"}
        </Button>
      </div>
    </div>
  );
};

export default DeveloperWebhookCreate;
