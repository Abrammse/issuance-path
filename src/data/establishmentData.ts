// Mock data for the Company Establishment service

export interface InvestmentType {
  id: string;
  label: string;
  description: string;
}

export const investmentTypes: InvestmentType[] = [
  { id: "domestic", label: "استثمار داخلي", description: "تأسيس شركة داخل الحدود المصرية" },
  { id: "free_zone", label: "مناطق حرة", description: "تأسيس في المناطق الحرة العامة أو الخاصة" },
  { id: "investment_zone", label: "مناطق استثمارية", description: "تأسيس في المناطق الاستثمارية المعتمدة" },
  { id: "tech_zone", label: "مناطق تكنولوجية", description: "تأسيس في المناطق التكنولوجية (مثل القرية الذكية)" },
  { id: "economic_zone", label: "مناطق اقتصادية", description: "تأسيس في المناطق الاقتصادية ذات الطبيعة الخاصة" },
  { id: "sinai", label: "شبه جزيرة سيناء", description: "تأسيس في مناطق التنمية بسيناء (حوافز خاصة)" },
];

// EISIC-like hierarchical activity classification
export interface ActivityLevel {
  id: string;
  label: string;
  children?: ActivityLevel[];
}

export const eisicActivities: ActivityLevel[] = [
  {
    id: "A", label: "الزراعة والثروة الحيوانية",
    children: [
      { id: "A01", label: "زراعة المحاصيل", children: [
        { id: "A011", label: "زراعة الحبوب", children: [
          { id: "A0111", label: "زراعة القمح والشعير" },
          { id: "A0112", label: "زراعة الأرز" },
        ]},
        { id: "A012", label: "زراعة الخضروات والفاكهة", children: [
          { id: "A0121", label: "زراعة الخضروات الورقية" },
          { id: "A0122", label: "زراعة الفاكهة" },
        ]},
      ]},
    ],
  },
  {
    id: "C", label: "الصناعة التحويلية",
    children: [
      { id: "C10", label: "صناعة المواد الغذائية", children: [
        { id: "C101", label: "تجهيز وحفظ اللحوم", children: [
          { id: "C1010", label: "ذبح وتجهيز اللحوم" },
        ]},
        { id: "C107", label: "صناعة المخبوزات", children: [
          { id: "C1071", label: "صناعة الخبز والمعجنات" },
          { id: "C1072", label: "صناعة الحلويات" },
        ]},
      ]},
      { id: "C20", label: "صناعة المواد الكيميائية", children: [
        { id: "C201", label: "صناعة المستحضرات الصيدلانية", children: [
          { id: "C2010", label: "تصنيع الأدوية" },
        ]},
      ]},
    ],
  },
  {
    id: "G", label: "تجارة الجملة والتجزئة",
    children: [
      { id: "G46", label: "تجارة الجملة", children: [
        { id: "G461", label: "تجارة جملة المواد الغذائية", children: [
          { id: "G4611", label: "تجارة جملة الحبوب والبقوليات" },
          { id: "G4612", label: "تجارة جملة اللحوم والأسماك" },
        ]},
      ]},
      { id: "G47", label: "تجارة التجزئة", children: [
        { id: "G471", label: "متاجر التجزئة العامة", children: [
          { id: "G4711", label: "سوبر ماركت وهايبر ماركت" },
        ]},
      ]},
    ],
  },
  {
    id: "J", label: "المعلومات والاتصالات",
    children: [
      { id: "J62", label: "برمجيات وتكنولوجيا المعلومات", children: [
        { id: "J620", label: "تطوير البرمجيات", children: [
          { id: "J6201", label: "تطوير تطبيقات الهاتف والويب" },
          { id: "J6202", label: "استشارات تكنولوجيا المعلومات" },
        ]},
      ]},
    ],
  },
  {
    id: "F", label: "التشييد والبناء",
    children: [
      { id: "F41", label: "تشييد المباني", children: [
        { id: "F410", label: "إنشاء المباني السكنية والتجارية", children: [
          { id: "F4100", label: "مقاولات عامة وتشطيبات" },
        ]},
      ]},
    ],
  },
];

export interface LegalForm {
  id: string;
  label: string;
  description: string;
  minCapital: number;
  minFounders: number;
}

export const legalForms: LegalForm[] = [
  { id: "sole", label: "منشأة فردية", description: "ملكية فردية بدون شركاء", minCapital: 0, minFounders: 1 },
  { id: "llc", label: "شركة ذات مسؤولية محدودة", description: "شريكان أو أكثر بمسؤولية محدودة", minCapital: 1000, minFounders: 2 },
  { id: "joint_stock", label: "شركة مساهمة", description: "أسهم قابلة للتداول مع مجلس إدارة", minCapital: 250000, minFounders: 3 },
  { id: "partnership", label: "شركة تضامن", description: "شركاء متضامنون بمسؤولية غير محدودة", minCapital: 0, minFounders: 2 },
  { id: "limited_partnership", label: "شركة توصية بسيطة", description: "شريك متضامن وشريك موصي", minCapital: 0, minFounders: 2 },
  { id: "one_person", label: "شركة الشخص الواحد", description: "شركة ذ.م.م بمؤسس واحد", minCapital: 50000, minFounders: 1 },
];

export interface Incentive {
  id: string;
  label: string;
  description: string;
  discount: string;
  zones: string[]; // investment type IDs
}

export const incentives: Incentive[] = [
  { id: "inc-1", label: "إعفاء ضريبي 5 سنوات", description: "إعفاء كامل من الضريبة على الأرباح لمدة 5 سنوات", discount: "100% لمدة 5 سنوات", zones: ["free_zone", "sinai", "economic_zone"] },
  { id: "inc-2", label: "تخفيض 50% على رسوم التأسيس", description: "خصم نصف رسوم التأسيس والتسجيل", discount: "50%", zones: ["sinai", "investment_zone"] },
  { id: "inc-3", label: "إعفاء جمركي على المعدات", description: "إعفاء من الرسوم الجمركية على الآلات والمعدات", discount: "100% جمارك", zones: ["free_zone", "tech_zone", "economic_zone"] },
  { id: "inc-4", label: "تسهيلات أراضي صناعية", description: "تخصيص أراضي بأسعار مخفضة", discount: "حتى 70% من سعر السوق", zones: ["investment_zone", "sinai"] },
  { id: "inc-5", label: "حوافز تكنولوجية", description: "دعم مالي للمشروعات التقنية الناشئة", discount: "منحة حتى 500,000 ج.م", zones: ["tech_zone"] },
];

// Name check mock results
export type NameStatus = "available" | "rejected" | "reserved";

export const checkNameAvailability = (name: string): Promise<{ status: NameStatus; message: string }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const lower = name.trim().toLowerCase();
      if (lower.includes("مصر") || lower.includes("حكومة") || lower.includes("وطني")) {
        resolve({ status: "rejected", message: "الاسم مرفوض — يحتوي على ألفاظ محظورة (أسماء جهات حكومية)" });
      } else if (lower.includes("النور") || lower.includes("الأمل")) {
        resolve({ status: "rejected", message: "الاسم مرفوض — يوجد اسم تجاري مشابه مسجل بالفعل" });
      } else if (name.trim().length < 3) {
        resolve({ status: "rejected", message: "الاسم قصير جداً — يجب أن يكون 3 أحرف على الأقل" });
      } else {
        resolve({ status: "available", message: "الاسم التجاري متاح ويمكن حجزه" });
      }
    }, 1500);
  });
};

// Contract fee calculation
export const calculateContractFees = (capital: number, legalFormId: string): { baseFee: number; stampFee: number; registrationFee: number; total: number } => {
  const baseFee = legalFormId === "joint_stock" ? 5000 : legalFormId === "llc" ? 2000 : 1000;
  const stampFee = Math.max(capital * 0.0025, 100); // 0.25% of capital, min 100
  const registrationFee = 500;
  const total = baseFee + stampFee + registrationFee;
  return { baseFee, stampFee, registrationFee, total };
};

// Mock founders
export interface Founder {
  id: string;
  name: string;
  nationalId: string;
  sharePercentage: number;
  role: "founder" | "manager" | "board_member";
}
