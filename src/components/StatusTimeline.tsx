import { Check, Clock, FileText, CreditCard, Award, Send, X } from "lucide-react";
import type { RequestStatus } from "@/context/AppContext";

const steps = [
  { key: "submitted", label: "تقديم الطلب", icon: Send },
  { key: "under_review", label: "مراجعة المستندات", icon: FileText },
  { key: "approved", label: "الموافقة", icon: Check },
  { key: "payment_pending", label: "السداد", icon: CreditCard },
  { key: "issued", label: "إصدار الشهادة", icon: Award },
] as const;

const statusOrder: Record<string, number> = {
  submitted: 0,
  under_review: 1,
  approved: 2,
  payment_pending: 3,
  issued: 4,
  rejected: -1,
};

const StatusTimeline = ({ status }: { status: RequestStatus }) => {
  const currentIdx = statusOrder[status] ?? -1;

  if (status === "rejected") {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-destructive">
          <X className="w-8 h-8" />
          <span className="text-lg font-semibold">تم رفض الطلب</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full py-6">
      {steps.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex flex-col items-center flex-1 relative">
            {idx > 0 && (
              <div className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 ${
                idx <= currentIdx ? "bg-primary" : "bg-border"
              }`} />
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              active ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110" :
              done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={`text-xs mt-2 font-medium text-center ${
              done ? "text-foreground" : "text-muted-foreground"
            }`}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
