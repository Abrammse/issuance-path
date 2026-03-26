import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Landmark, ArrowLeft, TrendingUp, Shield, Zap } from "lucide-react";

const Index = () => (
  <div className="min-h-[calc(100vh-4rem)]">
    {/* Hero */}
    <section className="bg-primary text-primary-foreground py-20">
      <div className="container text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-6">
          <Landmark className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">منصة الكيانات الاقتصادية</h1>
        <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
          بوابة المستثمرين للخدمات الإلكترونية — من التأسيس إلى التشغيل
        </p>
        <Button asChild size="lg" variant="secondary" className="gap-2">
          <Link to="/services">
            تصفّح كتالوج الخدمات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </section>

    {/* Features */}
    <section className="container py-16">
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: Zap, title: "خدمات رقمية متكاملة", desc: "إنجاز المعاملات إلكترونياً من أي مكان" },
          { icon: Shield, title: "أمان وموثوقية", desc: "تحقق من الهوية والمستندات عبر بوابة مصر الرقمية" },
          { icon: TrendingUp, title: "دعم المستثمرين", desc: "خدمات ما قبل التأسيس والتأسيس وما بعد التأسيس" },
        ].map(f => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  </div>
);

export default Index;
