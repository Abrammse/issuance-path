import React, { createContext, useContext, useState, useCallback } from "react";

export type RequestStatus =
  | "selected"           // اختيار الخدمة
  | "identity_check"     // التحقق من الهوية
  | "eligibility_check"  // التحقق من الأهلية
  | "document_retrieval" // استرجاع المستندات
  | "compliance_review"  // مراجعة المستندات
  | "pending_decision"   // في انتظار القرار
  | "approved"           // تمت الموافقة
  | "rejected"           // مرفوض
  | "payment_pending"    // في انتظار السداد
  | "payment_check"      // التحقق من السداد
  | "ratification"       // التصديق
  | "published"          // تم الإصدار / النشر
  ;

export interface UploadedDoc {
  name: string;
  file: File | null;
}

export interface ServiceRequest {
  id: string;
  fullName: string;
  nationalId: string;
  entityType: "company" | "individual";
  serviceId: string;
  documents: Record<string, UploadedDoc>;
  status: RequestStatus;
  createdAt: Date;
  missingDocs: string[];
  certificateNumber?: string;
  notifications: string[];
  paid: boolean;
  needsRatification: boolean;
}

interface AppContextType {
  requests: ServiceRequest[];
  currentRequest: ServiceRequest | null;
  submitRequest: (data: Omit<ServiceRequest, "id" | "status" | "createdAt" | "missingDocs" | "certificateNumber" | "notifications" | "paid" | "needsRatification">) => void;
  advanceToIdentity: (id: string) => void;
  advanceToEligibility: (id: string) => void;
  advanceToRetrieval: (id: string) => void;
  advanceToCompliance: (id: string) => void;
  advanceToPendingDecision: (id: string) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  requestDocuments: (id: string, docs: string[]) => void;
  payRequest: (id: string) => boolean;
  advanceToRatification: (id: string) => void;
  publishRequest: (id: string) => void;
  setCurrentRequest: (r: ServiceRequest | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ServiceRequest | null>(null);

  const updateReq = (id: string, updater: (r: ServiceRequest) => ServiceRequest) => {
    setRequests(prev => {
      const updated = prev.map(r => r.id === id ? updater(r) : r);
      const found = updated.find(r => r.id === id);
      if (found) setCurrentRequest(found);
      return updated;
    });
  };

  const submitRequest = useCallback((data: Omit<ServiceRequest, "id" | "status" | "createdAt" | "missingDocs" | "certificateNumber" | "notifications" | "paid" | "needsRatification">) => {
    const req: ServiceRequest = {
      ...data,
      id: `REQ-${Date.now().toString(36).toUpperCase()}`,
      status: "selected",
      createdAt: new Date(),
      missingDocs: [],
      notifications: ["تم اختيار الخدمة بنجاح"],
      paid: false,
      needsRatification: false,
    };
    setRequests(prev => [...prev, req]);
    setCurrentRequest(req);
  }, []);

  const advanceToIdentity = (id: string) => updateReq(id, r => ({
    ...r,
    status: "identity_check",
    notifications: [...r.notifications, "جاري التحقق من الهوية عبر منصة مصر الرقمية"],
  }));

  const advanceToEligibility = (id: string) => updateReq(id, r => ({
    ...r,
    status: "eligibility_check",
    notifications: [...r.notifications, "تم التحقق من الهوية - جاري فحص الأهلية"],
  }));

  const advanceToRetrieval = (id: string) => updateReq(id, r => ({
    ...r,
    status: "document_retrieval",
    notifications: [...r.notifications, "تم التحقق من الأهلية - جاري استرجاع المستندات"],
  }));

  const advanceToCompliance = (id: string) => updateReq(id, r => ({
    ...r,
    status: "compliance_review",
    notifications: [...r.notifications, "تم استرجاع المستندات - جاري مراجعة الامتثال"],
  }));

  const advanceToPendingDecision = (id: string) => updateReq(id, r => ({
    ...r,
    status: "pending_decision",
    notifications: [...r.notifications, "المستندات مكتملة - في انتظار القرار"],
  }));

  const approveRequest = (id: string) => updateReq(id, r => ({
    ...r,
    status: "payment_pending",
    notifications: [...r.notifications, "تمت الموافقة على الطلب - يرجى سداد الرسوم"],
  }));

  const rejectRequest = (id: string) => updateReq(id, r => ({
    ...r,
    status: "rejected",
    notifications: [...r.notifications, "تم رفض الطلب"],
  }));

  const requestDocuments = (id: string, docs: string[]) => updateReq(id, r => ({
    ...r,
    status: "compliance_review",
    missingDocs: docs,
    notifications: [...r.notifications, `يرجى استكمال المستندات التالية: ${docs.join("، ")}`],
  }));

  const payRequest = (id: string) => {
    const success = Math.random() > 0.2;
    if (success) {
      updateReq(id, r => ({
        ...r,
        status: "payment_check",
        paid: true,
        notifications: [...r.notifications, "تم السداد بنجاح - جاري التحقق من السداد"],
      }));
    }
    return success;
  };

  const advanceToRatification = (id: string) => updateReq(id, r => ({
    ...r,
    status: "ratification",
    needsRatification: true,
    notifications: [...r.notifications, "جاري التصديق من مصلحة الشركات"],
  }));

  const publishRequest = (id: string) => updateReq(id, r => ({
    ...r,
    status: "published",
    certificateNumber: `CERT-${Date.now().toString(36).toUpperCase()}`,
    notifications: [...r.notifications, "تم إصدار الشهادة ونشرها بنجاح"],
  }));

  return (
    <AppContext.Provider value={{
      requests, currentRequest, submitRequest,
      advanceToIdentity, advanceToEligibility, advanceToRetrieval,
      advanceToCompliance, advanceToPendingDecision,
      approveRequest, rejectRequest, requestDocuments,
      payRequest, advanceToRatification, publishRequest,
      setCurrentRequest
    }}>
      {children}
    </AppContext.Provider>
  );
};
