import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Webhook, Copy, RefreshCw, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useWebhooks, useUpdateWebhook, useDeleteWebhook } from "@/hooks/useDeveloperApi";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

const DeveloperWebhookDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: webhooks } = useWebhooks();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const [showSecret, setShowSecret] = useState(false);

  const webhook = webhooks?.find(w => w.id === id);

  if (!webhook) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Webhook Not Found</h3>
            <Button onClick={() => navigate("/developers/webhooks")}>Back to Webhooks</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const toggleActive = () => {
    updateWebhook.mutate({ id: webhook.id, updates: { is_active: !webhook.is_active } });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      deleteWebhook.mutate(webhook.id, {
        onSuccess: () => navigate("/developers/webhooks")
      });
    }
  };

  const events = webhook.events as string[];

  // Mock delivery logs
  const mockDeliveries = [
    { id: "1", event: "dividend.paid", status: "delivered", statusCode: 200, time: "2 hours ago", responseTime: 145 },
    { id: "2", event: "trade.executed", status: "delivered", statusCode: 200, time: "5 hours ago", responseTime: 98 },
    { id: "3", event: "price_alert.triggered", status: "failed", statusCode: 500, time: "1 day ago", responseTime: 0 },
    { id: "4", event: "dividend.paid", status: "delivered", statusCode: 200, time: "2 days ago", responseTime: 112 },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/developers/webhooks")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{webhook.name}</h1>
            <p className="text-muted-foreground text-sm truncate">{webhook.url}</p>
          </div>
          <Badge variant={webhook.is_active ? "default" : "secondary"}>
            {webhook.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Endpoint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-3 py-2 rounded font-mono flex-1 overflow-hidden text-ellipsis">
                {webhook.url}
              </code>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(webhook.url)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signing Secret</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-3 py-2 rounded font-mono flex-1">
                {showSecret ? webhook.secret : "••••••••••••••••••••••••"}
              </code>
              <Button variant="ghost" size="sm" onClick={() => setShowSecret(!showSecret)}>
                {showSecret ? "Hide" : "Show"}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(webhook.secret)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this secret to verify webhook signatures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscribed Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {events.map((event) => (
                <Badge key={event} variant="outline">{event}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center gap-3 p-3 rounded-lg border">
                {delivery.status === "delivered" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{delivery.event}</p>
                  <p className="text-xs text-muted-foreground">
                    {delivery.status === "delivered" 
                      ? `${delivery.statusCode} OK • ${delivery.responseTime}ms`
                      : `${delivery.statusCode} Error`}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{delivery.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Enable or disable this webhook</p>
              </div>
              <Switch checked={webhook.is_active} onCheckedChange={toggleActive} />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium">{format(new Date(webhook.created_at), "MMM d, yyyy")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Triggered</span>
                <p className="font-medium">
                  {webhook.last_triggered_at 
                    ? formatDistanceToNow(new Date(webhook.last_triggered_at), { addSuffix: true })
                    : "Never"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Webhook
        </Button>
      </div>
    </div>
  );
};

export default DeveloperWebhookDetail;
