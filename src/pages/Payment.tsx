import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, CheckCircle2, XCircle, Search } from "lucide-react";

const Payment = () => {
  const navigate = useNavigate();
  const { currentRequest, payRequest } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "failure" | null>(null);

  if (!currentRequest || currentRequest.status !== "payment_pending") {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        لا يوجد طلب في انتظار السداد
      </div>
    );
  }

  const handlePay = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    const success = payRequest(currentRequest.id);
    setResult(success ? "success" : "failure");
    setLoading(false);
    if (success) {
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  };

  return (
    <div className="container py-10 max-w-lg">
      <h1 className="text-2xl font-bold mb-8">سداد الرسوم</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            تفاصيل الدفع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center p-4 rounded-lg bg-secondary">
            <span className="text-muted-foreground">رسوم الخدمة</span>
            <span className="text-2xl font-bold">١٢٠٠ ج.م</span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>الطلب: {currentRequest.id}</div>
            <div>الخدمة: طلب استخراج شهادة مزاولة مهنة</div>
          </div>

          {result === "success" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 text-success">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-medium">تم السداد بنجاح!</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 text-primary">
                <Search className="w-6 h-6" />
                <span className="font-medium text-sm">جاري التحقق من السداد... سيتم التحويل للوحة التحكم</span>
              </div>
            </div>
          ) : result === "failure" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
                <XCircle className="w-6 h-6" />
                <span className="font-medium">فشل السداد. يرجى المحاولة مرة أخرى.</span>
              </div>
              <Button onClick={() => { setResult(null); handlePay(); }} className="w-full">إعادة المحاولة</Button>
            </div>
          ) : (
            <Button onClick={handlePay} disabled={loading} size="lg" className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري المعالجة...</> : "ادفع الآن"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;
