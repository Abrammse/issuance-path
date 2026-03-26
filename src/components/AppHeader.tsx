import { Link, useLocation } from "react-router-dom";
import { Landmark, Bell } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { path: "/", label: "الرئيسية" },
  { path: "/services", label: "كتالوج الخدمات" },
  { path: "/dashboard", label: "لوحة العميل" },
  { path: "/admin", label: "لوحة الجهة" },
  { path: "/notifications", label: "الإشعارات" },
];

const AppHeader = () => {
  const location = useLocation();
  const { currentRequest } = useApp();
  const notifCount = currentRequest?.notifications.length ?? 0;

  return (
    <header className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Landmark className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-sm leading-tight block">منصة الكيانات الاقتصادية</span>
            <span className="text-[10px] text-muted-foreground">بوابة المستثمرين</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {item.label === "الإشعارات" ? (
                <span className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {notifCount > 0 && (
                    <Badge variant="destructive" className="text-[10px] h-5 min-w-5 flex items-center justify-center p-0">
                      {notifCount}
                    </Badge>
                  )}
                </span>
              ) : item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
