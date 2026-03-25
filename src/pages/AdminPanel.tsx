import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, FileQuestion, Loader2 } from "lucide-react";

const statusLabels: Record<string, string> = {
  submitted: "تم التقديم",
  under_review: "قيد المراجعة",
  approved: "تمت الموافقة",
  payment_pending: "في انتظار السداد",
  issued: "تم الإصدار",
  rejected: "مرفوض",
};

const AdminPanel = () => {
  const { requests, approveRequest, rejectRequest, requestDocuments } = useApp();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleAction = async (id: string, action: () => void) => {
    setLoadingId(id);
    await new Promise(r => setTimeout(r, 1000));
    action();
    setLoadingId(null);
  };

  const selected = requests.find(r => r.id === selectedId);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-8">لوحة الإدارة</h1>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            لا توجد طلبات مقدمة حالياً
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Request list */}
          <div className="space-y-3">
            {requests.map(r => (
              <Card
                key={r.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${selectedId === r.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedId(r.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{r.id}</span>
                    <Badge variant="secondary" className="text-[10px]">{statusLabels[r.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.fullName}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detail panel */}
          <div className="md:col-span-2">
            {selected ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">تفاصيل الطلب - {selected.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">الاسم:</span> {selected.fullName}</div>
                    <div><span className="text-muted-foreground">الرقم القومي:</span> {selected.nationalId}</div>
                    <div><span className="text-muted-foreground">نوع الجهة:</span> {selected.entityType === "individual" ? "فردي" : "شركة"}</div>
                    <div><span className="text-muted-foreground">الحالة:</span> {statusLabels[selected.status]}</div>
                  </div>

                  <div>
                    <p className="font-medium text-sm mb-2">المستندات:</p>
                    <div className="space-y-1">
                      {Object.values(selected.documents).map(d => (
                        <div key={d.name} className="text-sm flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-success" />
                          {d.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {(selected.status === "submitted" || selected.status === "under_review") && (
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        onClick={() => handleAction(selected.id, () => approveRequest(selected.id))}
                        disabled={loadingId === selected.id}
                        className="gap-1.5"
                      >
                        {loadingId === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        موافقة
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleAction(selected.id, () => rejectRequest(selected.id))}
                        disabled={loadingId === selected.id}
                        className="gap-1.5"
                      >
                        <X className="w-4 h-4" /> رفض
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAction(selected.id, () => requestDocuments(selected.id, ["شهادة ضريبية", "كشف حساب بنكي"]))}
                        disabled={loadingId === selected.id}
                        className="gap-1.5"
                      >
                        <FileQuestion className="w-4 h-4" /> طلب مستندات
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  اختر طلباً من القائمة لعرض التفاصيل
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
