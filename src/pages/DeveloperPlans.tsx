import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Zap, Building, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    icon: Zap,
    current: true,
    features: [
      "1,000 requests/day",
      "10 requests/minute",
      "Read-only access",
      "Community support",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: "$29",
    period: "/month",
    icon: Rocket,
    current: false,
    features: [
      "10,000 requests/day",
      "100 requests/minute",
      "Read + Write access",
      "Webhooks (5 endpoints)",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    period: "/month",
    icon: Building,
    current: false,
    popular: true,
    features: [
      "100,000 requests/day",
      "500 requests/minute",
      "Full API access",
      "Webhooks (unlimited)",
      "Priority support",
      "Sandbox environment",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    icon: Building,
    current: false,
    features: [
      "Unlimited requests",
      "Dedicated infrastructure",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated account manager",
    ],
  },
];

const DeveloperPlans = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/developers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">API Plans</h1>
            <p className="text-muted-foreground text-sm">Choose the right plan for your needs</p>
          </div>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card key={plan.id} className={plan.popular ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plan.name}
                          {plan.current && <Badge>Current</Badge>}
                          {plan.popular && <Badge variant="secondary">Popular</Badge>}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.current ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.id === "enterprise" ? (
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  ) : (
                    <Button className="w-full">
                      Upgrade to {plan.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeveloperPlans;
