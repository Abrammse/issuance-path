import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Award, QrCode } from "lucide-react";

const Certificate = () => {
  const { currentRequest } = useApp();

  if (!currentRequest || currentRequest.status !== "published") {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        لم يتم إصدار شهادة بعد
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">الشهادة</h1>
      <Card className="overflow-hidden">
        <div className="bg-primary text-primary-foreground p-6 text-center">
          <Award className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-xl font-bold">شهادة مزاولة مهنة</h2>
          <p className="text-primary-foreground/70 text-sm mt-1">جمهورية مصر العربية - الغرفة التجارية</p>
        </div>
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">رقم الشهادة</p>
              <p className="text-lg font-bold font-mono tracking-wider">{currentRequest.certificateNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">صادرة باسم</p>
              <p className="text-xl font-bold">{currentRequest.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">الرقم القومي</p>
              <p className="font-medium">{currentRequest.nationalId}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">تاريخ الإصدار</p>
              <p className="font-medium">{new Date().toLocaleDateString("ar-EG")}</p>
            </div>
            {currentRequest.needsRatification && (
              <div>
                <p className="text-muted-foreground text-sm">حالة التصديق</p>
                <p className="font-medium text-success">تم التصديق من مصلحة الشركات</p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <QrCode className="w-16 h-16 text-muted-foreground" />
            </div>
          </div>

          <Button className="w-full gap-2" size="lg" onClick={() => alert("سيتم تحميل ملف PDF - هذا عرض تجريبي")}>
            <Download className="w-4 h-4" />
            تحميل الشهادة (PDF)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Certificate;
