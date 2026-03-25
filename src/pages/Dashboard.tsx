import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import StatusTimeline from "@/components/StatusTimeline";
import { FileText, AlertTriangle } from "lucide-react";

const statusLabels: Record<string, string> = {
  submitted: "تم التقديم",
  under_review: "قيد المراجعة",
  approved: "تمت الموافقة",
  payment_pending: "في انتظار السداد",
  issued: "تم الإصدار",
  rejected: "مرفوض",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  submitted: "secondary",
  under_review: "outline",
  approved: "default",
  payment_pending: "outline",
  issued: "default",
  rejected: "destructive",
};

const Dashboard = () => {
  const { requests, currentRequest, setCurrentRequest } = useApp();

  if (requests.length === 0) {
    return (
      <div className="container py-16 text-center">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">لا توجد طلبات</h2>
        <p className="text-muted-foreground mb-6">لم تقم بتقديم أي طلبات بعد</p>
        <Button asChild><Link to="/submit">تقديم طلب جديد</Link></Button>
      </div>
    );
  }

  const req = currentRequest ?? requests[requests.length - 1];

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">لوحة التحكم</h1>

      {/* Request list */}
      {requests.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {requests.map(r => (
            <button
              key={r.id}
              onClick={() => setCurrentRequest(r)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                req.id === r.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"
              }`}
            >
              {r.id}
            </button>
          ))}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg">الطلب {req.id}</CardTitle>
          <Badge variant={statusVariants[req.status]}>{statusLabels[req.status]}</Badge>
        </CardHeader>
        <CardContent>
          <StatusTimeline status={req.status} />
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div><span className="text-muted-foreground">الاسم:</span> {req.fullName}</div>
            <div><span className="text-muted-foreground">الرقم القومي:</span> {req.nationalId}</div>
            <div><span className="text-muted-foreground">نوع الجهة:</span> {req.entityType === "individual" ? "فردي" : "شركة"}</div>
            <div><span className="text-muted-foreground">رقم الخدمة:</span> {req.serviceId}</div>
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
        {req.status === "payment_pending" && (
          <Button asChild><Link to="/payment">الذهاب للسداد</Link></Button>
        )}
        {req.status === "issued" && (
          <Button asChild><Link to="/certificate">عرض الشهادة</Link></Button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
