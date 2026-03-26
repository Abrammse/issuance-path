import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { OutputType } from "@/context/AppContext";
import { Upload, CheckCircle2, Loader2, Fingerprint, ShieldCheck, FolderSearch, FileCheck, FileDigit, Printer, BadgeCheck, Building2, Truck } from "lucide-react";

const requiredDocs = [
  { key: "establishment_cert", label: "شهادة التأسيس" },
  { key: "establishment_contract", label: "عقد التأسيس" },
  { key: "id_card", label: "بطاقة الهوية" },
  { key: "power_of_attorney", label: "التوكيلات" },
];

const mockCompanies = [
  { id: "comp-1", name: "شركة النور للتجارة والاستيراد", regNumber: "CR-29481" },
  { id: "comp-2", name: "مؤسسة الأمل للمقاولات", regNumber: "CR-10273" },
  { id: "comp-3", name: "شركة المستقبل للتكنولوجيا", regNumber: "CR-55820" },
];

const outputOptions: { value: OutputType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: "digital",
    label: "ملف رقمي",
    desc: "شهادة إلكترونية موقعة رقمياً",
    icon: <FileDigit className="w-5 h-5" />,
  },
  {
    value: "printed_delivery",
    label: "ملف مطبوع مع التوصيل",
    desc: "نسخة مطبوعة يتم توصيلها عبر البريد المصري",
    icon: <Printer className="w-5 h-5" />,
  },
  {
    value: "certified_delivery",
    label: "ملف موثّق مع التوصيل",
    desc: "نسخة موثّقة من الجهة يتم توصيلها عبر البريد المصري",
    icon: <BadgeCheck className="w-5 h-5" />,
  },
];

type Step = "form" | "identity" | "eligibility" | "documents" | "review";

const SubmitRequest = () => {
  const navigate = useNavigate();
  const { submitRequest, advanceToIdentity, advanceToEligibility, advanceToRetrieval, advanceToCompliance, advanceToPendingDecision, currentRequest } = useApp();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({
    fullName: "",
    nationalId: "",
    entityType: "individual" as "company" | "individual",
  });
  const [outputType, setOutputType] = useState<OutputType>("digital");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [docs, setDocs] = useState<Record<string, File | null>>({});

  const allDocsUploaded = requiredDocs.every(d => docs[d.key]);
  const formValid = form.fullName && form.nationalId && outputType;

  const handleSelectService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    setLoading(true);
    const documents: Record<string, { name: string; file: File | null }> = {};
    requiredDocs.forEach(d => {
      documents[d.key] = { name: d.label, file: null };
    });
    submitRequest({ ...form, serviceId: "0001", documents, outputType });
    await new Promise(r => setTimeout(r, 800));
    setStep("identity");
    setLoading(false);
  };

  const handleIdentityCheck = async () => {
    if (!currentRequest) return;
    setLoading(true);
    advanceToIdentity(currentRequest.id);
    await new Promise(r => setTimeout(r, 2000));
    advanceToEligibility(currentRequest.id);
    setStep("eligibility");
    setLoading(false);
  };

  const handleEligibilityCheck = async () => {
    if (!currentRequest) return;
    if (form.entityType === "company" && !selectedCompany) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    advanceToRetrieval(currentRequest.id);
    setStep("documents");
    setLoading(false);
  };

  const handleSubmitDocuments = async () => {
    if (!currentRequest || !allDocsUploaded) return;
    setLoading(true);
    const documents: Record<string, { name: string; file: File | null }> = {};
    requiredDocs.forEach(d => {
      documents[d.key] = { name: d.label, file: docs[d.key] ?? null };
    });
    advanceToCompliance(currentRequest.id);
    await new Promise(r => setTimeout(r, 1500));
    advanceToPendingDecision(currentRequest.id);
    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">طلب استخراج شهادة مزاولة مهنة</h1>
      <p className="text-muted-foreground mb-8">رقم الخدمة: 0001</p>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { key: "form", label: "البيانات" },
          { key: "identity", label: "الهوية" },
          { key: "eligibility", label: "الأهلية" },
          { key: "documents", label: "المستندات" },
        ].map((s, idx, arr) => {
          const stepOrder = ["form", "identity", "eligibility", "documents"];
          const currentIdx = stepOrder.indexOf(step);
          const thisIdx = stepOrder.indexOf(s.key);
          const done = thisIdx < currentIdx;
          const active = thisIdx === currentIdx;
          return (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                active ? "bg-primary text-primary-foreground" :
                done ? "bg-primary/80 text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              {idx < arr.length - 1 && (
                <div className={`flex-1 h-0.5 ${done ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step: Form */}
      {step === "form" && (
        <form onSubmit={handleSelectService} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">البيانات الأساسية</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input id="fullName" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="أدخل الاسم الكامل" required />
              </div>
              <div>
                <Label htmlFor="nationalId">الرقم القومي</Label>
                <Input id="nationalId" value={form.nationalId} onChange={e => setForm(f => ({ ...f, nationalId: e.target.value }))} placeholder="أدخل الرقم القومي" required />
              </div>
              <div>
                <Label>نوع الجهة</Label>
                <div className="flex gap-4 mt-2">
                  {(["individual", "company"] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, entityType: t }))}
                      className={`px-6 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        form.entityType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"
                      }`}
                    >
                      {t === "individual" ? "فردي" : "شركة"}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Type Selection */}
          <Card>
            <CardHeader><CardTitle className="text-lg">نوع المخرجات</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {outputOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOutputType(opt.value)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-right transition-all ${
                    outputType === opt.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  <div className={`mt-0.5 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    outputType === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    {opt.value !== "digital" && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <Truck className="w-3.5 h-3.5" />
                        <span>تكامل مع البريد المصري للتوصيل</span>
                      </div>
                    )}
                  </div>
                  <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    outputType === opt.value ? "border-primary" : "border-muted-foreground/40"
                  }`}>
                    {outputType === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={!formValid || loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التقديم...</> : "اختيار الخدمة والمتابعة"}
          </Button>
        </form>
      )}

      {/* Step: Identity Check */}
      {step === "identity" && (
        <Card>
          <CardContent className="py-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Fingerprint className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">التحقق من الهوية</h3>
              <p className="text-muted-foreground text-sm">
                سيتم التحقق من هويتك عبر منصة مصر الرقمية (Digital Egypt)
              </p>
              <p className="text-xs text-muted-foreground mt-1">الرقم القومي: {form.nationalId}</p>
            </div>
            <Button onClick={handleIdentityCheck} disabled={loading} size="lg" className="gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحقق...</> : <>
                <Fingerprint className="w-4 h-4" />
                بدء التحقق من الهوية
              </>}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Eligibility Check */}
      {step === "eligibility" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="py-10 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">فحص الأهلية</h3>
                <p className="text-muted-foreground text-sm">
                  جاري التحقق من أهليتك للحصول على الخدمة
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Company Selection — only if entityType is company */}
          {form.entityType === "company" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  اختر الشركة
                </CardTitle>
                <p className="text-xs text-muted-foreground">تم العثور على {mockCompanies.length} شركات مسجّلة باسمك</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockCompanies.map(comp => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => setSelectedCompany(comp.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-right transition-all ${
                      selectedCompany === comp.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedCompany === comp.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{comp.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">رقم السجل: {comp.regNumber}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedCompany === comp.id ? "border-primary" : "border-muted-foreground/40"
                    }`}>
                      {selectedCompany === comp.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleEligibilityCheck}
            disabled={loading || (form.entityType === "company" && !selectedCompany)}
            size="lg"
            className="w-full gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري فحص الأهلية...</> : <>
              <ShieldCheck className="w-4 h-4" />
              {form.entityType === "company" ? "متابعة بالشركة المختارة" : "فحص الأهلية"}
            </>}
          </Button>
        </div>
      )}

      {/* Step: Document Upload */}
      {step === "documents" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderSearch className="w-5 h-5" />
                رفع المستندات المطلوبة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requiredDocs.map(d => (
                <div key={d.key} className={`flex items-center justify-between p-3 rounded-lg border ${docs[d.key] ? "border-success/50 bg-success/5" : "border-border"}`}>
                  <span className="text-sm font-medium">{d.label}</span>
                  {docs[d.key] ? (
                    <span className="flex items-center gap-1.5 text-success text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      تم الرفع
                    </span>
                  ) : (
                    <label className="cursor-pointer flex items-center gap-1.5 text-primary text-sm font-medium hover:underline">
                      <Upload className="w-4 h-4" />
                      رفع الملف
                      <input type="file" className="hidden" onChange={e => {
                        const file = e.target.files?.[0] ?? null;
                        setDocs(prev => ({ ...prev, [d.key]: file }));
                      }} />
                    </label>
                  )}
                </div>
              ))}
              {!allDocsUploaded && (
                <p className="text-destructive text-xs mt-2">يجب رفع جميع المستندات المطلوبة لإتمام التقديم</p>
              )}
            </CardContent>
          </Card>
          <Button onClick={handleSubmitDocuments} size="lg" className="w-full gap-2" disabled={!allDocsUploaded || loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري المراجعة والتقديم...</> : <>
              <FileCheck className="w-4 h-4" />
              تقديم المستندات للمراجعة
            </>}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubmitRequest;
