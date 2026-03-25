import React, { createContext, useContext, useState, useCallback } from "react";

export type RequestStatus = "submitted" | "under_review" | "approved" | "payment_pending" | "issued" | "rejected";

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
}

interface AppContextType {
  requests: ServiceRequest[];
  currentRequest: ServiceRequest | null;
  submitRequest: (data: Omit<ServiceRequest, "id" | "status" | "createdAt" | "missingDocs" | "certificateNumber" | "notifications" | "paid">) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  requestDocuments: (id: string, docs: string[]) => void;
  payRequest: (id: string) => boolean;
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

  const submitRequest = useCallback((data: Omit<ServiceRequest, "id" | "status" | "createdAt" | "missingDocs" | "certificateNumber" | "notifications" | "paid">) => {
    const req: ServiceRequest = {
      ...data,
      id: `REQ-${Date.now().toString(36).toUpperCase()}`,
      status: "submitted",
      createdAt: new Date(),
      missingDocs: [],
      notifications: ["تم استلام طلبك بنجاح"],
      paid: false,
    };
    setRequests(prev => [...prev, req]);
    setCurrentRequest(req);
  }, []);

  const updateReq = (id: string, updater: (r: ServiceRequest) => ServiceRequest) => {
    setRequests(prev => {
      const updated = prev.map(r => r.id === id ? updater(r) : r);
      const found = updated.find(r => r.id === id);
      if (found) setCurrentRequest(found);
      return updated;
    });
  };

  const approveRequest = (id: string) => updateReq(id, r => ({
    ...r,
    status: "payment_pending" as RequestStatus,
    notifications: [...r.notifications, "تمت الموافقة على طلبك - يرجى سداد الرسوم"],
  }));

  const rejectRequest = (id: string) => updateReq(id, r => ({
    ...r,
    status: "rejected" as RequestStatus,
    notifications: [...r.notifications, "تم رفض الطلب"],
  }));

  const requestDocuments = (id: string, docs: string[]) => updateReq(id, r => ({
    ...r,
    status: "under_review" as RequestStatus,
    missingDocs: docs,
    notifications: [...r.notifications, `يرجى استكمال المستندات التالية: ${docs.join("، ")}`],
  }));

  const payRequest = (id: string) => {
    const success = Math.random() > 0.2;
    if (success) {
      updateReq(id, r => ({
        ...r,
        status: "issued" as RequestStatus,
        paid: true,
        certificateNumber: `CERT-${Date.now().toString(36).toUpperCase()}`,
        notifications: [...r.notifications, "تم السداد بنجاح", "تم إصدار الشهادة"],
      }));
    }
    return success;
  };

  return (
    <AppContext.Provider value={{ requests, currentRequest, submitRequest, approveRequest, rejectRequest, requestDocuments, payRequest, setCurrentRequest }}>
      {children}
    </AppContext.Provider>
  );
};
