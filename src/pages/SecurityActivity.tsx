import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Smartphone, Check, X, Lock, Fingerprint, Key, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBiometric } from "@/hooks/useBiometric";
import { format, isToday, isYesterday } from "date-fns";

export default function SecurityActivity() {
  const navigate = useNavigate();
  const { authEvents, loadingEvents } = useBiometric();

  const getEventIcon = (eventType: string, authMethod: string) => {
    if (eventType === "login") return <LogIn className="h-4 w-4" />;
    if (authMethod === "biometric") return <Fingerprint className="h-4 w-4" />;
    if (authMethod === "pin") return <Lock className="h-4 w-4" />;
    if (authMethod === "password") return <Key className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case "login": return "Login";
      case "transaction_approve": return "Transaction Approved";
      case "transfer_approve": return "Transfer Approved";
      case "settings_change": return "Settings Changed";
      default: return eventType;
    }
  };

  const getAuthMethodLabel = (method: string) => {
    switch (method) {
      case "biometric": return "Biometric";
      case "pin": return "PIN";
      case "password": return "Password";
      case "2fa": return "2FA";
      default: return method;
    }
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return `Today ${format(date, "h:mm a")}`;
    }
    if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`;
    }
    return format(date, "MMM d, yyyy h:mm a");
  };

  // Group events by date
  const groupedEvents = authEvents.reduce((acc, event) => {
    const date = new Date(event.created_at);
    let key: string;
    
    if (isToday(date)) {
      key = "Today";
    } else if (isYesterday(date)) {
      key = "Yesterday";
    } else {
      key = format(date, "MMMM d, yyyy");
    }

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(event);
    return acc;
  }, {} as Record<string, typeof authEvents>);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Activity
            </h1>
          </div>
        </div>

        {loadingEvents ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : authEvents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No security events recorded</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([date, events]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
                <Card>
                  <CardContent className="divide-y p-0">
                    {events.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${event.success ? "bg-green-500/10" : "bg-destructive/10"}`}>
                            {getEventIcon(event.event_type, event.auth_method)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {getEventLabel(event.event_type)}
                              </span>
                              <Badge 
                                variant={event.success ? "secondary" : "destructive"}
                                className="text-xs"
                              >
                                {getAuthMethodLabel(event.auth_method)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(event.created_at), "h:mm a")}
                              {event.device_id && " • Device"}
                            </p>
                          </div>
                        </div>
                        <div className={event.success ? "text-green-500" : "text-destructive"}>
                          {event.success ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <X className="h-5 w-5" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
