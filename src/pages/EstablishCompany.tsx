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
  ChevronLeft, Building2, Plus, Trash2, Eye, ChevronDown, ChevronUp
} from "lucide-react";
import {
  investmentTypes, eisicActivities, legalForms, incentives,
  checkNameAvailability, calculateContractFees,
  type ActivityLevel, type NameStatus, type Founder, type LegalForm, type InvestmentType, type Incentive
} from "@/data/establishmentData";

type WizardStep = "investment_type" | "activities" | "legal_form" | "incentives" | "summary" | "name_check" | "contract" | "payment" | "done";

const STEPS: { key: WizardStep; label: string }[] = [
  { key: "investment_type", label: "نوع الاستثمار" },
  { key: "activities", label: "الأنشطة" },
  { key: "legal_form", label: "الشكل القانوني" },
  { key: "incentives", label: "الحوافز" },
  { key: "summary", label: "الملخص" },
  { key: "name_check", label: "الاسم التجاري" },
  { key: "contract", label: "العقد" },
  { key: "payment", label: "الدفع" },
];

const EstablishCompany = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>("investment_type");
  const [loading, setLoading] = useState(false);

  // Step 1
  const [selectedInvestment, setSelectedInvestment] = useState<string>("");
  // Step 2
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  // Step 3
  const [selectedLegalForm, setSelectedLegalForm] = useState<string>("");
  // Step 4
  const [selectedIncentives, setSelectedIncentives] = useState<Set<string>>(new Set());
  // Step 6 - Name check
  const [companyName, setCompanyName] = useState("");
  const [nameStatus, setNameStatus] = useState<NameStatus | null>(null);
  const [nameMessage, setNameMessage] = useState("");
  const [nameReserved, setNameReserved] = useState(false);
  // Step 7 - Contract
  const [founders, setFounders] = useState<Founder[]>([
    { id: "f1", name: "", nationalId: "", sharePercentage: 100, role: "founder" },
  ]);
  const [accountant, setAccountant] = useState({ name: "", regNumber: "" });
  const [lawyer, setLawyer] = useState({ name: "", regNumber: "" });
  const [capital, setCapital] = useState<number>(50000);
  const [signed, setSigned] = useState(false);
  const [contractPreview, setContractPreview] = useState(false);
  // Step 8 - Payment
  const [paid, setPaid] = useState(false);

  const stepIdx = STEPS.findIndex(s => s.key === step);

  const goNext = () => {
    const nextIdx = stepIdx + 1;
    if (nextIdx < STEPS.length) setStep(STEPS[nextIdx].key);
    else setStep("done");
  };
  const goPrev = () => {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1].key);
  };

  // Activity tree toggle
  const toggleExpand = (id: string) => {
    setExpandedActivities(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleActivity = (id: string) => {
    setSelectedActivities(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Get leaf activities labels
  const getLeafLabel = (nodes: ActivityLevel[], id: string): string => {
    for (const n of nodes) {
      if (n.id === id) return n.label;
      if (n.children) {
        const found = getLeafLabel(n.children, id);
        if (found) return found;
      }
    }
    return "";
  };

  const availableIncentives = incentives.filter(i => i.zones.includes(selectedInvestment));
  const chosenLegalForm = legalForms.find(f => f.id === selectedLegalForm);
  const chosenInvestment = investmentTypes.find(i => i.id === selectedInvestment);
  const fees = chosenLegalForm ? calculateContractFees(capital, chosenLegalForm.id) : null;

  // Name check
  const handleNameCheck = async () => {
    if (!companyName.trim()) return;
    setLoading(true);
    setNameStatus(null);
    const result = await checkNameAvailability(companyName);
    setNameStatus(result.status);
    setNameMessage(result.message);
    setLoading(false);
  };

  const handleReserveName = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setNameReserved(true);
    setLoading(false);
  };

  // Sign contract
  const handleSign = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setSigned(true);
    setLoading(false);
  };

  // Pay
  const handlePay = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setPaid(true);
    setLoading(false);
  };

  // Founder management
  const addFounder = () => {
    setFounders(prev => [...prev, { id: `f${Date.now()}`, name: "", nationalId: "", sharePercentage: 0, role: "founder" }]);
  };
  const removeFounder = (id: string) => {
    setFounders(prev => prev.filter(f => f.id !== id));
  };
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
            <button
              type="button"
              onClick={() => isLeaf ? toggleActivity(node.id) : toggleExpand(node.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-right transition-colors ${
                isLeaf && isSelected
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "hover:bg-secondary border border-transparent"
              }`}
            >
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

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">تأسيس شركة جديدة</h1>
      <p className="text-muted-foreground text-sm mb-8">خدمة تأسيس الكيانات الاقتصادية — رقم الخدمة: EST-001</p>

      {/* Stepper */}
      {step !== "done" && (
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, idx) => {
            const done = idx < stepIdx;
            const active = idx === stepIdx;
            return (
              <div key={s.key} className="flex items-center gap-1 shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  active ? "bg-primary text-primary-foreground" :
                  done ? "bg-primary/80 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span className={`text-[10px] font-medium hidden md:block ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                {idx < STEPS.length - 1 && <div className={`w-4 md:w-8 h-0.5 ${done ? "bg-primary" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Step 1: Investment Type */}
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

      {/* Step 2: Activities */}
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
              <div className="max-h-80 overflow-y-auto">
                {renderTree(eisicActivities)}
              </div>
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

      {/* Step 3: Legal Form */}
      {step === "legal_form" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Scale className="w-5 h-5" /> اختر الشكل القانوني</CardTitle>
              <CardDescription>بناءً على الأنشطة المختارة — اختر الشكل القانوني المناسب</CardDescription>
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
                      <span>الحد الأدنى لرأس المال: {f.minCapital > 0 ? `${f.minCapital.toLocaleString()} ج.م` : "غير محدد"}</span>
                      <span>عدد المؤسسين: {f.minFounders}+</span>
                    </div>
                  </div>
                  <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedLegalForm === f.id ? "border-primary" : "border-muted-foreground/40"
                  }`}>
                    {selectedLegalForm === f.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} disabled={!selectedLegalForm} size="lg" className="flex-1 gap-2">
              التالي <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Incentives */}
      {step === "incentives" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Gift className="w-5 h-5" /> الحوافز والمزايا المتاحة</CardTitle>
              <CardDescription>بناءً على منطقة «{chosenInvestment?.label}» — اختر الحوافز التي تنطبق عليك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableIncentives.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">لا توجد حوافز خاصة لهذا النوع من الاستثمار</p>
              ) : (
                availableIncentives.map(inc => {
                  const selected = selectedIncentives.has(inc.id);
                  return (
                    <button key={inc.id} type="button" onClick={() => {
                      setSelectedIncentives(prev => {
                        const next = new Set(prev);
                        next.has(inc.id) ? next.delete(inc.id) : next.add(inc.id);
                        return next;
                      });
                    }} className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-right transition-all ${
                      selected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                    }`}>
                      <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 ${selected ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{inc.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{inc.description}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">{inc.discount}</Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} size="lg" className="flex-1 gap-2">
              التالي <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Summary */}
      {step === "summary" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ملخص المتطلبات</CardTitle>
              <CardDescription>مراجعة اختياراتك قبل الانتقال لحجز الاسم التجاري</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">نوع الاستثمار</p>
                <p className="font-semibold text-sm">{chosenInvestment?.label}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">الأنشطة الاقتصادية ({selectedActivities.size})</p>
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
              <div>
                <p className="text-xs text-muted-foreground mb-1">الحوافز المختارة</p>
                {selectedIncentives.size > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(selectedIncentives).map(id => {
                      const inc = incentives.find(i => i.id === id);
                      return <Badge key={id} className="text-xs">{inc?.label}</Badge>;
                    })}
                  </div>
                ) : <p className="text-sm text-muted-foreground">لم يتم اختيار حوافز</p>}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">التكلفة التقديرية</p>
                  <p className="text-lg font-bold text-primary">{fees ? `${fees.total.toLocaleString()} ج.م` : "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">الوقت المتوقع</p>
                  <p className="text-lg font-bold text-primary">5-10 أيام عمل</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">الجهات الحكومية المرتبطة</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs">الهيئة العامة للاستثمار</Badge>
                  <Badge variant="outline" className="text-xs">مصلحة الشركات</Badge>
                  <Badge variant="outline" className="text-xs">مصلحة الضرائب</Badge>
                  {selectedInvestment === "free_zone" && <Badge variant="outline" className="text-xs">هيئة المناطق الحرة</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} size="lg" className="flex-1 gap-2">
              الانتقال لحجز الاسم التجاري <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 6: Name Check */}
      {step === "name_check" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Search className="w-5 h-5" /> التحقق من الاسم التجاري</CardTitle>
              <CardDescription>أدخل الاسم المقترح للشركة للتحقق من التوفر وعدم التكرار</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input value={companyName} onChange={e => { setCompanyName(e.target.value); setNameStatus(null); setNameReserved(false); }}
                  placeholder="مثال: شركة الابتكار للتكنولوجيا" className="flex-1" />
                <Button onClick={handleNameCheck} disabled={loading || !companyName.trim()} className="gap-2 shrink-0">
                  {loading && !nameStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  تحقق
                </Button>
              </div>
              {nameStatus && (
                <div className={`p-4 rounded-xl border-2 ${
                  nameStatus === "available" ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20" : "border-destructive/50 bg-destructive/5"
                }`}>
                  <div className="flex items-center gap-2">
                    {nameStatus === "available" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold">✕</span>
                    )}
                    <p className="font-semibold text-sm">{nameStatus === "available" ? "الاسم متاح" : "الاسم غير متاح"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 mr-7">{nameMessage}</p>
                  {nameStatus === "available" && !nameReserved && (
                    <Button onClick={handleReserveName} disabled={loading} size="sm" className="mt-3 mr-7 gap-2">
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      حجز الاسم (رسوم: 100 ج.م)
                    </Button>
                  )}
                  {nameReserved && (
                    <div className="mt-3 mr-7 flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">تم حجز الاسم بنجاح — صالح لمدة 30 يوماً</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
            <Button onClick={goNext} disabled={!nameReserved} size="lg" className="flex-1 gap-2">
              التالي — إعداد العقد <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 7: Contract */}
      {step === "contract" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><FileText className="w-5 h-5" /> إعداد عقد التأسيس</CardTitle>
              <CardDescription>أدخل بيانات المؤسسين والمستشارين — {chosenLegalForm?.label}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Capital */}
              <div>
                <Label>رأس المال (ج.م)</Label>
                <Input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} min={chosenLegalForm?.minCapital || 0} className="mt-1" />
                {chosenLegalForm && chosenLegalForm.minCapital > 0 && capital < chosenLegalForm.minCapital && (
                  <p className="text-destructive text-xs mt-1">الحد الأدنى لرأس المال: {chosenLegalForm.minCapital.toLocaleString()} ج.م</p>
                )}
              </div>
              <Separator />
              {/* Founders */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">المؤسسون</Label>
                  <Button variant="outline" size="sm" onClick={addFounder} className="gap-1"><Plus className="w-3.5 h-3.5" /> إضافة مؤسس</Button>
                </div>
                <div className="space-y-3">
                  {founders.map((f, idx) => (
                    <div key={f.id} className="p-3 rounded-lg border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">مؤسس {idx + 1}</span>
                        {founders.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeFounder(f.id)} className="h-7 w-7 p-0 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        )}
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
              {/* Accountant & Lawyer */}
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
              {/* Fee summary */}
              {fees && (
                <div className="p-4 rounded-xl bg-secondary space-y-2">
                  <p className="font-semibold text-sm">رسوم العقد</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-muted-foreground">رسوم أساسية</span><span>{fees.baseFee.toLocaleString()} ج.م</span>
                    <span className="text-muted-foreground">رسم دمغة (0.25% من رأس المال)</span><span>{fees.stampFee.toLocaleString()} ج.م</span>
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
                  <p key={f.id}>الطرف {i === 0 ? "الأول" : i === 1 ? "الثاني" : `${i + 1}`}: السيد/ {f.name || "___________"} — رقم قومي: {f.nationalId || "__________"} — حصة: {f.sharePercentage}%</p>
                ))}
                <p>على تأسيس شركة باسم: <strong className="text-foreground">{companyName}</strong></p>
                <p>برأس مال قدره: <strong className="text-foreground">{capital.toLocaleString()} جنيه مصري</strong></p>
                <p>الأنشطة: {Array.from(selectedActivities).map(id => getLeafLabel(eisicActivities, id)).join("، ")}</p>
                <p className="text-xs text-muted-foreground/70">... (باقي بنود العقد حسب النموذج المعتمد من مصلحة الشركات)</p>
              </CardContent>
            )}
          </Card>

          {/* Sign */}
          {!signed ? (
            <Button onClick={handleSign} disabled={loading || founders.some(f => !f.name || !f.nationalId)} size="lg" className="w-full gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التوقيع الإلكتروني...</> : <><PenTool className="w-4 h-4" /> توقيع العقد إلكترونياً</>}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 justify-center py-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">تم توقيع العقد بنجاح من جميع الأطراف</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={goPrev} className="gap-2"><ArrowRight className="w-4 h-4" /> السابق</Button>
                <Button onClick={goNext} size="lg" className="flex-1 gap-2">الانتقال للدفع <ArrowLeft className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 8: Payment */}
      {step === "payment" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="w-5 h-5" /> سداد الرسوم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fees && (
                <div className="p-4 rounded-xl bg-secondary space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">رسوم العقد</span><span>{fees.total.toLocaleString()} ج.م</span>
                    <span className="text-muted-foreground">رسوم حجز الاسم</span><span>100 ج.م</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>الإجمالي</span><span className="text-primary text-lg">{(fees.total + 100).toLocaleString()} ج.م</span>
                  </div>
                </div>
              )}
              {!paid ? (
                <Button onClick={handlePay} disabled={loading} size="lg" className="w-full gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري السداد...</> : <><CreditCard className="w-4 h-4" /> سداد الآن</>}
                </Button>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-bold text-lg">تم السداد بنجاح</p>
                  <Button onClick={() => setStep("done")} size="lg" className="gap-2">
                    عرض شهادة التأسيس <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Done */}
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
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => navigate("/services")} className="gap-2">
                  العودة للكتالوج
                </Button>
                <Button onClick={() => navigate("/dashboard")} className="gap-2">
                  لوحة العميل <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EstablishCompany;
