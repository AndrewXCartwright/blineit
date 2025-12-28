import { useState } from "react";
import { ArrowLeft, Link, Plus, Trash2, Eye, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BottomNav } from "@/components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useWebhooks, useCreateWebhook, useDeleteWebhook, WEBHOOK_EVENTS } from "@/hooks/useDeveloperApi";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

const DeveloperWebhooks = () => {
  const navigate = useNavigate();
  const { data: webhooks, isLoading } = useWebhooks();
  const createWebhook = useCreateWebhook();
  const deleteWebhook = useDeleteWebhook();

  const [showCreate, setShowCreate] = useState(false);
  const [showSecret, setShowSecret] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const toggleEvent = (event: string) => {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleCreate = async () => {
    if (!url.startsWith("https://")) {
      toast({ title: "Error", description: "URL must use HTTPS.", variant: "destructive" });
      return;
    }
    await createWebhook.mutateAsync({ name: name || "Unnamed Webhook", url, events });
    setShowCreate(false);
    setName("");
    setUrl("");
    setEvents([]);
  };

  const handleDelete = async (id: string) => {
    await deleteWebhook.mutateAsync(id);
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    toast({ title: "Copied!", description: "Secret copied to clipboard." });
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const eventsByCategory = WEBHOOK_EVENTS.reduce((acc, event) => {
    if (!acc[event.category]) acc[event.category] = [];
    acc[event.category].push(event);
    return acc;
  }, {} as Record<string, typeof WEBHOOK_EVENTS>);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/developers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Link className="h-5 w-5 text-green-500" />
              Webhooks
            </h1>
            <p className="text-sm text-muted-foreground">Receive real-time event notifications</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Webhooks List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-24" />
              </Card>
            ))}
          </div>
        ) : webhooks?.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Link className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No webhooks configured</p>
              <Button className="mt-3" onClick={() => setShowCreate(true)}>
                Create Your First Webhook
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {webhooks?.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{webhook.name}</span>
                    </div>
                    <Badge variant={webhook.is_active ? "default" : "secondary"}>
                      {webhook.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground font-mono mb-2 truncate">
                    {webhook.url}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {webhook.events.slice(0, 3).map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                    {webhook.events.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{webhook.events.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mb-3">
                    Last triggered:{" "}
                    {webhook.last_triggered_at
                      ? formatDistanceToNow(new Date(webhook.last_triggered_at), { addSuffix: true })
                      : "Never"}
                    {webhook.failure_count > 0 && (
                      <span className="text-red-500 ml-2">
                        ({webhook.failure_count} failures)
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowSecret(webhook.secret)}>
                      <Eye className="h-3 w-3 mr-1" />
                      View Secret
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(webhook.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button className="w-full" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Webhook
        </Button>

        {/* Available Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(eventsByCategory).map(([category, catEvents]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{category} Events</h4>
                <ul className="text-sm space-y-1">
                  {catEvents.map((event) => (
                    <li key={event.value}>
                      <code className="text-xs bg-muted px-1 rounded">{event.value}</code>
                      <span className="text-muted-foreground ml-2">- {event.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-app.com/webhooks"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Must be HTTPS</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-name">Name (optional)</Label>
              <Input
                id="webhook-name"
                placeholder="My Webhook"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Select events to receive:</Label>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {WEBHOOK_EVENTS.map((event) => (
                  <div key={event.value} className="flex items-center gap-2">
                    <Checkbox
                      id={event.value}
                      checked={events.includes(event.value)}
                      onCheckedChange={() => toggleEvent(event.value)}
                    />
                    <Label htmlFor={event.value} className="cursor-pointer text-sm">
                      {event.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!url || events.length === 0 || createWebhook.isPending}
            >
              {createWebhook.isPending ? "Creating..." : "Create Webhook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Secret Dialog */}
      <Dialog open={!!showSecret} onOpenChange={() => setShowSecret(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook Signing Secret</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use this secret to verify webhook signatures:
            </p>

            <div className="relative">
              <Input
                value={showSecret || ""}
                readOnly
                className="font-mono text-xs pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => copySecret(showSecret || "")}
              >
                {copiedSecret ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <p className="text-xs font-mono whitespace-pre-wrap">
{`// Node.js verification example
const crypto = require('crypto');

function verify(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === \`sha256=\${expected}\`;
}`}
                </p>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowSecret(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default DeveloperWebhooks;