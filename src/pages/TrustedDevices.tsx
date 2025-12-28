import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Smartphone, Laptop, Monitor, Trash2, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBiometric } from "@/hooks/useBiometric";
import { format } from "date-fns";

export default function TrustedDevices() {
  const navigate = useNavigate();
  const { 
    allDeviceSettings, 
    deviceId,
    loadingSettings,
    removeDevice,
    isRemovingDevice,
  } = useBiometric();

  const getDeviceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("iphone") || lower.includes("android") || lower.includes("mobile")) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (lower.includes("mac") || lower.includes("windows") || lower.includes("laptop")) {
      return <Laptop className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const handleRemoveDevice = (settingsId: string) => {
    if (confirm("Remove this device? You'll need to set up biometrics again on that device.")) {
      removeDevice(settingsId);
    }
  };

  const handleRemoveAllOthers = () => {
    if (confirm("Remove all other devices? They'll need to set up biometrics again.")) {
      allDeviceSettings
        .filter(d => d.device_id !== deviceId)
        .forEach(d => removeDevice(d.id));
    }
  };

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
              Trusted Devices
            </h1>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Devices</CardTitle>
            <CardDescription>
              Devices with biometric or PIN authentication enabled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingSettings ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))
            ) : allDeviceSettings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No devices configured</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/settings/security/biometric")}
                >
                  Set Up Biometrics
                </Button>
              </div>
            ) : (
              allDeviceSettings.map((device, index) => {
                const isCurrentDevice = device.device_id === deviceId;
                
                return (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={isCurrentDevice ? "border-primary" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${isCurrentDevice ? "bg-primary/10" : "bg-muted"}`}>
                              {getDeviceIcon(device.device_name)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{device.device_name}</span>
                                {isCurrentDevice && (
                                  <Badge variant="secondary" className="text-xs">
                                    This Device
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  {device.biometric_enabled && (
                                    <Badge variant="outline" className="text-xs">
                                      {device.biometric_type === "face_id" ? "Face ID" : 
                                       device.biometric_type === "touch_id" ? "Touch ID" : "Fingerprint"}
                                    </Badge>
                                  )}
                                  {device.pin_enabled && (
                                    <Badge variant="outline" className="text-xs">PIN</Badge>
                                  )}
                                </div>
                                <p className="text-xs">
                                  Last used: {device.last_biometric_auth 
                                    ? format(new Date(device.last_biometric_auth), "MMM d, yyyy h:mm a")
                                    : format(new Date(device.updated_at), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                          </div>
                          {!isCurrentDevice && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveDevice(device.id)}
                              disabled={isRemovingDevice}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>

        {allDeviceSettings.length > 1 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleRemoveAllOthers}
            disabled={isRemovingDevice}
          >
            Remove All Other Devices
          </Button>
        )}
      </div>
    </div>
  );
}
