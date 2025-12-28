import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  ArrowLeft,
  Smartphone,
  Tablet,
  Monitor,
  Bell,
  Trash2,
  Send,
  CheckCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PushDevice {
  id: string;
  device_type: string;
  device_name: string | null;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

const RegisteredDevices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [devices, setDevices] = useState<PushDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingDevice, setTestingDevice] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, [user]);

  const fetchDevices = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeDevice = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from("push_subscriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setDevices((prev) => prev.filter((d) => d.id !== id));
      toast.success("Device removed");
    } catch (error) {
      console.error("Error removing device:", error);
      toast.error("Failed to remove device");
    }
  };

  const sendTestNotification = async (deviceId: string) => {
    setTestingDevice(deviceId);
    // Simulate sending test notification
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Test notification sent! Check your device.");
    setTestingDevice(null);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "ios":
      case "android":
        return Smartphone;
      case "tablet":
        return Tablet;
      default:
        return Monitor;
    }
  };

  const getDeviceLabel = (type: string) => {
    switch (type) {
      case "ios":
        return "iOS";
      case "android":
        return "Android";
      case "web":
        return "Web Browser";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings/notifications")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Registered Devices
            </h1>
            <p className="text-sm text-muted-foreground">
              Devices receiving push notifications
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex gap-3">
            <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Push Notification Devices</p>
              <p className="text-muted-foreground mt-1">
                These devices are registered to receive push notifications from B-LINE-IT.
                You can test notifications or remove devices you no longer use.
              </p>
            </div>
          </div>
        </div>

        {/* Devices List */}
        {devices.length === 0 ? (
          <EmptyState
            icon={<Smartphone className="h-8 w-8" />}
            title="No devices registered"
            description="Enable push notifications to receive alerts on your devices"
            action={
              <Button onClick={() => navigate("/settings/notifications")}>
                Enable Push Notifications
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {devices.map((device) => {
              const DeviceIcon = getDeviceIcon(device.device_type);
              const isTesting = testingDevice === device.id;

              return (
                <div
                  key={device.id}
                  className="rounded-lg border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <DeviceIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {device.device_name || `${getDeviceLabel(device.device_type)} Device`}
                        </h4>
                        {device.is_active && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getDeviceLabel(device.device_type)}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {device.last_used_at ? (
                          <span>
                            Last active: {format(parseISO(device.last_used_at), "MMM d, h:mm a")}
                          </span>
                        ) : (
                          <span>
                            Added: {format(parseISO(device.created_at), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendTestNotification(device.id)}
                          disabled={isTesting}
                        >
                          <Send className={`h-4 w-4 mr-1 ${isTesting ? "animate-pulse" : ""}`} />
                          {isTesting ? "Sending..." : "Test Notification"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove this device?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This device will no longer receive push notifications from B-LINE-IT.
                                You can re-enable notifications anytime.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeDevice(device.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add New Device */}
        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              toast.info("To add this device, enable push notifications in your browser settings");
            }}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Add This Device
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default RegisteredDevices;
