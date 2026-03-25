import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { Upload, CheckCircle2, Loader2 } from "lucide-react";

const requiredDocs = [
  { key: "establishment_cert", label: "شهادة التأسيس" },
  { key: "establishment_contract", label: "عقد التأسيس" },
  { key: "id_card", label: "بطاقة الهوية" },
  { key: "power_of_attorney", label: "التوكيلات" },
];

const SubmitRequest = () => {
  const navigate = useNavigate();
  const { submitRequest } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    nationalId: "",
    entityType: "individual" as "company" | "individual",
  });
  const [docs, setDocs] = useState<Record<string, File | null>>({});

  const allDocsUploaded = requiredDocs.every(d => docs[d.key]);
  const formValid = form.fullName && form.nationalId && allDocsUploaded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const documents: Record<string, { name: string; file: File | null }> = {};
    requiredDocs.forEach(d => {
      documents[d.key] = { name: d.label, file: docs[d.key] ?? null };
    });
    submitRequest({ ...form, serviceId: "0001", documents });
    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">طلب استخراج شهادة مزاولة مهنة</h1>
      <p className="text-muted-foreground mb-8">رقم الخدمة: 0001</p>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <Card>
          <CardHeader><CardTitle className="text-lg">المستندات المطلوبة</CardTitle></CardHeader>
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

        <Button type="submit" size="lg" className="w-full" disabled={!formValid || loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التقديم...</> : "تقديم الطلب"}
        </Button>
      </form>
    </div>
  );
};

export default SubmitRequest;
