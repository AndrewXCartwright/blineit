import { Check } from "lucide-react";
import type { ProcessStep } from "@/data/investmentTypes";

interface ProcessFlowProps {
  steps: ProcessStep[];
}

export function ProcessFlow({ steps }: ProcessFlowProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <div key={step.step} className="relative">
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="absolute left-5 top-12 w-0.5 h-full bg-gradient-to-b from-primary/50 to-primary/20" />
          )}
          
          <div className="flex gap-4 pb-6">
            {/* Step number circle */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{step.step}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
