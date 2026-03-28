import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, FileQuestion, Loader2, Landmark, Award, Building2, FileText } from "lucide-react";

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

const estStageLabels: Record<string, string> = {
  name_pending: "في انتظار الموافقة على الاسم",
  name_approved: "تمت الموافقة على الاسم",
  name_rejected: "تم رفض الاسم",
  contract_pending: "في انتظار مراجعة العقد",
  contract_approved: "تمت الموافقة على العقد",
  contract_rejected: "تم رفض العقد",
  contract_docs_requested: "مطلوب مستندات إضافية",
  completed: "تم التأسيس",
};

const estStageBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  name_pending: "outline",
  name_approved: "default",
  name_rejected: "destructive",
  contract_pending: "outline",
  contract_approved: "default",
  contract_rejected: "destructive",
  contract_docs_requested: "secondary",
  completed: "default",
};

const AdminPanel = () => {
  const {
    requests, approveRequest, rejectRequest, requestDocuments, advanceToRatification, publishRequest,
    establishmentRequests, updateEstablishmentStage,
  } = useApp();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"services" | "establishment">("establishment");

  const handleAction = async (id: string, action: () => void) => {
    setLoadingId(id);
    await new Promise(r => setTimeout(r, 1000));
    action();
    setLoadingId(null);
  };

  const selected = requests.find(r => r.id === selectedId);
  const selectedEst = establishmentRequests.find(r => r.id === selectedId);

  const hasServices = requests.length > 0;
  const hasEstablishment = establishmentRequests.length > 0;

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">لوحة الجهة</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "establishment" ? "default" : "outline"}
          onClick={() => { setActiveTab("establishment"); setSelectedId(null); }}
          className="gap-2"
        >
          <Building2 className="w-4 h-4" /> طلبات التأسيس
          {hasEstablishment && <Badge variant="secondary" className="text-[10px] mr-1">{establishmentRequests.length}</Badge>}
        </Button>
        <Button
          variant={activeTab === "services" ? "default" : "outline"}
          onClick={() => { setActiveTab("services"); setSelectedId(null); }}
          className="gap-2"
        >
          <FileText className="w-4 h-4" /> طلبات الخدمات
          {hasServices && <Badge variant="secondary" className="text-[10px] mr-1">{requests.length}</Badge>}
        </Button>
      </div>

      {/* ── Establishment Tab ── */}
      {activeTab === "establishment" && (
        <>
          {!hasEstablishment ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                لا توجد طلبات تأسيس حالياً
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                {establishmentRequests.map(r => (
                  <Card
                    key={r.id}
                    className={`cursor-pointer transition-shadow hover:shadow-md ${selectedId === r.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedId(r.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{r.id}</span>
                        <Badge variant={estStageBadgeVariant[r.stage] ?? "secondary"} className="text-[10px]">
                          {estStageLabels[r.stage]}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold">{r.companyName}</p>
                      <p className="text-xs text-muted-foreground">{r.applicantName}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="md:col-span-2">
                {selectedEst ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">تفاصيل طلب التأسيس - {selectedEst.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">اسم الشركة:</span> <strong>{selectedEst.companyName}</strong></div>
                        <div><span className="text-muted-foreground">مقدم الطلب:</span> {selectedEst.applicantName}</div>
                        <div><span className="text-muted-foreground">الرقم القومي:</span> {selectedEst.applicantNationalId}</div>
                        <div><span className="text-muted-foreground">الشكل القانوني:</span> {selectedEst.legalForm}</div>
                        <div><span className="text-muted-foreground">رأس المال:</span> {selectedEst.capital.toLocaleString()} ج.م</div>
                        <div><span className="text-muted-foreground">نوع المخرجات:</span> {selectedEst.outputType === "digital" ? "رقمي" : "مطبوع"}</div>
                      </div>

                      {selectedEst.founders.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <p className="font-medium text-sm mb-2">المؤسسون ({selectedEst.founders.length})</p>
                            <div className="space-y-1">
                              {selectedEst.founders.map((f, i) => (
                                <div key={i} className="text-sm flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-primary" />
                                  {f.name} — {f.sharePercentage}%
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <Separator />

                      {/* Name approval actions */}
                      {selectedEst.stage === "name_pending" && (
                        <div className="space-y-3 pt-2">
                          <p className="text-sm font-semibold text-amber-600">⏳ مطلوب: الموافقة على الاسم التجاري «{selectedEst.companyName}»</p>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleAction(selectedEst.id, () => updateEstablishmentStage(selectedEst.id, "name_approved"))}
                              disabled={loadingId === selectedEst.id}
                              className="gap-1.5"
                            >
                              {loadingId === selectedEst.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              موافقة على الاسم
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleAction(selectedEst.id, () => updateEstablishmentStage(selectedEst.id, "name_rejected"))}
                              disabled={loadingId === selectedEst.id}
                              className="gap-1.5"
                            >
                              <X className="w-4 h-4" /> رفض الاسم
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Contract approval actions */}
                      {selectedEst.stage === "contract_pending" && (
                        <div className="space-y-3 pt-2">
                          <p className="text-sm font-semibold text-amber-600">⏳ مطلوب: مراجعة العقد والموافقة عليه</p>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              onClick={() => handleAction(selectedEst.id, () => updateEstablishmentStage(selectedEst.id, "contract_approved"))}
                              disabled={loadingId === selectedEst.id}
                              className="gap-1.5"
                            >
                              {loadingId === selectedEst.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              موافقة على العقد
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleAction(selectedEst.id, () => updateEstablishmentStage(selectedEst.id, "contract_docs_requested", ["صورة البطاقة الضريبية", "إثبات العنوان"]))}
                              disabled={loadingId === selectedEst.id}
                              className="gap-1.5"
                            >
                              <FileQuestion className="w-4 h-4" /> طلب مستندات
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleAction(selectedEst.id, () => updateEstablishmentStage(selectedEst.id, "contract_rejected"))}
                              disabled={loadingId === selectedEst.id}
                              className="gap-1.5"
                            >
                              <X className="w-4 h-4" /> رفض العقد
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Completed state */}
                      {selectedEst.stage === "completed" && (
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center">
                          <Award className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                          <p className="font-bold text-emerald-600">تم تأسيس الشركة بنجاح</p>
                        </div>
                      )}

                      {/* Show current status for non-actionable stages */}
                      {["name_approved", "name_rejected", "contract_approved", "contract_rejected", "contract_docs_requested"].includes(selectedEst.stage) && (
                        <div className="p-3 rounded-lg bg-secondary text-center">
                          <Badge variant={estStageBadgeVariant[selectedEst.stage]} className="text-xs">
                            {estStageLabels[selectedEst.stage]}
                          </Badge>
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
        </>
      )}

      {/* ── Services Tab (original) ── */}
      {activeTab === "services" && (
        <>
          {!hasServices ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                لا توجد طلبات خدمات حالياً
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
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
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              {d.name}
                            </div>
                          ))}
                        </div>
                      </div>

                      {selected.status === "pending_decision" && (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button onClick={() => handleAction(selected.id, () => approveRequest(selected.id))} disabled={loadingId === selected.id} className="gap-1.5">
                            {loadingId === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            موافقة
                          </Button>
                          <Button variant="destructive" onClick={() => handleAction(selected.id, () => rejectRequest(selected.id))} disabled={loadingId === selected.id} className="gap-1.5">
                            <X className="w-4 h-4" /> رفض
                          </Button>
                          <Button variant="outline" onClick={() => handleAction(selected.id, () => requestDocuments(selected.id, ["شهادة ضريبية", "كشف حساب بنكي"]))} disabled={loadingId === selected.id} className="gap-1.5">
                            <FileQuestion className="w-4 h-4" /> طلب مستندات
                          </Button>
                        </div>
                      )}

                      {selected.status === "compliance_review" && (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button variant="outline" onClick={() => handleAction(selected.id, () => requestDocuments(selected.id, ["شهادة ضريبية", "كشف حساب بنكي"]))} disabled={loadingId === selected.id} className="gap-1.5">
                            <FileQuestion className="w-4 h-4" /> طلب مستندات إضافية
                          </Button>
                        </div>
                      )}

                      {selected.status === "payment_check" && (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button onClick={() => handleAction(selected.id, () => advanceToRatification(selected.id))} disabled={loadingId === selected.id} className="gap-1.5">
                            {loadingId === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Landmark className="w-4 h-4" />}
                            يحتاج تصديق
                          </Button>
                          <Button variant="secondary" onClick={() => handleAction(selected.id, () => publishRequest(selected.id))} disabled={loadingId === selected.id} className="gap-1.5">
                            <Award className="w-4 h-4" /> نشر مباشر
                          </Button>
                        </div>
                      )}

                      {selected.status === "ratification" && (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button onClick={() => handleAction(selected.id, () => publishRequest(selected.id))} disabled={loadingId === selected.id} className="gap-1.5">
                            {loadingId === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                            تم التصديق - نشر الشهادة
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
        </>
      )}
    </div>
  );
};

export default AdminPanel;
