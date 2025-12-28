import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Phone, Mail, Calendar, MessageSquare, Clock, Video, CheckCircle, Send, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { ScheduleCallModal } from "@/components/institutional/ScheduleCallModal";
import { useRelationshipManager, mockRelationshipManager } from "@/hooks/useInstitutional";

const InstitutionalContact = () => {
  const navigate = useNavigate();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { manager } = useRelationshipManager();

  const quickActions = [
    { icon: Phone, label: "Call Now", action: () => window.open(`tel:${manager.phone}`) },
    { icon: Video, label: "Video Call", action: () => setShowScheduleModal(true) },
    { icon: Calendar, label: "Schedule", action: () => setShowScheduleModal(true) },
    { icon: Mail, label: "Email", action: () => window.open(`mailto:${manager.email}`) }
  ];

  const recentInteractions = [
    { date: "2025-01-10", type: "Call", topic: "Q4 Portfolio Review", duration: "25 min" },
    { date: "2024-12-15", type: "Email", topic: "Tax Document Questions", duration: null },
    { date: "2024-11-20", type: "Meeting", topic: "New Fund Opportunity", duration: "45 min" }
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSending(false);
    setMessage("");
    toast.success("Message sent to your relationship manager");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display font-bold text-lg">Relationship Manager</h1>
        </div>
      </header>
      
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={manager.photo_url || undefined} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {manager.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{manager.name}</h2>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                    Available
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-2">Senior Relationship Manager</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Available Mon-Fri, 9AM-6PM EST
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Specializes in helping high-net-worth individuals and family offices navigate alternative investments.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(action => (
            <Button key={action.label} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={action.action}>
              <action.icon className="h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><Phone className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{manager.phone}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => window.open(`tel:${manager.phone}`)}>Call</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><Mail className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{manager.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => window.open(`mailto:${manager.email}`)}>Email</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5" />Send a Message</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="Type your message here..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
            <Button className="w-full" onClick={handleSendMessage} disabled={!message.trim() || sending}>
              {sending ? "Sending..." : <><Send className="h-4 w-4 mr-2" />Send Message</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Interactions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInteractions.map((interaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">{interaction.topic}</p>
                      <p className="text-xs text-muted-foreground">{interaction.type} • {interaction.date}{interaction.duration && ` • ${interaction.duration}`}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" size="lg" onClick={() => setShowScheduleModal(true)}>
          <Calendar className="h-4 w-4 mr-2" />Schedule a Call
        </Button>
      </main>

      {showScheduleModal && <ScheduleCallModal manager={manager} onClose={() => setShowScheduleModal(false)} />}
    </div>
  );
};

export default InstitutionalContact;
