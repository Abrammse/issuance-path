import { Link, useLocation } from "react-router-dom";
import { Building2, Bell } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { path: "/", label: "الرئيسية" },
  { path: "/dashboard", label: "لوحة التحكم" },
  { path: "/admin", label: "الإدارة" },
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
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">بوابة الخدمات الحكومية</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {item.label === "الإشعارات" ? (
                <span className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4" />
                  {item.label}
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
