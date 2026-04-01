import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useJsc, WORKFLOW, type JscShareholder } from "@/context/JscContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2, Loader2, MapPin, Layers, Scale, Gift,
  Search, FileText, ArrowLeft, ArrowRight,
  Building2, Plus, Trash2, ChevronDown, ChevronUp,
  Monitor, Truck, XCircle, FileCheck, Send, Award
} from "lucide-react";
import {
  investmentTypes, eisicActivities, legalForms, incentives,
  checkNameAvailability, calculateContractFees,
  type ActivityLevel, type NameStatus, type Founder
} from "@/data/establishmentData";

type WizardStep =
  | "investment_type" | "activities" | "legal_form" | "incentives" | "summary"
  | "applicant" | "shareholders"
  | "name_check"
  | "submit_review"
  | "done";

const STEPPER_GROUPS = [
  { label: "المسار", steps: ["investment_type", "activities", "legal_form", "incentives", "summary"] },
  { label: "البيانات", steps: ["applicant", "shareholders"] },
  { label: "الاسم", steps: ["name_check"] },
  { label: "التقديم", steps: ["submit_review"] },
];

const ALL_STEPS: WizardStep[] = STEPPER_GROUPS.flatMap(g => g.steps) as WizardStep[];

const EstablishCompany = () => {
  const navigate = useNavigate();
  const { submitEstablishment } = useApp();
  const { submitJscRequest } = useJsc();
  const [step, setStep] = useState<WizardStep>("investment_type");
  const [loading, setLoading] = useState(false);

  // Path selection
  const [selectedInvestment, setSelectedInvestment] = useState("");
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [selectedLegalForm, setSelectedLegalForm] = useState("");
  const [selectedIncentives, setSelectedIncentives] = useState<Set<string>>(new Set());

  // Applicant
  const [applicantName, setApplicantName] = useState("");
  const [applicantNationalId, setApplicantNationalId] = useState("");
  const [outputType, setOutputType] = useState<"digital" | "printed">("digital");

  // Shareholders (for joint_stock)
  const [shareholders, setShareholders] = useState<JscShareholder[]>([
    { id: "s1", name: "", nationalId: "", nationality: "مصري", shareCount: 100, shareValue: 10, role: "chairman", eligible: false },
  ]);

  // Name
  const [companyName, setCompanyName] = useState("");
  const [nameStatus, setNameStatus] = useState<NameStatus | null>(null);
  const [nameMessage, setNameMessage] = useState("");
  const [nameLegalChecked, setNameLegalChecked] = useState(false);

  // Contract data
  const [founders, setFounders] = useState<Founder[]>([
    { id: "f1", name: "", nationalId: "", sharePercentage: 100, role: "founder" },
  ]);
  const [accountant, setAccountant] = useState({ name: "", regNumber: "" });
  const [lawyer, setLawyer] = useState({ name: "", regNumber: "" });
  const [capital, setCapital] = useState<number>(250000);

  const isJointStock = selectedLegalForm === "joint_stock";
  const currentIdx = ALL_STEPS.indexOf(step);
  const goNext = () => {
    const next = currentIdx + 1;
    if (next < ALL_STEPS.length) setStep(ALL_STEPS[next]);
    else setStep("done");
  };
  const goPrev = () => { if (currentIdx > 0) setStep(ALL_STEPS[currentIdx - 1]); };

  // Activity tree helpers
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

  // Shareholders
  const addShareholder = () => setShareholders(prev => [...prev, {
    id: `s${Date.now()}`, name: "", nationalId: "", nationality: "مصري",
    shareCount: 0, shareValue: 10, role: "founder", eligible: false,
  }]);
  const removeShareholder = (id: string) => setShareholders(prev => prev.filter(s => s.id !== id));
  const updateShareholder = (id: string, field: keyof JscShareholder, value: any) => {
    setShareholders(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const checkEligibility = async (id: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    updateShareholder(id, "eligible", true);
    setLoading(false);
  };

  // Non-JSC founders
  const addFounder = () => setFounders(prev => [...prev, { id: `f${Date.now()}`, name: "", nationalId: "", sharePercentage: 0, role: "founder" }]);
  const removeFounder = (id: string) => setFounders(prev => prev.filter(f => f.id !== id));
  const updateFounder = (id: string, field: keyof Founder, value: string | number) => {
    setFounders(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  // Name check
  const handleNameCheck = async () => {
    if (!companyName.trim()) return;
    setLoading(true);
    setNameStatus(null);
    setNameLegalChecked(false);
    const result = await checkNameAvailability(companyName);
    setNameStatus(result.status);
    setNameMessage(result.message);
    if (result.status === "available") {
      await new Promise(r => setTimeout(r, 1500));
      setNameLegalChecked(true);
    }
    setLoading(false);
  };

  // Submit
  const handleSubmit = () => {
    if (isJointStock) {
      submitJscRequest({
        companyName,
        legalForm: selectedLegalForm,
        investmentType: selectedInvestment,
        activities: Array.from(selectedActivities),
        capital,
        outputType,
        applicantName,
        applicantNationalId,
        shareholders,
        accountant,
        lawyer,
      });
    } else {
      submitEstablishment({
        applicantName,
        applicantNationalId,
        companyName,
        legalForm: selectedLegalForm,
        investmentType: selectedInvestment,
        activities: Array.from(selectedActivities),
        capital,
        outputType,
        founders: founders.map(f => ({ name: f.name, nationalId: f.nationalId, sharePercentage: f.sharePercentage, role: f.role })),
      });
    }
    setStep("done");
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

      {/* ═══════════ PATH SELECTION ═══════════ */}

      {step === "investment_type" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="w-5 h-5" /> اختر نوع الاستثمار</CardTitle>
              <CardDescription>حدد المنطقة أو نوع الاستثمار</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {investmentTypes.map(t => (
                <button key={t.id} type="button" onClick={() => setSelectedInvestment(t.id)}
                  className={`p-4 rounded-xl border-2 text-right transition-all ${
                    selectedInvestment === t.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
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

      {step === "activities" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Layers className="w-5 h-5" /> اختر الأنشطة الاقتصادية</CardTitle>
              <CardDescription>تصنيف EISIC — اختر مستوى واحد أو أكثر</CardDescription>
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
                    selectedLegalForm === f.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
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

      {step === "summary" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ملخص المتطلبات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><p className="text-xs text-muted-foreground mb-1">نوع الاستثمار</p><p className="font-semibold text-sm">{chosenInvestment?.label}</p></div>
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
              <div><p className="text-xs text-muted-foreground mb-1">الشكل القانوني</p><p className="font-semibold text-sm">{chosenLegalForm?.label}</p></div>
              {isJointStock && (
                <>
                  <Separator />
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-primary">⚡ شركة مساهمة — سيتم تفعيل نظام الجهات الحكومية المتكامل (11 جهة)</p>
                  </div>
                </>
              )}
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">التكلفة التقديرية</p>
                  <p className="text-lg font-bold text-primary">{fees ? `${fees.total.toLocaleString()} ج.م` : "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">الوقت المتوقع</p>
                  <p className="text-lg font-bold text-primary">{isJointStock ? "15-30 يوم" : "5-10 أيام"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} size="lg" className="flex-1 gap-2">التالي — بيانات مقدم الطلب <ArrowLeft className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {/* ═══════════ APPLICANT DATA ═══════════ */}

      {step === "applicant" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">بيانات مقدم الطلب</CardTitle>
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
                  </button>
                  <button type="button" onClick={() => setOutputType("printed")}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-right transition-all ${outputType === "printed" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}>
                    <Truck className={`w-5 h-5 mt-0.5 shrink-0 ${outputType === "printed" ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">ملف مطبوع مع التوصيل</p>
                      <p className="text-xs text-muted-foreground mt-1">توصيل عبر البريد المصري — رسوم إضافية 50 ج.م</p>
                    </div>
                  </button>
                </div>
              </div>

              {!isJointStock && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>رأس المال (ج.م)</Label>
                    <Input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} min={chosenLegalForm?.minCapital || 0} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} disabled={!applicantName.trim() || applicantNationalId.length < 14} size="lg" className="flex-1 gap-2">
              التالي <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════ SHAREHOLDERS (JSC) / FOUNDERS (other) ═══════════ */}

      {step === "shareholders" && (
        <div className="space-y-4">
          {isJointStock ? (
            // JSC: Full shareholder management with eligibility
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المساهمون — شركة مساهمة</CardTitle>
                <CardDescription>أدخل بيانات جميع المساهمين مع التحقق من الأهلية لكل مساهم</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>رأس المال (ج.م)</Label>
                  <Input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} min={250000} />
                  {capital < 250000 && <p className="text-destructive text-xs">الحد الأدنى لشركة المساهمة: 250,000 ج.م</p>}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">المساهمون ({shareholders.length})</Label>
                  <Button variant="outline" size="sm" onClick={addShareholder} className="gap-1"><Plus className="w-3.5 h-3.5" /> إضافة مساهم</Button>
                </div>
                {shareholders.map((s, idx) => (
                  <div key={s.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">مساهم {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        {s.eligible && <Badge variant="default" className="text-[10px]">✓ مؤهل</Badge>}
                        {shareholders.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeShareholder(s.id)} className="h-7 w-7 p-0 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="الاسم الكامل" value={s.name} onChange={e => updateShareholder(s.id, "name", e.target.value)} />
                      <Input placeholder="الرقم القومي" value={s.nationalId} onChange={e => updateShareholder(s.id, "nationalId", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="الجنسية" value={s.nationality} onChange={e => updateShareholder(s.id, "nationality", e.target.value)} />
                      <Input type="number" placeholder="عدد الأسهم" value={s.shareCount || ""} onChange={e => updateShareholder(s.id, "shareCount", Number(e.target.value))} />
                      <Input type="number" placeholder="قيمة السهم" value={s.shareValue || ""} onChange={e => updateShareholder(s.id, "shareValue", Number(e.target.value))} />
                    </div>
                    <div className="flex gap-2 items-center">
                      <select value={s.role} onChange={e => updateShareholder(s.id, "role", e.target.value)}
                        className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="founder">مؤسس</option>
                        <option value="board_member">عضو مجلس إدارة</option>
                        <option value="chairman">رئيس مجلس إدارة</option>
                      </select>
                      {!s.eligible && (
                        <Button variant="outline" size="sm" onClick={() => checkEligibility(s.id)}
                          disabled={loading || !s.name || !s.nationalId} className="gap-1 shrink-0">
                          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          تحقق من الأهلية
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

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
              </CardContent>
            </Card>
          ) : (
            // Non-JSC: Simple founders
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المؤسسون — {chosenLegalForm?.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">المؤسسون</Label>
                  <Button variant="outline" size="sm" onClick={addFounder} className="gap-1"><Plus className="w-3.5 h-3.5" /> إضافة</Button>
                </div>
                {founders.map((f, idx) => (
                  <div key={f.id} className="p-3 rounded-lg border space-y-2">
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
              </CardContent>
            </Card>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} disabled={
              isJointStock
                ? shareholders.some(s => !s.name || !s.nationalId || !s.eligible) || capital < 250000
                : founders.some(f => !f.name || !f.nationalId)
            } size="lg" className="flex-1 gap-2">
              التالي — الاسم التجاري <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════ NAME CHECK ═══════════ */}

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
                    {nameStatus === "available" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-destructive" />}
                    <p className="font-semibold text-sm">{nameStatus === "available" ? "الاسم متاح" : "الاسم غير متاح"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mr-7">{nameMessage}</p>

                  {nameStatus === "available" && nameLegalChecked && (
                    <div className="mr-7 p-3 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <FileCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">التحقق القانوني التلقائي: متوافق ✓</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} disabled={nameStatus !== "available" || !nameLegalChecked} size="lg" className="flex-1 gap-2">
              التالي — مراجعة وتقديم <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════ SUBMIT REVIEW ═══════════ */}

      {step === "submit_review" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">مراجعة نهائية قبل التقديم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">اسم الشركة:</span> <strong>{companyName}</strong></div>
                <div><span className="text-muted-foreground">الشكل القانوني:</span> <strong>{chosenLegalForm?.label}</strong></div>
                <div><span className="text-muted-foreground">نوع الاستثمار:</span> {chosenInvestment?.label}</div>
                <div><span className="text-muted-foreground">رأس المال:</span> {capital.toLocaleString()} ج.م</div>
                <div><span className="text-muted-foreground">مقدم الطلب:</span> {applicantName}</div>
                <div><span className="text-muted-foreground">الرقم القومي:</span> {applicantNationalId}</div>
                <div><span className="text-muted-foreground">المخرجات:</span> {outputType === "digital" ? "رقمي" : "مطبوع"}</div>
                <div><span className="text-muted-foreground">{isJointStock ? "المساهمون" : "المؤسسون"}:</span> {isJointStock ? shareholders.length : founders.length}</div>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground text-xs mb-1">الأنشطة</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(selectedActivities).map(id => (
                    <Badge key={id} variant="outline" className="text-xs">{getLeafLabel(eisicActivities, id)}</Badge>
                  ))}
                </div>
              </div>
              {isJointStock && (
                <>
                  <Separator />
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-primary">⚡ سيتم إرسال الطلب إلى 11 جهة حكومية عبر نظام Workflow متكامل</p>
                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                      {WORKFLOW.filter(w => w.stage !== "completed").map(w => (
                        <p key={w.stage}>• {w.label} — {w.agency}</p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={handleSubmit} size="lg" className="flex-1 gap-2">
              <Send className="w-4 h-4" /> تقديم الطلب
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════ DONE ═══════════ */}

      {step === "done" && (
        <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="py-10 text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto">
              <Building2 className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">تم تقديم الطلب بنجاح!</h2>
              <p className="text-muted-foreground text-sm">
                {isJointStock
                  ? "تم إرسال الطلب إلى هيئة الاستثمار — يمكنك متابعة التقدم من لوحة العميل ولوحات الجهات"
                  : "تم إرسال الطلب — يمكنك متابعة التقدم من لوحة العميل"
                }
              </p>
            </div>
            <div className="max-w-sm mx-auto space-y-3">
              <div className="flex justify-between text-sm p-3 rounded-lg bg-background border">
                <span className="text-muted-foreground">اسم الشركة</span>
                <span className="font-semibold">{companyName}</span>
              </div>
              <div className="flex justify-between text-sm p-3 rounded-lg bg-background border">
                <span className="text-muted-foreground">الشكل القانوني</span>
                <span className="font-semibold">{chosenLegalForm?.label}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => navigate("/services")} className="gap-2">العودة للكتالوج</Button>
              <Button onClick={() => navigate("/dashboard")} className="gap-2">لوحة العميل <ArrowLeft className="w-4 h-4" /></Button>
              {isJointStock && (
                <Button variant="secondary" onClick={() => navigate("/agency/investment")} className="gap-2">
                  <Award className="w-4 h-4" /> لوحة هيئة الاستثمار
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EstablishCompany;
