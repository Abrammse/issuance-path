import { Check, Fingerprint, ShieldCheck, FolderSearch, FileCheck, Scale, CreditCard, Landmark, Award, X, Search } from "lucide-react";
import type { RequestStatus } from "@/context/AppContext";

const steps = [
  { key: "selected", label: "اختيار الخدمة", icon: Check },
  { key: "identity_check", label: "التحقق من الهوية", icon: Fingerprint },
  { key: "eligibility_check", label: "فحص الأهلية", icon: ShieldCheck },
  { key: "document_retrieval", label: "استرجاع المستندات", icon: FolderSearch },
  { key: "compliance_review", label: "مراجعة الامتثال", icon: FileCheck },
  { key: "pending_decision", label: "القرار", icon: Scale },
  { key: "payment_pending", label: "السداد", icon: CreditCard },
  { key: "payment_check", label: "التحقق من السداد", icon: Search },
  { key: "ratification", label: "التصديق", icon: Landmark },
  { key: "published", label: "النشر والإصدار", icon: Award },
] as const;

const statusOrder: Record<string, number> = {
  selected: 0,
  identity_check: 1,
  eligibility_check: 2,
  document_retrieval: 3,
  compliance_review: 4,
  pending_decision: 5,
  approved: 6,
  payment_pending: 6,
  payment_check: 7,
  ratification: 8,
  published: 9,
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
    <div className="py-6">
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-start justify-between w-full">
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
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] mt-2 font-medium text-center leading-tight max-w-[70px] ${
                done ? "text-foreground" : "text-muted-foreground"
              }`}>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden space-y-1">
        {steps.map((step, idx) => {
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  active ? "bg-primary text-primary-foreground ring-2 ring-primary/20" :
                  done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-0.5 h-4 ${idx < currentIdx ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
              <span className={`text-xs font-medium ${
                done ? "text-foreground" : "text-muted-foreground"
              }`}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
