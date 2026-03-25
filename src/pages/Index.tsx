import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Users, ArrowLeft } from "lucide-react";

const services = [
  {
    id: "0001",
    title: "طلب استخراج شهادة مزاولة مهنة",
    description: "تقديم طلب للحصول على شهادة مزاولة مهنة من الغرفة التجارية",
    icon: FileText,
    available: true,
  },
  {
    id: "0002",
    title: "تجديد السجل التجاري",
    description: "تجديد السجل التجاري للشركات والمؤسسات الفردية",
    icon: Building2,
    available: false,
  },
  {
    id: "0003",
    title: "تعديل بيانات المنشأة",
    description: "تعديل أو تحديث بيانات المنشأة في السجلات الرسمية",
    icon: Users,
    available: false,
  },
];

const Index = () => (
  <div className="min-h-[calc(100vh-4rem)]">
    {/* Hero */}
    <section className="bg-primary text-primary-foreground py-16">
      <div className="container text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">بوابة الخدمات الحكومية الإلكترونية</h1>
        <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
          منصة متكاملة لتقديم الخدمات الحكومية إلكترونياً بسهولة وسرعة
        </p>
      </div>
    </section>

    {/* Services */}
    <section className="container py-12">
      <h2 className="text-2xl font-bold mb-8">الخدمات المتاحة</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {services.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.id} className={`transition-shadow hover:shadow-md ${!s.available ? "opacity-60" : ""}`}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {s.available ? (
                  <Button asChild className="w-full gap-2">
                    <Link to="/submit">
                      ابدأ الطلب
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full">قريباً</Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  </div>
);

export default Index;
