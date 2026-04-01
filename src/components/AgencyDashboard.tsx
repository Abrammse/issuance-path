import { useState } from "react";
import { useJsc, WORKFLOW, AGENCIES, type JscRequest, type JscStage } from "@/context/JscContext";

const stageLabel = (stage: JscStage) => WORKFLOW.find(w => w.stage === stage)?.label || stage;

interface Props {
  agencyId: string;
}

const AgencyDashboard = ({ agencyId }: Props) => {
  const { getRequestsForAgency, approveStage, rejectStage, requestDocs, addAgencyNote, getAgencyStages } = useJsc();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [docsInput, setDocsInput] = useState("");
  const [loading, setLoading] = useState(false);

  const agency = AGENCIES.find(a => a.id === agencyId);
  const agencyStages = getAgencyStages(agencyId);
  const requests = getRequestsForAgency(agencyId);
  const selected = requests.find(r => r.id === selectedId);

  const canAct = (r: JscRequest) => {
    if (agencyId === "admin") return false; // admin is view-only
    return agencyStages.includes(r.currentStage);
  };

  const handleAction = async (action: () => void) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    action();
    setLoading(false);
  };

  return (
    <div className="container py-8" dir="rtl">
      <h1 className="text-xl font-bold mb-1">{agency?.name || agencyId}</h1>
      <p className="text-sm text-gray-500 mb-6">
        الطلبات المعنية: {requests.length} | 
        المراحل: {agencyStages.map(s => stageLabel(s)).join("، ")}
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Request list */}
        <div>
          <h2 className="font-semibold mb-3 text-sm">قائمة الطلبات</h2>
          {requests.length === 0 ? (
            <p className="text-sm text-gray-400 p-4 border rounded">لا توجد طلبات حالياً</p>
          ) : (
            <div className="space-y-2">
              {requests.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full text-right p-3 border rounded text-sm ${selectedId === r.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div className="flex justify-between">
                    <span className="font-mono text-xs">{r.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${r.currentStage === "rejected" ? "bg-red-100 text-red-700" : r.currentStage === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {stageLabel(r.currentStage)}
                    </span>
                  </div>
                  <p className="font-medium mt-1">{r.companyName}</p>
                  <p className="text-xs text-gray-500">{r.applicantName}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Request details */}
        <div className="md:col-span-2">
          {selected ? (
            <div className="border rounded p-4 space-y-4">
              <h2 className="font-bold">تفاصيل الطلب - {selected.id}</h2>

              <table className="w-full text-sm">
                <tbody>
                  <tr><td className="text-gray-500 py-1 pl-4">اسم الشركة</td><td className="font-medium">{selected.companyName}</td></tr>
                  <tr><td className="text-gray-500 py-1 pl-4">مقدم الطلب</td><td>{selected.applicantName}</td></tr>
                  <tr><td className="text-gray-500 py-1 pl-4">الرقم القومي</td><td>{selected.applicantNationalId}</td></tr>
                  <tr><td className="text-gray-500 py-1 pl-4">الشكل القانوني</td><td>{selected.legalForm}</td></tr>
                  <tr><td className="text-gray-500 py-1 pl-4">رأس المال</td><td>{selected.capital.toLocaleString()} ج.م</td></tr>
                  <tr><td className="text-gray-500 py-1 pl-4">نوع الاستثمار</td><td>{selected.investmentType}</td></tr>
                  <tr><td className="text-gray-500 py-1 pl-4">نوع المخرجات</td><td>{selected.outputType === "digital" ? "رقمي" : "مطبوع"}</td></tr>
                  <tr><td className="text-gray-500 py-1 pl-4">المرحلة الحالية</td><td className="font-semibold">{stageLabel(selected.currentStage)}</td></tr>
                  {selected.nameReservationNo && <tr><td className="text-gray-500 py-1 pl-4">رقم حجز الاسم</td><td className="font-mono">{selected.nameReservationNo}</td></tr>}
                  {selected.bankCertNo && <tr><td className="text-gray-500 py-1 pl-4">رقم الشهادة البنكية</td><td className="font-mono">{selected.bankCertNo}</td></tr>}
                  {selected.clearingCode && <tr><td className="text-gray-500 py-1 pl-4">كود المقاصة</td><td className="font-mono">{selected.clearingCode}</td></tr>}
                  {selected.contractNo && <tr><td className="text-gray-500 py-1 pl-4">رقم العقد</td><td className="font-mono">{selected.contractNo}</td></tr>}
                  {selected.establishmentCertNo && <tr><td className="text-gray-500 py-1 pl-4">رقم شهادة التأسيس</td><td className="font-mono">{selected.establishmentCertNo}</td></tr>}
                  {selected.practiceCertNo && <tr><td className="text-gray-500 py-1 pl-4">رقم شهادة المزاولة</td><td className="font-mono">{selected.practiceCertNo}</td></tr>}
                  {selected.commercialRegNo && <tr><td className="text-gray-500 py-1 pl-4">رقم السجل التجاري</td><td className="font-mono">{selected.commercialRegNo}</td></tr>}
                  {selected.taxNo && <tr><td className="text-gray-500 py-1 pl-4">الرقم الضريبي</td><td className="font-mono">{selected.taxNo}</td></tr>}
                </tbody>
              </table>

              {/* Shareholders */}
              <div>
                <h3 className="font-semibold text-sm mb-2">المساهمون ({selected.shareholders.length})</h3>
                <table className="w-full text-xs border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-right">الاسم</th>
                      <th className="p-2 text-right">الرقم القومي</th>
                      <th className="p-2 text-right">الجنسية</th>
                      <th className="p-2 text-right">الأسهم</th>
                      <th className="p-2 text-right">الدور</th>
                      <th className="p-2 text-right">الأهلية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.shareholders.map(s => (
                      <tr key={s.id} className="border-t">
                        <td className="p-2">{s.name}</td>
                        <td className="p-2 font-mono">{s.nationalId}</td>
                        <td className="p-2">{s.nationality}</td>
                        <td className="p-2">{s.shareCount} × {s.shareValue} ج.م</td>
                        <td className="p-2">{s.role === "chairman" ? "رئيس مجلس" : s.role === "board_member" ? "عضو مجلس" : "مؤسس"}</td>
                        <td className="p-2">{s.eligible ? "✅" : "❌"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Documents requested */}
              {selected.requestedDocs && selected.requestedDocs.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <p className="font-semibold mb-1">مستندات مطلوبة:</p>
                  <ul>{selected.requestedDocs.map((d, i) => <li key={i}>• {d}</li>)}</ul>
                </div>
              )}

              {/* Rejection info */}
              {selected.currentStage === "rejected" && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                  <p className="font-semibold text-red-700">مرفوض من: {selected.rejectedBy}</p>
                  <p className="text-red-600">{selected.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              {canAct(selected) && selected.currentStage !== "rejected" && selected.currentStage !== "completed" && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-semibold text-sm">إجراءات</h3>
                  
                  <div className="flex gap-2">
                    <button
                      disabled={loading}
                      onClick={() => handleAction(() => approveStage(selected.id, agencyId, note || undefined))}
                      className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? "جاري..." : "✓ موافقة"}
                    </button>
                    <button
                      disabled={loading || !rejectReason.trim()}
                      onClick={() => handleAction(() => { rejectStage(selected.id, agencyId, rejectReason); setRejectReason(""); })}
                      className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      ✗ رفض
                    </button>
                    <button
                      disabled={loading || !docsInput.trim()}
                      onClick={() => handleAction(() => { requestDocs(selected.id, agencyId, docsInput.split("،").map(s => s.trim()).filter(Boolean)); setDocsInput(""); })}
                      className="px-4 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                    >
                      📎 طلب مستندات
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-500">سبب الرفض</label>
                      <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                        className="w-full border rounded px-3 py-1.5 text-sm" placeholder="أدخل سبب الرفض..." />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">مستندات مطلوبة (مفصولة بفاصلة)</label>
                      <input value={docsInput} onChange={e => setDocsInput(e.target.value)}
                        className="w-full border rounded px-3 py-1.5 text-sm" placeholder="مثال: شهادة بنكية، بطاقة ضريبية" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">ملاحظة</label>
                      <div className="flex gap-2">
                        <input value={note} onChange={e => setNote(e.target.value)}
                          className="flex-1 border rounded px-3 py-1.5 text-sm" placeholder="أضف ملاحظة..." />
                        <button
                          disabled={!note.trim()}
                          onClick={() => { addAgencyNote(selected.id, agencyId, note); setNote(""); }}
                          className="px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Logs */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-2">سجل العمليات ({selected.logs.length})</h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {[...selected.logs].reverse().map(log => (
                    <div key={log.id} className="text-xs p-2 bg-gray-50 rounded flex gap-3">
                      <span className="text-gray-400 shrink-0">{log.timestamp.toLocaleTimeString("ar-EG")}</span>
                      <span className="font-medium shrink-0">[{log.agency}]</span>
                      <span className="text-gray-500 shrink-0">{log.action}</span>
                      <span className="flex-1">{log.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded p-8 text-center text-gray-400">
              اختر طلباً من القائمة لعرض التفاصيل
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;
