import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2, Loader2, MapPin, Layers, Scale, Gift,
  Search, FileText, PenTool, CreditCard, ArrowLeft, ArrowRight,
  ChevronLeft, Building2, Plus, Trash2, Eye, ChevronDown, ChevronUp,
  User, ShieldCheck, ClipboardCheck, Clock, XCircle, AlertTriangle,
  FileCheck, Send, Truck, Monitor, Award
} from "lucide-react";
import {
  investmentTypes, eisicActivities, legalForms, incentives,
  checkNameAvailability, calculateContractFees,
  type ActivityLevel, type NameStatus, type Founder, type LegalForm
} from "@/data/establishmentData";

type WizardStep =
  | "investment_type" | "activities" | "legal_form" | "incentives" | "summary"
  | "identity" | "identity_verify" | "eligibility"
  | "name_check" | "name_approval" | "name_payment"
  | "contract" | "contract_review" | "contract_sign" | "contract_verify"
  | "done";

type OutputType = "digital" | "printed";

const STEPPER_GROUPS = [
  { label: "المسار", steps: ["investment_type", "activities", "legal_form", "incentives", "summary"] },
  { label: "الهوية", steps: ["identity", "identity_verify", "eligibility"] },
  { label: "الاسم", steps: ["name_check", "name_approval", "name_payment"] },
  { label: "العقد", steps: ["contract", "contract_review", "contract_sign", "contract_verify"] },
];

const ALL_STEPS: WizardStep[] = STEPPER_GROUPS.flatMap(g => g.steps) as WizardStep[];

const EstablishCompany = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>("investment_type");
  const [loading, setLoading] = useState(false);

  // Path selection
  const [selectedInvestment, setSelectedInvestment] = useState("");
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [selectedLegalForm, setSelectedLegalForm] = useState("");
  const [selectedIncentives, setSelectedIncentives] = useState<Set<string>>(new Set());

  // Identity
  const [applicantName, setApplicantName] = useState("");
  const [applicantNationalId, setApplicantNationalId] = useState("");
  const [outputType, setOutputType] = useState<OutputType>("digital");
  const [identityVerified, setIdentityVerified] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  // Name check
  const [companyName, setCompanyName] = useState("");
  const [nameStatus, setNameStatus] = useState<NameStatus | null>(null);
  const [nameMessage, setNameMessage] = useState("");
  const [nameLegalChecked, setNameLegalChecked] = useState(false);
  const [nameEmployeeDecision, setNameEmployeeDecision] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [nameReservationPaid, setNameReservationPaid] = useState(false);

  // Contract
  const [founders, setFounders] = useState<Founder[]>([
    { id: "f1", name: "", nationalId: "", sharePercentage: 100, role: "founder" },
  ]);
  const [accountant, setAccountant] = useState({ name: "", regNumber: "" });
  const [lawyer, setLawyer] = useState({ name: "", regNumber: "" });
  const [capital, setCapital] = useState<number>(50000);
  const [contractPreview, setContractPreview] = useState(false);
  const [contractEmployeeDecision, setContractEmployeeDecision] = useState<"pending" | "approved" | "rejected" | "docs_requested" | null>(null);
  const [requestedDocs, setRequestedDocs] = useState<string[]>([]);
  const [signed, setSigned] = useState(false);
  const [contractVerified, setContractVerified] = useState(false);

  const currentIdx = ALL_STEPS.indexOf(step);
  const goTo = (s: WizardStep) => setStep(s);
  const goNext = () => {
    const next = currentIdx + 1;
    if (next < ALL_STEPS.length) setStep(ALL_STEPS[next]);
    else setStep("done");
  };
  const goPrev = () => {
    if (currentIdx > 0) setStep(ALL_STEPS[currentIdx - 1]);
  };

  // Activity tree
  const toggleExpand = (id: string) => {
    setExpandedActivities(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleActivity = (id: string) => {
    setSelectedActivities(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const getLeafLabel = (nodes: ActivityLevel[], id: string): string => {
    for (const n of nodes) {
      if (n.id === id) return n.label;
      if (n.children) { const f = getLeafLabel(n.children, id); if (f) return f; }
    }
    return "";
  };

  const availableIncentives = incentives.filter(i => i.zones.includes(selectedInvestment));
  const chosenLegalForm = legalForms.find(f => f.id === selectedLegalForm);
  const chosenInvestment = investmentTypes.find(i => i.id === selectedInvestment);
  const fees = chosenLegalForm ? calculateContractFees(capital, chosenLegalForm.id) : null;

  // Simulate identity verification
  const handleIdentityVerify = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2500));
    setIdentityVerified(true);
    setLoading(false);
  };

  // Simulate eligibility
  const handleEligibilityCheck = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setEligibilityChecked(true);
    setLoading(false);
  };

  // Name check (auto legal)
  const handleNameCheck = async () => {
    if (!companyName.trim()) return;
    setLoading(true);
    setNameStatus(null);
    setNameLegalChecked(false);
    const result = await checkNameAvailability(companyName);
    setNameStatus(result.status);
    setNameMessage(result.message);
    if (result.status === "available") {
      // Auto legal compliance check
      await new Promise(r => setTimeout(r, 1500));
      setNameLegalChecked(true);
    }
    setLoading(false);
  };

  // Employee approval simulation
  const handleEmployeeNameDecision = async (decision: "approved" | "rejected") => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setNameEmployeeDecision(decision);
    setLoading(false);
  };

  // Pay name reservation
  const handlePayNameReservation = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setNameReservationPaid(true);
    setLoading(false);
  };

  // Contract employee review
  const handleContractEmployeeDecision = async (decision: "approved" | "rejected" | "docs_requested") => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setContractEmployeeDecision(decision);
    if (decision === "docs_requested") {
      setRequestedDocs(["صورة البطاقة الضريبية", "إثبات العنوان"]);
    }
    setLoading(false);
  };

  // Sign contract
  const handleSign = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2500));
    setSigned(true);
    setLoading(false);
  };

  // Verify contract
  const handleVerifyContract = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 3000));
    setContractVerified(true);
    setLoading(false);
  };

  // Founders
  const addFounder = () => setFounders(prev => [...prev, { id: `f${Date.now()}`, name: "", nationalId: "", sharePercentage: 0, role: "founder" }]);
  const removeFounder = (id: string) => setFounders(prev => prev.filter(f => f.id !== id));
  const updateFounder = (id: string, field: keyof Founder, value: string | number) => {
    setFounders(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  // Render activity tree
  const renderTree = (nodes: ActivityLevel[], depth = 0) => (
    <div className={depth > 0 ? "mr-4 border-r border-border pr-3" : ""}>
      {nodes.map(node => {
        const isLeaf = !node.children || node.children.length === 0;
        const isExpanded = expandedActivities.has(node.id);
        const isSelected = selectedActivities.has(node.id);
        return (
          <div key={node.id} className="my-1">
            <button type="button" onClick={() => isLeaf ? toggleActivity(node.id) : toggleExpand(node.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-right transition-colors ${
                isLeaf && isSelected ? "bg-primary/10 text-primary border border-primary/30" : "hover:bg-secondary border border-transparent"
              }`}>
              {!isLeaf && (isExpanded ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />)}
              {isLeaf && (
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                </div>
              )}
              <span className="text-muted-foreground text-xs ml-1">{node.id}</span>
              <span className="flex-1">{node.label}</span>
            </button>
            {!isLeaf && isExpanded && node.children && renderTree(node.children, depth + 1)}
          </div>
        );
      })}
    </div>
  );

  // Get group progress for stepper
  const getGroupStatus = (groupSteps: string[]) => {
    const firstIdx = ALL_STEPS.indexOf(groupSteps[0] as WizardStep);
    const lastIdx = ALL_STEPS.indexOf(groupSteps[groupSteps.length - 1] as WizardStep);
    if (currentIdx > lastIdx) return "done";
    if (currentIdx >= firstIdx && currentIdx <= lastIdx) return "active";
    return "pending";
  };

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">تأسيس شركة جديدة</h1>
      <p className="text-muted-foreground text-sm mb-8">خدمة تأسيس الكيانات الاقتصادية — رقم الخدمة: EST-001</p>

      {/* Stepper */}
      {step !== "done" && (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPPER_GROUPS.map((g, gIdx) => {
            const status = getGroupStatus(g.steps);
            return (
              <div key={g.label} className="flex items-center gap-2 shrink-0">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  status === "active" ? "bg-primary text-primary-foreground" :
                  status === "done" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {status === "done" && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {g.label}
                </div>
                {gIdx < STEPPER_GROUPS.length - 1 && <div className={`w-6 h-0.5 ${status === "done" ? "bg-primary" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════ PATH SELECTION STEPS ═══════════════ */}

      {/* Step: Investment Type */}
      {step === "investment_type" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="w-5 h-5" /> اختر نوع الاستثمار</CardTitle>
              <CardDescription>حدد المنطقة أو نوع الاستثمار لتحديد الإجراءات والحوافز المتاحة</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {investmentTypes.map(t => (
                <button key={t.id} type="button" onClick={() => setSelectedInvestment(t.id)}
                  className={`p-4 rounded-xl border-2 text-right transition-all ${
                    selectedInvestment === t.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30"
                  }`}>
                  <p className="font-semibold text-sm">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>
          <Button onClick={goNext} disabled={!selectedInvestment} size="lg" className="w-full gap-2">
            التالي <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Step: Activities */}
      {step === "activities" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Layers className="w-5 h-5" /> اختر الأنشطة الاقتصادية</CardTitle>
              <CardDescription>تصنيف EISIC — اختر مستوى واحد أو أكثر (المستوى الرابع)</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedActivities.size > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.from(selectedActivities).map(id => (
                    <Badge key={id} variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => toggleActivity(id)}>
                      {getLeafLabel(eisicActivities, id)} ✕
                    </Badge>
                  ))}
                </div>
              )}
              <div className="max-h-80 overflow-y-auto">{renderTree(eisicActivities)}</div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} disabled={selectedActivities.size === 0} size="lg" className="flex-1 gap-2">
              التالي ({selectedActivities.size} نشاط) <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Legal Form */}
      {step === "legal_form" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Scale className="w-5 h-5" /> اختر الشكل القانوني</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {legalForms.map(f => (
                <button key={f.id} type="button" onClick={() => setSelectedLegalForm(f.id)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-right transition-all ${
                    selectedLegalForm === f.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30"
                  }`}>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>الحد الأدنى: {f.minCapital > 0 ? `${f.minCapital.toLocaleString()} ج.م` : "غير محدد"}</span>
                      <span>المؤسسون: {f.minFounders}+</span>
                    </div>
                  </div>
                  <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedLegalForm === f.id ? "border-primary" : "border-muted-foreground/40"}`}>
                    {selectedLegalForm === f.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} disabled={!selectedLegalForm} size="lg" className="flex-1 gap-2">التالي <ArrowLeft className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {/* Step: Incentives */}
      {step === "incentives" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Gift className="w-5 h-5" /> الحوافز والمزايا المتاحة</CardTitle>
              <CardDescription>بناءً على منطقة «{chosenInvestment?.label}»</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableIncentives.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">لا توجد حوافز خاصة لهذا النوع</p>
              ) : availableIncentives.map(inc => {
                const sel = selectedIncentives.has(inc.id);
                return (
                  <button key={inc.id} type="button" onClick={() => {
                    setSelectedIncentives(prev => { const n = new Set(prev); n.has(inc.id) ? n.delete(inc.id) : n.add(inc.id); return n; });
                  }} className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-right transition-all ${sel ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}>
                    <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 ${sel ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                      {sel && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{inc.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{inc.description}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">{inc.discount}</Badge>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} size="lg" className="flex-1 gap-2">التالي <ArrowLeft className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {/* Step: Summary */}
      {step === "summary" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ملخص المتطلبات</CardTitle>
              <CardDescription>مراجعة اختياراتك قبل التحقق من الهوية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">نوع الاستثمار</p>
                <p className="font-semibold text-sm">{chosenInvestment?.label}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">الأنشطة ({selectedActivities.size})</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(selectedActivities).map(id => (
                    <Badge key={id} variant="outline" className="text-xs">{getLeafLabel(eisicActivities, id)}</Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">الشكل القانوني</p>
                <p className="font-semibold text-sm">{chosenLegalForm?.label}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">التكلفة التقديرية</p>
                  <p className="text-lg font-bold text-primary">{fees ? `${fees.total.toLocaleString()} ج.م` : "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">الوقت المتوقع</p>
                  <p className="text-lg font-bold text-primary">5-10 أيام</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} size="lg" className="flex-1 gap-2">التالي — التحقق من الهوية <ArrowLeft className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {/* ═══════════════ IDENTITY & ELIGIBILITY ═══════════════ */}

      {/* Step: Identity Input */}
      {step === "identity" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5" /> بيانات مقدم الطلب</CardTitle>
              <CardDescription>أدخل بياناتك للتحقق من الهوية الرقمية عبر منصة مصر الرقمية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم الكامل</Label>
                <Input value={applicantName} onChange={e => setApplicantName(e.target.value)} placeholder="أدخل الاسم رباعي" />
              </div>
              <div className="space-y-2">
                <Label>الرقم القومي</Label>
                <Input value={applicantNationalId} onChange={e => setApplicantNationalId(e.target.value)} placeholder="14 رقم" maxLength={14} />
              </div>
              <Separator />
              <div className="space-y-3">
                <Label className="text-base font-semibold">نوع المخرجات</Label>
                <div className="grid gap-3">
                  <button type="button" onClick={() => setOutputType("digital")}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-right transition-all ${outputType === "digital" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}>
                    <Monitor className={`w-5 h-5 mt-0.5 shrink-0 ${outputType === "digital" ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">ملف رقمي</p>
                      <p className="text-xs text-muted-foreground mt-1">استلام المخرجات إلكترونياً عبر المنصة</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${outputType === "digital" ? "border-primary" : "border-muted-foreground/40"}`}>
                      {outputType === "digital" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </button>
                  <button type="button" onClick={() => setOutputType("printed")}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-right transition-all ${outputType === "printed" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}>
                    <Truck className={`w-5 h-5 mt-0.5 shrink-0 ${outputType === "printed" ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">ملف مطبوع مع التوصيل</p>
                      <p className="text-xs text-muted-foreground mt-1">توصيل عبر البريد المصري — رسوم إضافية 50 ج.م</p>
                      <Badge variant="outline" className="mt-2 text-[10px]">تكامل البريد المصري</Badge>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${outputType === "printed" ? "border-primary" : "border-muted-foreground/40"}`}>
                      {outputType === "printed" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} disabled={!applicantName.trim() || applicantNationalId.length < 14} size="lg" className="flex-1 gap-2">
              التالي — التحقق من الهوية <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Identity Verification */}
      {step === "identity_verify" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="w-5 h-5" /> التحقق من الهوية الرقمية</CardTitle>
              <CardDescription>جاري التحقق عبر منصة مصر الرقمية</CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              {!identityVerified ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{applicantName}</p>
                    <p className="text-sm text-muted-foreground">الرقم القومي: {applicantNationalId}</p>
                  </div>
                  <Button onClick={handleIdentityVerify} disabled={loading} size="lg" className="gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحقق...</> : <><ShieldCheck className="w-4 h-4" /> بدء التحقق</>}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-bold text-emerald-600">تم التحقق من الهوية بنجاح</p>
                  <p className="text-xs text-muted-foreground">تم مطابقة البيانات مع قاعدة بيانات الأحوال المدنية</p>
                  <Button onClick={goNext} size="lg" className="gap-2">التالي — فحص الأهلية <ArrowLeft className="w-4 h-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Eligibility */}
      {step === "eligibility" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><ClipboardCheck className="w-5 h-5" /> التحقق من الأهلية</CardTitle>
              <CardDescription>فحص أهلية مقدم الطلب للحصول على خدمة التأسيس</CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              {!eligibilityChecked ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
                    <ClipboardCheck className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>✓ لا يوجد حظر قانوني على مقدم الطلب</p>
                    <p>✓ التحقق من السجل التجاري السابق</p>
                    <p>✓ مطابقة نوع الاستثمار مع الشروط</p>
                  </div>
                  <Button onClick={handleEligibilityCheck} disabled={loading} size="lg" className="gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الفحص...</> : <><ClipboardCheck className="w-4 h-4" /> بدء فحص الأهلية</>}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-bold text-emerald-600">مؤهل للحصول على الخدمة</p>
                  <p className="text-xs text-muted-foreground">تم التحقق من جميع شروط الأهلية بنجاح</p>
                  <Button onClick={goNext} size="lg" className="gap-2">التالي — حجز الاسم التجاري <ArrowLeft className="w-4 h-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════ NAME CHECK ═══════════════ */}

      {/* Step: Name Check (auto legal compliance) */}
      {step === "name_check" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Search className="w-5 h-5" /> التحقق من الاسم التجاري</CardTitle>
              <CardDescription>أدخل الاسم المقترح — سيتم التحقق التلقائي من التوافق القانوني</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input value={companyName} onChange={e => { setCompanyName(e.target.value); setNameStatus(null); setNameLegalChecked(false); }}
                  placeholder="مثال: شركة الابتكار للتكنولوجيا" className="flex-1" />
                <Button onClick={handleNameCheck} disabled={loading || !companyName.trim()} className="gap-2 shrink-0">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  تحقق
                </Button>
              </div>

              {nameStatus && (
                <div className={`p-4 rounded-xl border-2 space-y-3 ${
                  nameStatus === "available" ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20" : "border-destructive/50 bg-destructive/5"
                }`}>
                  <div className="flex items-center gap-2">
                    {nameStatus === "available" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> :
                      <XCircle className="w-5 h-5 text-destructive" />}
                    <p className="font-semibold text-sm">{nameStatus === "available" ? "الاسم متاح" : "الاسم غير متاح"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mr-7">{nameMessage}</p>

                  {nameStatus === "available" && nameLegalChecked && (
                    <div className="mr-7 p-3 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <FileCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">التحقق القانوني التلقائي: متوافق ✓</span>
                      </div>
                      <p className="text-xs text-muted-foreground">لا يتعارض مع أسماء محظورة أو علامات تجارية مسجلة</p>
                    </div>
                  )}

                  {nameStatus === "available" && nameLegalChecked && (
                    <Button onClick={goNext} size="sm" className="mr-7 gap-2">
                      إرسال للموظف للموافقة <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Name Approval (employee simulation) */}
      {step === "name_approval" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><ClipboardCheck className="w-5 h-5" /> مراجعة الموظف — الاسم التجاري</CardTitle>
              <CardDescription>الاسم المقترح: <strong>{companyName}</strong></CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              {!nameEmployeeDecision ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="font-semibold">في انتظار قرار الموظف</p>
                  <p className="text-xs text-muted-foreground">محاكاة: اضغط أحد الأزرار التالية</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => handleEmployeeNameDecision("approved")} disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} موافقة
                    </Button>
                    <Button onClick={() => handleEmployeeNameDecision("rejected")} disabled={loading} variant="destructive" className="gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} رفض
                    </Button>
                  </div>
                </div>
              ) : nameEmployeeDecision === "approved" ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-bold text-emerald-600">تمت الموافقة على الاسم</p>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">محجوز مؤقتاً لمدة 48 ساعة</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">يجب سداد رسوم الحجز خلال 48 ساعة لتأكيد الحجز لمدة 15 يوم</p>
                  </div>
                  <Button onClick={goNext} size="lg" className="gap-2">
                    سداد رسوم الحجز <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                    <XCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="font-bold text-destructive">تم رفض الاسم التجاري</p>
                  <p className="text-xs text-muted-foreground">يمكنك العودة واختيار اسم آخر</p>
                  <Button variant="outline" onClick={() => { setNameEmployeeDecision(null); setNameStatus(null); setNameLegalChecked(false); goTo("name_check"); }} className="gap-2">
                    <ArrowRight className="w-4 h-4" /> اختيار اسم آخر
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Name Payment */}
      {step === "name_payment" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="w-5 h-5" /> سداد رسوم حجز الاسم</CardTitle>
              <CardDescription>سداد 100 ج.م لتأكيد حجز الاسم التجاري لمدة 15 يوم</CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              {!nameReservationPaid ? (
                <div className="text-center space-y-4">
                  <div className="p-4 rounded-xl bg-secondary max-w-xs mx-auto">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الاسم</span>
                      <span className="font-semibold">{companyName}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>رسوم الحجز</span>
                      <span className="text-primary">100 ج.م</span>
                    </div>
                  </div>
                  <Button onClick={handlePayNameReservation} disabled={loading} size="lg" className="gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري السداد...</> : <><CreditCard className="w-4 h-4" /> سداد الآن</>}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-bold text-emerald-600">تم السداد وتأكيد الحجز</p>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 max-w-xs mx-auto">
                    <p className="text-sm font-medium">الاسم محجوز لمدة <strong className="text-primary">15 يوم</strong></p>
                    <p className="text-xs text-muted-foreground mt-1">يجب إتمام إجراءات التأسيس قبل انتهاء مدة الحجز</p>
                  </div>
                  <Button onClick={goNext} size="lg" className="gap-2">التالي — إعداد العقد <ArrowLeft className="w-4 h-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════ CONTRACT ═══════════════ */}

      {/* Step: Contract Data Entry */}
      {step === "contract" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><FileText className="w-5 h-5" /> إعداد عقد التأسيس</CardTitle>
              <CardDescription>أدخل بيانات المؤسسين والمستشارين — {chosenLegalForm?.label}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>رأس المال (ج.م)</Label>
                <Input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} min={chosenLegalForm?.minCapital || 0} className="mt-1" />
                {chosenLegalForm && chosenLegalForm.minCapital > 0 && capital < chosenLegalForm.minCapital && (
                  <p className="text-destructive text-xs mt-1">الحد الأدنى: {chosenLegalForm.minCapital.toLocaleString()} ج.م</p>
                )}
              </div>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">المؤسسون</Label>
                  <Button variant="outline" size="sm" onClick={addFounder} className="gap-1"><Plus className="w-3.5 h-3.5" /> إضافة</Button>
                </div>
                <div className="space-y-3">
                  {founders.map((f, idx) => (
                    <div key={f.id} className="p-3 rounded-lg border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">مؤسس {idx + 1}</span>
                        {founders.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeFounder(f.id)} className="h-7 w-7 p-0 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="الاسم الكامل" value={f.name} onChange={e => updateFounder(f.id, "name", e.target.value)} />
                        <Input placeholder="الرقم القومي" value={f.nationalId} onChange={e => updateFounder(f.id, "nationalId", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" placeholder="نسبة الحصة %" value={f.sharePercentage || ""} onChange={e => updateFounder(f.id, "sharePercentage", Number(e.target.value))} />
                        <select value={f.role} onChange={e => updateFounder(f.id, "role", e.target.value as Founder["role"])}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="founder">مؤسس</option>
                          <option value="manager">مدير</option>
                          <option value="board_member">عضو مجلس إدارة</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">المحاسب القانوني</Label>
                  <Input placeholder="اسم المحاسب" value={accountant.name} onChange={e => setAccountant(p => ({ ...p, name: e.target.value }))} />
                  <Input placeholder="رقم القيد" value={accountant.regNumber} onChange={e => setAccountant(p => ({ ...p, regNumber: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">المستشار القانوني</Label>
                  <Input placeholder="اسم المحامي" value={lawyer.name} onChange={e => setLawyer(p => ({ ...p, name: e.target.value }))} />
                  <Input placeholder="رقم القيد" value={lawyer.regNumber} onChange={e => setLawyer(p => ({ ...p, regNumber: e.target.value }))} />
                </div>
              </div>
              <Separator />
              {fees && (
                <div className="p-4 rounded-xl bg-secondary space-y-2">
                  <p className="font-semibold text-sm">رسوم العقد</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-muted-foreground">رسوم أساسية</span><span>{fees.baseFee.toLocaleString()} ج.م</span>
                    <span className="text-muted-foreground">رسم دمغة</span><span>{fees.stampFee.toLocaleString()} ج.م</span>
                    <span className="text-muted-foreground">رسم تسجيل</span><span>{fees.registrationFee.toLocaleString()} ج.م</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-sm">
                    <span>الإجمالي</span><span className="text-primary">{fees.total.toLocaleString()} ج.م</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Preview */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => setContractPreview(!contractPreview)}>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="w-4 h-4" /> معاينة نموذج العقد
                {contractPreview ? <ChevronUp className="w-4 h-4 mr-auto" /> : <ChevronDown className="w-4 h-4 mr-auto" />}
              </CardTitle>
            </CardHeader>
            {contractPreview && (
              <CardContent className="text-sm leading-7 text-muted-foreground border-t pt-4 space-y-3">
                <p className="font-bold text-foreground text-center">عقد تأسيس {chosenLegalForm?.label}</p>
                <p>إنه في يوم {new Date().toLocaleDateString("ar-EG")} تم الاتفاق بين كل من:</p>
                {founders.map((f, i) => (
                  <p key={f.id}>الطرف {i === 0 ? "الأول" : i === 1 ? "الثاني" : `${i + 1}`}: السيد/ {f.name || "___"} — رقم قومي: {f.nationalId || "___"} — حصة: {f.sharePercentage}%</p>
                ))}
                <p>على تأسيس شركة باسم: <strong className="text-foreground">{companyName}</strong></p>
                <p>برأس مال قدره: <strong className="text-foreground">{capital.toLocaleString()} جنيه مصري</strong></p>
                <p>الأنشطة: {Array.from(selectedActivities).map(id => getLeafLabel(eisicActivities, id)).join("، ")}</p>
              </CardContent>
            )}
          </Card>

          <Button onClick={goNext} disabled={founders.some(f => !f.name || !f.nationalId)} size="lg" className="w-full gap-2">
            <Send className="w-4 h-4" /> إرسال العقد للمراجعة
          </Button>
        </div>
      )}

      {/* Step: Contract Review (employee) */}
      {step === "contract_review" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><ClipboardCheck className="w-5 h-5" /> مراجعة الموظف — العقد</CardTitle>
              <CardDescription>مراجعة نموذج العقد والمستندات من قبل الجهة المختصة</CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              {!contractEmployeeDecision ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="font-semibold">في انتظار مراجعة الموظف</p>
                  <p className="text-xs text-muted-foreground">محاكاة: اختر قرار الموظف</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button onClick={() => handleContractEmployeeDecision("approved")} disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} موافقة
                    </Button>
                    <Button onClick={() => handleContractEmployeeDecision("docs_requested")} disabled={loading} variant="outline" className="gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />} طلب مستندات
                    </Button>
                    <Button onClick={() => handleContractEmployeeDecision("rejected")} disabled={loading} variant="destructive" className="gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} رفض
                    </Button>
                  </div>
                </div>
              ) : contractEmployeeDecision === "approved" ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-bold text-emerald-600">تمت الموافقة على العقد</p>
                  <p className="text-xs text-muted-foreground">يمكنك الآن التوقيع الإلكتروني</p>
                  <Button onClick={goNext} size="lg" className="gap-2">
                    <PenTool className="w-4 h-4" /> الانتقال للتوقيع
                  </Button>
                </div>
              ) : contractEmployeeDecision === "docs_requested" ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="font-bold text-amber-600">مطلوب مستندات إضافية</p>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 max-w-xs mx-auto text-right">
                    {requestedDocs.map((doc, i) => (
                      <p key={i} className="text-sm">• {doc}</p>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => { setContractEmployeeDecision(null); goTo("contract"); }} className="gap-2">
                    <ArrowRight className="w-4 h-4" /> العودة لتعديل العقد
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                    <XCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="font-bold text-destructive">تم رفض العقد</p>
                  <p className="text-xs text-muted-foreground">يمكنك تعديل البيانات وإعادة الإرسال</p>
                  <Button variant="outline" onClick={() => { setContractEmployeeDecision(null); goTo("contract"); }} className="gap-2">
                    <ArrowRight className="w-4 h-4" /> تعديل العقد
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Contract Signing */}
      {step === "contract_sign" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><PenTool className="w-5 h-5" /> التوقيع الإلكتروني</CardTitle>
              <CardDescription>توقيع العقد إلكترونياً من جميع المؤسسين</CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              {!signed ? (
                <div className="text-center space-y-4">
                  <div className="space-y-2 max-w-xs mx-auto text-right">
                    {founders.map((f, i) => (
                      <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary text-sm">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">{i + 1}</div>
                        <span className="flex-1">{f.name || "مؤسس"}</span>
                        <Badge variant="outline" className="text-[10px]">في الانتظار</Badge>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSign} disabled={loading} size="lg" className="gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التوقيع الإلكتروني...</> : <><PenTool className="w-4 h-4" /> توقيع العقد</>}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-bold text-emerald-600">تم توقيع العقد من جميع الأطراف</p>
                  <Button onClick={goNext} size="lg" className="gap-2">التالي — التحقق والإصدار <ArrowLeft className="w-4 h-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Contract Verification & Issuance */}
      {step === "contract_verify" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="w-5 h-5" /> التحقق وإصدار عقد التأسيس</CardTitle>
              <CardDescription>التحقق النهائي من العقد وإصدار شهادة التأسيس</CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              {!contractVerified ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>✓ مطابقة التوقيعات الإلكترونية</p>
                    <p>✓ التحقق من صحة البيانات</p>
                    <p>✓ تسجيل العقد في مصلحة الشركات</p>
                    <p>✓ إصدار رقم السجل التجاري</p>
                  </div>
                  <Button onClick={handleVerifyContract} disabled={loading} size="lg" className="gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحقق والإصدار...</> : <><ShieldCheck className="w-4 h-4" /> بدء التحقق</>}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-bold text-emerald-600">تم التحقق والتسجيل بنجاح</p>
                  {fees && (
                    <div className="p-4 rounded-xl bg-secondary max-w-xs mx-auto space-y-2">
                      <p className="text-sm font-semibold">رسوم الإصدار المستحقة</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <span className="text-muted-foreground">رسوم العقد</span><span>{fees.total.toLocaleString()} ج.م</span>
                        <span className="text-muted-foreground">رسوم حجز الاسم</span><span>100 ج.م</span>
                        {outputType === "printed" && <><span className="text-muted-foreground">رسوم التوصيل</span><span>50 ج.م</span></>}
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-sm">
                        <span>الإجمالي</span>
                        <span className="text-primary">{(fees.total + 100 + (outputType === "printed" ? 50 : 0)).toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  )}
                  <Button onClick={() => setStep("done")} size="lg" className="gap-2">
                    <Award className="w-4 h-4" /> عرض شهادة التأسيس
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════ DONE ═══════════════ */}
      {step === "done" && (
        <div className="space-y-6">
          <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="py-10 text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto">
                <Building2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">تم تأسيس الشركة بنجاح!</h2>
                <p className="text-muted-foreground text-sm">تم إصدار شهادة التأسيس والعقد الموثق</p>
              </div>
              <div className="max-w-sm mx-auto space-y-3">
                <div className="flex justify-between text-sm p-3 rounded-lg bg-background border">
                  <span className="text-muted-foreground">اسم الشركة</span>
                  <span className="font-semibold">{companyName}</span>
                </div>
                <div className="flex justify-between text-sm p-3 rounded-lg bg-background border">
                  <span className="text-muted-foreground">رقم التسجيل</span>
                  <span className="font-semibold font-mono">CR-{Date.now().toString(36).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm p-3 rounded-lg bg-background border">
                  <span className="text-muted-foreground">الشكل القانوني</span>
                  <span className="font-semibold">{chosenLegalForm?.label}</span>
                </div>
                <div className="flex justify-between text-sm p-3 rounded-lg bg-background border">
                  <span className="text-muted-foreground">رأس المال</span>
                  <span className="font-semibold">{capital.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm p-3 rounded-lg bg-background border">
                  <span className="text-muted-foreground">مقدم الطلب</span>
                  <span className="font-semibold">{applicantName}</span>
                </div>
                <div className="flex justify-between text-sm p-3 rounded-lg bg-background border">
                  <span className="text-muted-foreground">نوع المخرجات</span>
                  <span className="font-semibold">{outputType === "digital" ? "ملف رقمي" : "مطبوع مع التوصيل"}</span>
                </div>
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => navigate("/services")} className="gap-2">العودة للكتالوج</Button>
                <Button onClick={() => navigate("/dashboard")} className="gap-2">لوحة العميل <ArrowLeft className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EstablishCompany;
