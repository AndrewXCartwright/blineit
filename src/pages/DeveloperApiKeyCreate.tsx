import { useState } from "react";
import { ArrowLeft, Check, Copy, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BottomNav } from "@/components/BottomNav";
import { useCreateApiKey, API_PERMISSIONS } from "@/hooks/useDeveloperApi";
import { toast } from "@/hooks/use-toast";

type Step = 1 | 2 | 3 | 4;

const DeveloperApiKeyCreate = () => {
  const navigate = useNavigate();
  const createKey = useCreateApiKey();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<"sandbox" | "production">("sandbox");
  const [expiration, setExpiration] = useState("never");
  const [customExpiry, setCustomExpiry] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["portfolio:read", "properties:read"]);
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([]);
  const [newIp, setNewIp] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const addIp = () => {
    if (newIp && !ipWhitelist.includes(newIp)) {
      setIpWhitelist([...ipWhitelist, newIp]);
      setNewIp("");
    }
  };

  const removeIp = (ip: string) => {
    setIpWhitelist(ipWhitelist.filter((i) => i !== ip));
  };

  const getExpiryDate = (): string | null => {
    if (expiration === "never") return null;
    const days = { "30": 30, "90": 90, "365": 365, custom: 0 }[expiration];
    if (expiration === "custom" && customExpiry) {
      return new Date(customExpiry).toISOString();
    }
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toISOString();
    }
    return null;
  };

  const handleCreate = async () => {
    try {
      const result = await createKey.mutateAsync({
        name,
        environment,
        permissions,
        expiresAt: getExpiryDate(),
        ipWhitelist,
      });
      setCreatedKey(result.fullKey);
      setStep(4);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create API key.", variant: "destructive" });
    }
  };

  const copyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      toast({ title: "Copied!", description: "API key copied to clipboard." });
    }
  };

  const permissionsByCategory = API_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof API_PERMISSIONS>);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              🔑 Create API Key
            </h1>
            <p className="text-sm text-muted-foreground">Step {step} of {step === 4 ? 4 : 3}</p>
          </div>
        </div>
        <Progress value={(step / (step === 4 ? 4 : 3)) * 100} className="mt-4 h-2" />
      </div>

      <div className="p-4">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Key Name</Label>
              <Input
                id="name"
                placeholder="My Portfolio Tracker"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">A friendly name to identify this key</p>
            </div>

            <div className="space-y-3">
              <Label>Environment</Label>
              <RadioGroup value={environment} onValueChange={(v) => setEnvironment(v as "sandbox" | "production")}>
                <Card className={`cursor-pointer ${environment === "sandbox" ? "border-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="sandbox" id="sandbox" />
                      <div>
                        <Label htmlFor="sandbox" className="font-medium cursor-pointer">
                          Sandbox (Testing)
                        </Label>
                        <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <li>• Test with fake data</li>
                          <li>• No real transactions</li>
                          <li>• Unlimited requests</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={`cursor-pointer ${environment === "production" ? "border-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="production" id="production" />
                      <div>
                        <Label htmlFor="production" className="font-medium cursor-pointer">
                          Production (Live)
                        </Label>
                        <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <li>• Real account data</li>
                          <li>• Real transactions</li>
                          <li>• Rate limits apply</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Key Expiration</Label>
              <RadioGroup value={expiration} onValueChange={setExpiration}>
                {[
                  { value: "never", label: "Never expires" },
                  { value: "30", label: "30 days" },
                  { value: "90", label: "90 days" },
                  { value: "365", label: "1 year" },
                  { value: "custom", label: "Custom date" },
                ].map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <Label htmlFor={opt.value} className="cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {expiration === "custom" && (
                <Input
                  type="date"
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              )}
            </div>

            <Button className="w-full" onClick={() => setStep(2)} disabled={!name}>
              Continue →
            </Button>
          </div>
        )}

        {/* Step 2: Permissions */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">Select what this API key can access:</p>

            {Object.entries(permissionsByCategory).map(([category, perms]) => (
              <Card key={category}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {perms.map((perm) => (
                    <div key={perm.value} className="flex items-start gap-3">
                      <Checkbox
                        id={perm.value}
                        checked={permissions.includes(perm.value)}
                        onCheckedChange={() => togglePermission(perm.value)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={perm.value} className="cursor-pointer flex items-center gap-2">
                          {perm.label}
                          {perm.highRisk && (
                            <span className="text-xs text-amber-500 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              High risk
                            </span>
                          )}
                        </Label>
                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)} disabled={permissions.length === 0}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Security */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">IP Whitelist (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Only allow requests from these IP addresses:
                </p>
                {ipWhitelist.map((ip) => (
                  <div key={ip} className="flex items-center gap-2">
                    <Input value={ip} disabled className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => removeIp(ip)}>
                      ×
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="192.168.1.1 or 10.0.0.0/24"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                  />
                  <Button variant="outline" onClick={addIp}>
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Leave empty to allow from any IP</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rate Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Your Plan: Free</p>
                <ul className="text-sm space-y-1">
                  <li>• 1,000 requests/day</li>
                  <li>• 10 requests/minute</li>
                  <li>• 2 concurrent connections</li>
                </ul>
                <Button variant="link" className="px-0 h-auto mt-2 text-primary">
                  Upgrade Plan for Higher Limits
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                ← Back
              </Button>
              <Button className="flex-1" onClick={handleCreate} disabled={createKey.isPending}>
                {createKey.isPending ? "Creating..." : "Create API Key"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && createdKey && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">API Key Created!</h2>
            </div>

            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Copy your API key now!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You won't be able to see it again.
                </p>

                <div className="relative">
                  <Input
                    value={createdKey}
                    readOnly
                    className="font-mono text-xs pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={copyKey}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="text-xs space-y-1">
                  <p><strong>Name:</strong> {name}</p>
                  <p><strong>Environment:</strong> {environment}</p>
                  <p><strong>Permissions:</strong> {permissions.length} scopes</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(c) => setConfirmed(c as boolean)}
              />
              <Label htmlFor="confirm" className="text-sm cursor-pointer">
                I have copied and securely stored my API key
              </Label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/developers/docs")}>
                View Docs
              </Button>
              <Button className="flex-1" onClick={() => navigate("/developers")} disabled={!confirmed}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default DeveloperApiKeyCreate;