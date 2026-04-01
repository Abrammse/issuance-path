import { useApp } from "@/context/AppContext";
import { useJsc, WORKFLOW, type JscStage } from "@/context/JscContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import StatusTimeline from "@/components/StatusTimeline";
import { FileText, AlertTriangle, Building2, CreditCard, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const statusLabels: Record<string, string> = {
  selected: "تم الاختيار",
  identity_check: "التحقق من الهوية",
  eligibility_check: "فحص الأهلية",
  document_retrieval: "استرجاع المستندات",
  compliance_review: "مراجعة الامتثال",
  pending_decision: "في انتظار القرار",
  approved: "تمت الموافقة",
  payment_pending: "في انتظار السداد",
  payment_check: "التحقق من السداد",
  ratification: "التصديق",
  published: "تم الإصدار",
  rejected: "مرفوض",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  selected: "secondary", identity_check: "outline", eligibility_check: "outline",
  document_retrieval: "outline", compliance_review: "outline", pending_decision: "outline",
  approved: "default", payment_pending: "outline", payment_check: "outline",
  ratification: "outline", published: "default", rejected: "destructive",
};

const stageLabel = (s: JscStage) => WORKFLOW.find(w => w.stage === s)?.label || s;

const Dashboard = () => {
  const { requests, currentRequest, setCurrentRequest } = useApp();
  const { jscRequests, clientApproveContract, clientPay } = useJsc();
  const [activeTab, setActiveTab] = useState<"services" | "jsc">(jscRequests.length > 0 ? "jsc" : "services");
  const [selectedJscId, setSelectedJscId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasServices = requests.length > 0;
  const hasJsc = jscRequests.length > 0;
  const selectedJsc = jscRequests.find(r => r.id === selectedJscId);
  const req = currentRequest ?? (requests.length > 0 ? requests[requests.length - 1] : null);

  const handleClientAction = async (action: () => void) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    action();
    setLoading(false);
  };

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">لوحة العميل</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {hasJsc && (
          <Button variant={activeTab === "jsc" ? "default" : "outline"} onClick={() => setActiveTab("jsc")} className="gap-2">
            <Building2 className="w-4 h-4" /> طلبات التأسيس (مساهمة)
            <Badge variant="secondary" className="text-[10px] mr-1">{jscRequests.length}</Badge>
          </Button>
        )}
        <Button variant={activeTab === "services" ? "default" : "outline"} onClick={() => setActiveTab("services")} className="gap-2">
          <FileText className="w-4 h-4" /> طلبات الخدمات
          {hasServices && <Badge variant="secondary" className="text-[10px] mr-1">{requests.length}</Badge>}
        </Button>
      </div>

      {/* ── JSC Tab ── */}
      {activeTab === "jsc" && (
        <>
          {!hasJsc ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد طلبات تأسيس شركات مساهمة</CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                {jscRequests.map(r => (
                  <button key={r.id} onClick={() => setSelectedJscId(r.id)}
                    className={`w-full text-right p-3 border rounded-lg text-sm transition-colors ${selectedJscId === r.id ? "ring-2 ring-primary" : "hover:bg-secondary"}`}>
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-xs">{r.id}</span>
                      <Badge variant={r.currentStage === "completed" ? "default" : r.currentStage === "rejected" ? "destructive" : "outline"} className="text-[10px]">
                        {stageLabel(r.currentStage)}
                      </Badge>
                    </div>
                    <p className="font-medium">{r.companyName}</p>
                  </button>
                ))}
              </div>
              <div className="md:col-span-2">
                {selectedJsc ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedJsc.companyName} — {selectedJsc.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">تقدم الطلب:</p>
                        {WORKFLOW.map((w, i) => {
                          const currentIdx = WORKFLOW.findIndex(x => x.stage === selectedJsc.currentStage);
                          const isDone = i < currentIdx;
                          const isCurrent = i === currentIdx;
                          return (
                            <div key={w.stage} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                              isDone ? "text-emerald-700 bg-emerald-50" : isCurrent ? "text-primary font-bold bg-primary/5" : "text-muted-foreground"
                            }`}>
                              {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : isCurrent ? <span>◉</span> : <span className="w-3.5 text-center">○</span>}
                              <span>{w.label}</span>
                              <span className="text-muted-foreground mr-auto">({w.agency})</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Generated outputs */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {selectedJsc.nameReservationNo && <div className="p-2 bg-secondary rounded"><span className="text-muted-foreground">حجز الاسم:</span> <span className="font-mono">{selectedJsc.nameReservationNo}</span></div>}
                        {selectedJsc.bankCertNo && <div className="p-2 bg-secondary rounded"><span className="text-muted-foreground">الشهادة البنكية:</span> <span className="font-mono">{selectedJsc.bankCertNo}</span></div>}
                        {selectedJsc.clearingCode && <div className="p-2 bg-secondary rounded"><span className="text-muted-foreground">كود المقاصة:</span> <span className="font-mono">{selectedJsc.clearingCode}</span></div>}
                        {selectedJsc.contractNo && <div className="p-2 bg-secondary rounded"><span className="text-muted-foreground">رقم العقد:</span> <span className="font-mono">{selectedJsc.contractNo}</span></div>}
                        {selectedJsc.establishmentCertNo && <div className="p-2 bg-secondary rounded"><span className="text-muted-foreground">شهادة التأسيس:</span> <span className="font-mono">{selectedJsc.establishmentCertNo}</span></div>}
                        {selectedJsc.practiceCertNo && <div className="p-2 bg-secondary rounded"><span className="text-muted-foreground">شهادة المزاولة:</span> <span className="font-mono">{selectedJsc.practiceCertNo}</span></div>}
                        {selectedJsc.commercialRegNo && <div className="p-2 bg-secondary rounded"><span className="text-muted-foreground">السجل التجاري:</span> <span className="font-mono">{selectedJsc.commercialRegNo}</span></div>}
                        {selectedJsc.taxNo && <div className="p-2 bg-secondary rounded"><span className="text-muted-foreground">الرقم الضريبي:</span> <span className="font-mono">{selectedJsc.taxNo}</span></div>}
                      </div>

                      {/* Client actions */}
                      {selectedJsc.currentStage === "client_review" && (
                        <div className="p-4 border-2 border-primary/30 rounded-lg space-y-3">
                          <p className="font-semibold text-sm">⏳ مطلوب: مراجعة والموافقة على العقد</p>
                          <p className="text-xs text-muted-foreground">عقد رقم: {selectedJsc.contractNo}</p>
                          <Button onClick={() => handleClientAction(() => clientApproveContract(selectedJsc.id))} disabled={loading} className="gap-2">
                            {loading ? "جاري..." : "✓ الموافقة على العقد"}
                          </Button>
                        </div>
                      )}

                      {selectedJsc.currentStage === "payment_pending" && (
                        <div className="p-4 border-2 border-primary/30 rounded-lg space-y-3">
                          <p className="font-semibold text-sm">⏳ مطلوب: سداد الرسوم</p>
                          <Button onClick={() => handleClientAction(() => clientPay(selectedJsc.id))} disabled={loading} className="gap-2">
                            <CreditCard className="w-4 h-4" /> {loading ? "جاري السداد..." : "سداد الآن"}
                          </Button>
                        </div>
                      )}

                      {/* Rejection */}
                      {selectedJsc.currentStage === "rejected" && (
                        <div className="p-4 bg-destructive/5 border border-destructive/30 rounded-lg">
                          <p className="font-semibold text-destructive text-sm">تم رفض الطلب</p>
                          <p className="text-xs text-muted-foreground">من: {selectedJsc.rejectedBy}</p>
                          <p className="text-xs">{selectedJsc.rejectionReason}</p>
                        </div>
                      )}

                      {/* Completed */}
                      {selectedJsc.currentStage === "completed" && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-lg text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                          <p className="font-bold text-emerald-600">تم تأسيس الشركة بنجاح!</p>
                        </div>
                      )}

                      {/* Requested docs */}
                      {selectedJsc.requestedDocs && selectedJsc.requestedDocs.length > 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                          <p className="font-semibold mb-1">📎 مستندات مطلوبة:</p>
                          {selectedJsc.requestedDocs.map((d, i) => <p key={i} className="text-xs">• {d}</p>)}
                        </div>
                      )}

                      {/* Logs */}
                      <div className="border-t pt-3">
                        <p className="text-xs font-semibold mb-2">سجل العمليات ({selectedJsc.logs.length})</p>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {[...selectedJsc.logs].reverse().map(log => (
                            <div key={log.id} className="text-xs p-1.5 bg-secondary rounded flex gap-2">
                              <span className="text-muted-foreground shrink-0">{log.timestamp.toLocaleTimeString("ar-EG")}</span>
                              <span className="font-medium">[{log.agency}]</span>
                              <span>{log.note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card><CardContent className="py-16 text-center text-muted-foreground">اختر طلباً من القائمة</CardContent></Card>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Services Tab (original) ── */}
      {activeTab === "services" && (
        <>
          {!hasServices ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">لا توجد طلبات خدمات</h2>
              <Button asChild><Link to="/submit">تقديم طلب جديد</Link></Button>
            </div>
          ) : (
            <>
              {requests.length > 1 && (
                <div className="flex gap-2 mb-6 flex-wrap">
                  {requests.map(r => (
                    <button key={r.id} onClick={() => setCurrentRequest(r)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        req?.id === r.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"
                      }`}>
                      {r.id}
                    </button>
                  ))}
                </div>
              )}
              {req && (
                <>
                  <Card className="mb-6">
                    <CardHeader className="flex-row items-center justify-between">
                      <CardTitle className="text-lg">الطلب {req.id}</CardTitle>
                      <Badge variant={statusVariants[req.status] ?? "secondary"}>{statusLabels[req.status]}</Badge>
                    </CardHeader>
                    <CardContent>
                      <StatusTimeline status={req.status} />
                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div><span className="text-muted-foreground">الاسم:</span> {req.fullName}</div>
                        <div><span className="text-muted-foreground">الرقم القومي:</span> {req.nationalId}</div>
                      </div>
                    </CardContent>
                  </Card>
                  {req.missingDocs.length > 0 && (
                    <Card className="mb-6 border-warning/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium mb-2">مستندات مطلوبة</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {req.missingDocs.map(d => <li key={d}>• {d}</li>)}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <div className="flex gap-3">
                    {req.status === "payment_pending" && <Button asChild><Link to="/payment">الذهاب للسداد</Link></Button>}
                    {req.status === "published" && <Button asChild><Link to="/certificate">عرض الشهادة</Link></Button>}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
