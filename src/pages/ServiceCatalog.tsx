import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sprout, Building, Settings, FileText, BookOpen, Users, ClipboardList, Award, Scale, Briefcase, FileCheck } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  available: boolean;
}

interface Track {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ElementType;
  color: string;
  services: Service[];
}

const tracks: Track[] = [
  {
    id: "pre-establishment",
    title: "ما قبل التأسيس",
    titleEn: "Pre-Establishment",
    description: "خدمات الاستعلام والتجهيز قبل تأسيس الكيان الاقتصادي",
    icon: Sprout,
    color: "bg-amber-500/10 text-amber-600",
    services: [
      { id: "PRE-001", title: "الاستعلام عن الاسم التجاري", description: "التحقق من توفر الاسم التجاري المطلوب", icon: BookOpen, available: false },
      { id: "PRE-002", title: "حجز الاسم التجاري", description: "حجز اسم تجاري لمدة محددة قبل التأسيس", icon: ClipboardList, available: false },
      { id: "PRE-003", title: "الاستعلام عن المتطلبات", description: "معرفة المستندات والشروط المطلوبة للتأسيس", icon: FileText, available: false },
    ],
  },
  {
    id: "establishment",
    title: "التأسيس",
    titleEn: "Establishment",
    description: "خدمات تأسيس الشركات والكيانات الاقتصادية",
    icon: Building,
    color: "bg-primary/10 text-primary",
    services: [
      { id: "EST-001", title: "تأسيس شركة ذات مسؤولية محدودة", description: "إجراءات تأسيس شركة ذ.م.م", icon: Building, available: false },
      { id: "EST-002", title: "تأسيس مؤسسة فردية", description: "تسجيل مؤسسة فردية جديدة", icon: Users, available: false },
      { id: "EST-003", title: "تأسيس شركة مساهمة", description: "إجراءات تأسيس شركة مساهمة", icon: Scale, available: false },
    ],
  },
  {
    id: "post-establishment",
    title: "ما بعد التأسيس",
    titleEn: "Post-Establishment",
    description: "خدمات التشغيل والتراخيص بعد التأسيس",
    icon: Settings,
    color: "bg-emerald-500/10 text-emerald-600",
    services: [
      { id: "0001", title: "طلب استخراج شهادة مزاولة مهنة", description: "تقديم طلب للحصول على شهادة مزاولة مهنة من الغرفة التجارية", icon: Award, available: true },
      { id: "POST-002", title: "تجديد السجل التجاري", description: "تجديد السجل التجاري للشركات والمؤسسات", icon: FileCheck, available: false },
      { id: "POST-003", title: "تعديل بيانات المنشأة", description: "تعديل أو تحديث بيانات المنشأة في السجلات", icon: Briefcase, available: false },
    ],
  },
];

const ServiceCatalog = () => (
  <div className="min-h-[calc(100vh-4rem)]">
    <section className="bg-primary text-primary-foreground py-12">
      <div className="container text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">كتالوج الخدمات</h1>
        <p className="text-primary-foreground/80 text-sm max-w-xl mx-auto">
          اختر المسار المناسب لاحتياجاتك — من ما قبل التأسيس وحتى ما بعد التشغيل
        </p>
      </div>
    </section>

    <section className="container py-10 space-y-12">
      {tracks.map(track => {
        const TrackIcon = track.icon;
        return (
          <div key={track.id}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${track.color}`}>
                <TrackIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{track.title}</h2>
                <p className="text-xs text-muted-foreground">{track.titleEn} — {track.description}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {track.services.map(s => {
                const Icon = s.icon;
                return (
                  <Card key={s.id} className={`transition-shadow hover:shadow-md ${!s.available ? "opacity-60" : ""}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${track.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {s.available ? (
                          <Badge className="text-[10px]">متاحة</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">قريباً</Badge>
                        )}
                      </div>
                      <CardTitle className="text-sm mt-3">{s.title}</CardTitle>
                      <CardDescription className="text-xs">{s.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-[10px] text-muted-foreground mb-3">رقم الخدمة: {s.id}</p>
                      {s.available ? (
                        <Button asChild size="sm" className="w-full gap-2">
                          <Link to="/submit">
                            ابدأ الطلب
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled size="sm" className="w-full">قريباً</Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  </div>
);

export default ServiceCatalog;
