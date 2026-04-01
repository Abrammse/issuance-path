import React, { createContext, useContext, useState, useCallback } from "react";
import { useApp } from "./AppContext";

// ── Workflow stages ──
export type JscStage =
  | "investment_pending" | "name_pending" | "bank_pending" | "clearing_pending"
  | "contract_pending" | "client_review" | "payment_pending"
  | "lawyers_pending" | "notary_pending" | "tax_review_pending" | "fra_pending"
  | "cert_pending" | "chamber_pending" | "reg_pending" | "tax_number_pending"
  | "completed" | "rejected";

export interface JscShareholder {
  id: string;
  name: string;
  nationalId: string;
  nationality: string;
  shareCount: number;
  shareValue: number;
  role: "founder" | "board_member" | "chairman";
  eligible: boolean;
}

export interface JscLog {
  id: string;
  agency: string;
  action: string;
  note: string;
  timestamp: Date;
}

export interface JscRequest {
  id: string;
  companyName: string;
  legalForm: string;
  investmentType: string;
  activities: string[];
  capital: number;
  outputType: "digital" | "printed";
  applicantName: string;
  applicantNationalId: string;
  shareholders: JscShareholder[];
  accountant: { name: string; regNumber: string };
  lawyer: { name: string; regNumber: string };
  createdAt: Date;
  currentStage: JscStage;
  rejectedBy?: string;
  rejectionReason?: string;
  requestedDocs?: string[];
  // Generated outputs
  nameReservationNo?: string;
  bankCertNo?: string;
  clearingCode?: string;
  contractNo?: string;
  establishmentCertNo?: string;
  practiceCertNo?: string;
  commercialRegNo?: string;
  taxNo?: string;
  logs: JscLog[];
}

// ── Workflow definition ──
export interface WorkflowStep {
  stage: JscStage;
  agency: string;
  agencyId: string;
  label: string;
}

export const WORKFLOW: WorkflowStep[] = [
  { stage: "investment_pending", agency: "هيئة الاستثمار", agencyId: "investment", label: "مراجعة هيئة الاستثمار" },
  { stage: "name_pending", agency: "السجل التجاري", agencyId: "commercial_registry", label: "حجز الاسم التجاري" },
  { stage: "bank_pending", agency: "البنك", agencyId: "bank", label: "إصدار الشهادة البنكية" },
  { stage: "clearing_pending", agency: "مصر للمقاصة", agencyId: "clearing", label: "تكويد المساهمين" },
  { stage: "contract_pending", agency: "هيئة الاستثمار", agencyId: "investment", label: "إنشاء ومراجعة العقد" },
  { stage: "client_review", agency: "العميل", agencyId: "client", label: "مراجعة العميل للعقد" },
  { stage: "payment_pending", agency: "العميل", agencyId: "client", label: "سداد الرسوم" },
  { stage: "lawyers_pending", agency: "نقابة المحامين", agencyId: "lawyers", label: "نقابة المحامين" },
  { stage: "notary_pending", agency: "الشهر العقاري", agencyId: "notary", label: "الشهر العقاري" },
  { stage: "tax_review_pending", agency: "مصلحة الضرائب", agencyId: "tax", label: "مراجعة مصلحة الضرائب" },
  { stage: "fra_pending", agency: "الهيئة العامة للرقابة المالية", agencyId: "fra", label: "الرقابة المالية" },
  { stage: "cert_pending", agency: "هيئة الاستثمار", agencyId: "investment", label: "إصدار شهادة التأسيس" },
  { stage: "chamber_pending", agency: "الغرفة التجارية", agencyId: "chamber", label: "شهادة مزاولة" },
  { stage: "reg_pending", agency: "السجل التجاري", agencyId: "commercial_registry", label: "رقم السجل التجاري" },
  { stage: "tax_number_pending", agency: "مصلحة الضرائب", agencyId: "tax", label: "إصدار الرقم الضريبي" },
  { stage: "completed", agency: "النظام", agencyId: "system", label: "تم التأسيس بنجاح" },
];

export const AGENCIES = [
  { id: "investment", name: "هيئة الاستثمار" },
  { id: "commercial_registry", name: "السجل التجاري" },
  { id: "bank", name: "البنك" },
  { id: "clearing", name: "مصر للمقاصة" },
  { id: "lawyers", name: "نقابة المحامين" },
  { id: "notary", name: "الشهر العقاري" },
  { id: "tax", name: "مصلحة الضرائب" },
  { id: "fra", name: "الهيئة العامة للرقابة المالية" },
  { id: "chamber", name: "الغرفة التجارية" },
  { id: "admin", name: "لوحة تحكم داخلية" },
];

function getAgencyStages(agencyId: string): JscStage[] {
  if (agencyId === "admin") return WORKFLOW.filter(w => w.stage !== "completed").map(w => w.stage);
  return WORKFLOW.filter(w => w.agencyId === agencyId).map(w => w.stage);
}

function getNextStage(current: JscStage): JscStage {
  const idx = WORKFLOW.findIndex(w => w.stage === current);
  if (idx >= 0 && idx < WORKFLOW.length - 1) return WORKFLOW[idx + 1].stage;
  return "completed";
}

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

interface JscContextType {
  jscRequests: JscRequest[];
  submitJscRequest: (data: Omit<JscRequest, "id" | "createdAt" | "currentStage" | "logs">) => JscRequest;
  approveStage: (requestId: string, agencyId: string, note?: string) => void;
  rejectStage: (requestId: string, agencyId: string, reason: string) => void;
  requestDocs: (requestId: string, agencyId: string, docs: string[]) => void;
  addAgencyNote: (requestId: string, agencyId: string, note: string) => void;
  clientApproveContract: (requestId: string) => void;
  clientPay: (requestId: string) => void;
  getRequestsForAgency: (agencyId: string) => JscRequest[];
  getAgencyStages: typeof getAgencyStages;
}

const JscContext = createContext<JscContextType | null>(null);

export const useJsc = () => {
  const ctx = useContext(JscContext);
  if (!ctx) throw new Error("useJsc must be inside JscProvider");
  return ctx;
};

export const JscProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jscRequests, setJscRequests] = useState<JscRequest[]>([]);
  const { addNotification } = useApp();

  const update = useCallback((id: string, updater: (r: JscRequest) => JscRequest) => {
    setJscRequests(prev => prev.map(r => r.id === id ? updater(r) : r));
  }, []);

  const addLog = (req: JscRequest, agency: string, action: string, note: string): JscLog[] => [
    ...req.logs,
    { id: genId("LOG"), agency, action, note, timestamp: new Date() },
  ];

  const submitJscRequest = useCallback((data: Omit<JscRequest, "id" | "createdAt" | "currentStage" | "logs">) => {
    const req: JscRequest = {
      ...data,
      id: genId("JSC"),
      createdAt: new Date(),
      currentStage: "investment_pending",
      logs: [{ id: genId("LOG"), agency: "النظام", action: "إنشاء", note: "تم تقديم طلب التأسيس", timestamp: new Date() }],
    };
    setJscRequests(prev => [...prev, req]);
    addNotification(req.id, `تم تقديم طلب تأسيس "${data.companyName}" — في انتظار مراجعة هيئة الاستثمار`);
    return req;
  }, [addNotification]);

  const approveStage = useCallback((requestId: string, agencyId: string, note?: string) => {
    update(requestId, r => {
      const agencyName = AGENCIES.find(a => a.id === agencyId)?.name || agencyId;
      const nextStage = getNextStage(r.currentStage);
      const stepLabel = WORKFLOW.find(w => w.stage === r.currentStage)?.label || "";
      const updated: JscRequest = {
        ...r,
        currentStage: nextStage,
        rejectedBy: undefined,
        rejectionReason: undefined,
        requestedDocs: undefined,
        logs: addLog(r, agencyName, "موافقة", note || `تمت الموافقة على: ${stepLabel}`),
      };
      // Generate outputs based on stage
      if (r.currentStage === "name_pending") updated.nameReservationNo = genId("NR");
      if (r.currentStage === "bank_pending") updated.bankCertNo = genId("BC");
      if (r.currentStage === "clearing_pending") updated.clearingCode = genId("CC");
      if (r.currentStage === "contract_pending") updated.contractNo = genId("CTR");
      if (r.currentStage === "cert_pending") updated.establishmentCertNo = genId("EC");
      if (r.currentStage === "chamber_pending") updated.practiceCertNo = genId("PC");
      if (r.currentStage === "reg_pending") updated.commercialRegNo = genId("CR");
      if (r.currentStage === "tax_number_pending") updated.taxNo = genId("TX");
      return updated;
    });
    const stepLabel = WORKFLOW.find(w => {
      const req = jscRequests.find(r => r.id === requestId);
      return req && w.stage === req.currentStage;
    })?.label || "";
    addNotification(requestId, `تمت الموافقة على: ${stepLabel}`);
  }, [update, addNotification, jscRequests]);

  const rejectStage = useCallback((requestId: string, agencyId: string, reason: string) => {
    const agencyName = AGENCIES.find(a => a.id === agencyId)?.name || agencyId;
    update(requestId, r => ({
      ...r,
      currentStage: "rejected" as JscStage,
      rejectedBy: agencyName,
      rejectionReason: reason,
      logs: addLog(r, agencyName, "رفض", reason),
    }));
    addNotification(requestId, `تم رفض الطلب من ${agencyName}: ${reason}`);
  }, [update, addNotification]);

  const requestDocs = useCallback((requestId: string, agencyId: string, docs: string[]) => {
    const agencyName = AGENCIES.find(a => a.id === agencyId)?.name || agencyId;
    update(requestId, r => ({
      ...r,
      requestedDocs: docs,
      logs: addLog(r, agencyName, "طلب مستندات", `مطلوب: ${docs.join("، ")}`),
    }));
    addNotification(requestId, `${agencyName} يطلب مستندات: ${docs.join("، ")}`);
  }, [update, addNotification]);

  const addAgencyNote = useCallback((requestId: string, agencyId: string, note: string) => {
    const agencyName = AGENCIES.find(a => a.id === agencyId)?.name || agencyId;
    update(requestId, r => ({
      ...r,
      logs: addLog(r, agencyName, "ملاحظة", note),
    }));
  }, [update]);

  const clientApproveContract = useCallback((requestId: string) => {
    update(requestId, r => ({
      ...r,
      currentStage: "payment_pending" as JscStage,
      logs: addLog(r, "العميل", "موافقة على العقد", "وافق العميل على العقد"),
    }));
    addNotification(requestId, "تمت الموافقة على العقد — يرجى سداد الرسوم");
  }, [update, addNotification]);

  const clientPay = useCallback((requestId: string) => {
    update(requestId, r => ({
      ...r,
      currentStage: "lawyers_pending" as JscStage,
      logs: addLog(r, "العميل", "سداد", "تم سداد الرسوم بنجاح"),
    }));
    addNotification(requestId, "تم السداد — جاري المعالجة في نقابة المحامين");
  }, [update, addNotification]);

  const getRequestsForAgency = useCallback((agencyId: string): JscRequest[] => {
    const stages = getAgencyStages(agencyId);
    return jscRequests.filter(r => stages.includes(r.currentStage) || (agencyId === "admin"));
  }, [jscRequests]);

  return (
    <JscContext.Provider value={{
      jscRequests, submitJscRequest, approveStage, rejectStage,
      requestDocs, addAgencyNote, clientApproveContract, clientPay,
      getRequestsForAgency, getAgencyStages,
    }}>
      {children}
    </JscContext.Provider>
  );
};
