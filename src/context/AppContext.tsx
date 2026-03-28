import React, { createContext, useContext, useState, useCallback } from "react";

export type RequestStatus =
  | "selected"
  | "identity_check"
  | "eligibility_check"
  | "document_retrieval"
  | "compliance_review"
  | "pending_decision"
  | "approved"
  | "rejected"
  | "payment_pending"
  | "payment_check"
  | "ratification"
  | "published"
  ;

export type OutputType = "digital" | "printed_delivery" | "certified_delivery";

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
  outputType: OutputType;
  selectedCompany?: string;
}

// ── Establishment Request ──
export type EstablishmentStage =
  | "name_pending"       // waiting admin to approve name
  | "name_approved"
  | "name_rejected"
  | "contract_pending"   // waiting admin to approve contract
  | "contract_approved"
  | "contract_rejected"
  | "contract_docs_requested"
  | "completed"
  ;

export interface Notification {
  id: string;
  requestId: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface EstablishmentRequest {
  id: string;
  applicantName: string;
  applicantNationalId: string;
  companyName: string;
  legalForm: string;
  investmentType: string;
  activities: string[];
  capital: number;
  outputType: "digital" | "printed";
  stage: EstablishmentStage;
  createdAt: Date;
  requestedDocs: string[];
  founders: { name: string; nationalId: string; sharePercentage: number; role: string }[];
}

interface AppContextType {
  // Service requests (certificate flow)
  requests: ServiceRequest[];
  currentRequest: ServiceRequest | null;
  submitRequest: (data: Omit<ServiceRequest, "id" | "status" | "createdAt" | "missingDocs" | "certificateNumber" | "notifications" | "paid" | "needsRatification" | "selectedCompany">) => void;
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

  // Establishment requests
  establishmentRequests: EstablishmentRequest[];
  submitEstablishment: (data: Omit<EstablishmentRequest, "id" | "createdAt" | "stage" | "requestedDocs">) => EstablishmentRequest;
  updateEstablishmentStage: (id: string, stage: EstablishmentStage, docs?: string[]) => void;
  getEstablishment: (id: string) => EstablishmentRequest | undefined;

  // Notifications
  notifications: Notification[];
  addNotification: (requestId: string, message: string) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
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
  const [establishmentRequests, setEstablishmentRequests] = useState<EstablishmentRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((requestId: string, message: string) => {
    setNotifications(prev => [...prev, {
      id: `N-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      requestId,
      message,
      timestamp: new Date(),
      read: false,
    }]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const updateReq = (id: string, updater: (r: ServiceRequest) => ServiceRequest) => {
    setRequests(prev => {
      const updated = prev.map(r => r.id === id ? updater(r) : r);
      const found = updated.find(r => r.id === id);
      if (found) setCurrentRequest(found);
      return updated;
    });
  };

  const submitRequest = useCallback((data: Omit<ServiceRequest, "id" | "status" | "createdAt" | "missingDocs" | "certificateNumber" | "notifications" | "paid" | "needsRatification" | "selectedCompany">) => {
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
    addNotification(req.id, "تم اختيار الخدمة بنجاح");
  }, [addNotification]);

  const advanceToIdentity = (id: string) => {
    updateReq(id, r => ({ ...r, status: "identity_check", notifications: [...r.notifications, "جاري التحقق من الهوية عبر منصة مصر الرقمية"] }));
    addNotification(id, "جاري التحقق من الهوية عبر منصة مصر الرقمية");
  };
  const advanceToEligibility = (id: string) => {
    updateReq(id, r => ({ ...r, status: "eligibility_check", notifications: [...r.notifications, "تم التحقق من الهوية - جاري فحص الأهلية"] }));
    addNotification(id, "تم التحقق من الهوية - جاري فحص الأهلية");
  };
  const advanceToRetrieval = (id: string) => {
    updateReq(id, r => ({ ...r, status: "document_retrieval", notifications: [...r.notifications, "تم التحقق من الأهلية - جاري استرجاع المستندات"] }));
    addNotification(id, "تم التحقق من الأهلية - جاري استرجاع المستندات");
  };
  const advanceToCompliance = (id: string) => {
    updateReq(id, r => ({ ...r, status: "compliance_review", notifications: [...r.notifications, "تم استرجاع المستندات - جاري مراجعة الامتثال"] }));
    addNotification(id, "تم استرجاع المستندات - جاري مراجعة الامتثال");
  };
  const advanceToPendingDecision = (id: string) => {
    updateReq(id, r => ({ ...r, status: "pending_decision", notifications: [...r.notifications, "المستندات مكتملة - في انتظار القرار"] }));
    addNotification(id, "المستندات مكتملة - في انتظار القرار");
  };
  const approveRequest = (id: string) => {
    updateReq(id, r => ({ ...r, status: "payment_pending", notifications: [...r.notifications, "تمت الموافقة على الطلب - يرجى سداد الرسوم"] }));
    addNotification(id, "تمت الموافقة على الطلب - يرجى سداد الرسوم");
  };
  const rejectRequest = (id: string) => {
    updateReq(id, r => ({ ...r, status: "rejected", notifications: [...r.notifications, "تم رفض الطلب"] }));
    addNotification(id, "تم رفض الطلب");
  };
  const requestDocuments = (id: string, docs: string[]) => {
    const msg = `يرجى استكمال المستندات التالية: ${docs.join("، ")}`;
    updateReq(id, r => ({ ...r, status: "compliance_review", missingDocs: docs, notifications: [...r.notifications, msg] }));
    addNotification(id, msg);
  };
  const payRequest = (id: string) => {
    const success = Math.random() > 0.2;
    if (success) {
      updateReq(id, r => ({ ...r, status: "payment_check", paid: true, notifications: [...r.notifications, "تم السداد بنجاح - جاري التحقق من السداد"] }));
      addNotification(id, "تم السداد بنجاح - جاري التحقق من السداد");
    }
    return success;
  };
  const advanceToRatification = (id: string) => {
    updateReq(id, r => ({ ...r, status: "ratification", needsRatification: true, notifications: [...r.notifications, "جاري التصديق من مصلحة الشركات"] }));
    addNotification(id, "جاري التصديق من مصلحة الشركات");
  };
  const publishRequest = (id: string) => {
    updateReq(id, r => ({ ...r, status: "published", certificateNumber: `CERT-${Date.now().toString(36).toUpperCase()}`, notifications: [...r.notifications, "تم إصدار الشهادة ونشرها بنجاح"] }));
    addNotification(id, "تم إصدار الشهادة ونشرها بنجاح");
  };

  // ── Establishment ──
  const submitEstablishment = useCallback((data: Omit<EstablishmentRequest, "id" | "createdAt" | "stage" | "requestedDocs">) => {
    const req: EstablishmentRequest = {
      ...data,
      id: `EST-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date(),
      stage: "name_pending",
      requestedDocs: [],
    };
    setEstablishmentRequests(prev => [...prev, req]);
    addNotification(req.id, `تم تقديم طلب تأسيس شركة "${data.companyName}" — في انتظار موافقة الجهة على الاسم التجاري`);
    return req;
  }, [addNotification]);

  const updateEstablishmentStage = useCallback((id: string, stage: EstablishmentStage, docs?: string[]) => {
    setEstablishmentRequests(prev => prev.map(r => r.id === id ? { ...r, stage, requestedDocs: docs ?? r.requestedDocs } : r));

    const stageMessages: Record<EstablishmentStage, string> = {
      name_pending: "في انتظار موافقة الجهة على الاسم التجاري",
      name_approved: "تمت الموافقة على الاسم التجاري — محجوز مؤقتاً 48 ساعة",
      name_rejected: "تم رفض الاسم التجاري — يرجى اختيار اسم آخر",
      contract_pending: "تم إرسال العقد للمراجعة — في انتظار قرار الجهة",
      contract_approved: "تمت الموافقة على العقد — يمكنك التوقيع الإلكتروني",
      contract_rejected: "تم رفض العقد — يرجى التعديل وإعادة الإرسال",
      contract_docs_requested: `مطلوب مستندات إضافية: ${(docs ?? []).join("، ")}`,
      completed: "تم تأسيس الشركة بنجاح — تم إصدار شهادة التأسيس",
    };
    addNotification(id, stageMessages[stage]);
  }, [addNotification]);

  const getEstablishment = useCallback((id: string) => {
    return establishmentRequests.find(r => r.id === id);
  }, [establishmentRequests]);

  return (
    <AppContext.Provider value={{
      requests, currentRequest, submitRequest,
      advanceToIdentity, advanceToEligibility, advanceToRetrieval,
      advanceToCompliance, advanceToPendingDecision,
      approveRequest, rejectRequest, requestDocuments,
      payRequest, advanceToRatification, publishRequest,
      setCurrentRequest,
      establishmentRequests, submitEstablishment, updateEstablishmentStage, getEstablishment,
      notifications, addNotification, markNotificationRead, unreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
};
