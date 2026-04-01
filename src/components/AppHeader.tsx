import { Link, useLocation } from "react-router-dom";
import { Landmark, Bell, ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { AGENCIES } from "@/context/JscContext";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const navItems = [
  { path: "/", label: "الرئيسية" },
  { path: "/services", label: "كتالوج الخدمات" },
  { path: "/dashboard", label: "لوحة العميل" },
  { path: "/admin", label: "لوحة الجهة" },
];

const AppHeader = () => {
  const location = useLocation();
  const { unreadCount } = useApp();
  const [agenciesOpen, setAgenciesOpen] = useState(false);

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
            <Link key={item.path} to={item.path}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                location.pathname === item.path ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}>
              {item.label}
            </Link>
          ))}

          {/* Agencies dropdown */}
          <div className="relative">
            <button onClick={() => setAgenciesOpen(!agenciesOpen)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                location.pathname.startsWith("/agency") ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}>
              لوحات الجهات <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {agenciesOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAgenciesOpen(false)} />
                <div className="absolute left-0 top-full mt-1 w-56 bg-card border rounded-lg shadow-lg z-50 py-1">
                  {AGENCIES.map(a => (
                    <Link key={a.id} to={`/agency/${a.id}`}
                      onClick={() => setAgenciesOpen(false)}
                      className={`block px-4 py-2 text-sm hover:bg-secondary transition-colors ${
                        location.pathname === `/agency/${a.id}` ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                      }`}>
                      {a.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <Link to="/notifications"
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              location.pathname === "/notifications" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}>
            <span className="flex items-center gap-1.5">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">الإشعارات</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-[10px] h-5 min-w-5 flex items-center justify-center p-0">
                  {unreadCount}
                </Badge>
              )}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
