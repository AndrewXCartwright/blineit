import { useState } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RelationshipManager } from "@/hooks/useInstitutional";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

interface Props {
  manager: RelationshipManager;
  onClose: () => void;
}

const topics = [
  { value: "new_investment", label: "New Investment Opportunity" },
  { value: "existing_investment", label: "Existing Investment Question" },
  { value: "distribution", label: "Distribution Inquiry" },
  { value: "tax_k1", label: "Tax / K-1 Question" },
  { value: "general", label: "General Consultation" },
];

const generateTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 5; i++) {
    const date = addDays(new Date(), i + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
      slots.push({
        date: format(date, "yyyy-MM-dd"),
        dateLabel: format(date, "EEE, MMM d"),
        times: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
      });
    }
  }
  return slots;
};

export function ScheduleCallModal({ manager, onClose }: Props) {
  const [topic, setTopic] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = generateTimeSlots();

  const handleSubmit = async () => {
    if (!topic || !selectedDate || !selectedTime) {
      toast.error("Please select a topic, date, and time");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Call scheduled successfully! You'll receive a calendar invite shortly.");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Schedule a Call
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Manager Info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="w-12 h-12">
                <AvatarImage src={manager.photo_url || undefined} />
                <AvatarFallback>{manager.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{manager.name}</p>
                <p className="text-sm text-muted-foreground">Senior Relationship Manager</p>
              </div>
            </div>

            {/* Topic Selection */}
            <div className="space-y-3">
              <Label>What would you like to discuss?</Label>
              <RadioGroup value={topic} onValueChange={setTopic} className="space-y-2">
                {topics.map((t) => (
                  <Label 
                    key={t.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      topic === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={t.value} />
                    <span className="text-sm">{t.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <Label>Select a Date</Label>
              <div className="grid grid-cols-5 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.date}
                    onClick={() => { setSelectedDate(slot.date); setSelectedTime(""); }}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      selectedDate === slot.date 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="text-xs font-medium">{slot.dateLabel.split(", ")[0]}</p>
                    <p className="text-sm">{slot.dateLabel.split(", ")[1]}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-3">
                <Label>Select a Time</Label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.find(s => s.date === selectedDate)?.times.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg border text-sm transition-colors ${
                        selectedTime === time 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Clock className="w-3 h-3 mx-auto mb-1" />
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea 
                id="notes"
                placeholder="Any specific questions or topics you'd like to cover..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit */}
            <Button 
              className="w-full gap-2" 
              onClick={handleSubmit}
              disabled={!topic || !selectedDate || !selectedTime || isSubmitting}
            >
              <Calendar className="w-4 h-4" />
              {isSubmitting ? "Scheduling..." : "Schedule Call"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
