import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const Notifications = () => {
  const { notifications, markNotificationRead } = useApp();

  const sorted = [...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="container py-10 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">الإشعارات</h1>
        {sorted.filter(n => !n.read).length > 0 && (
          <Badge variant="secondary">{sorted.filter(n => !n.read).length} غير مقروء</Badge>
        )}
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد إشعارات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map(n => (
            <Card key={n.id} className={!n.read ? "border-primary/30 bg-primary/5" : ""}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${!n.read ? "bg-primary/20" : "bg-muted"}`}>
                  <Bell className={`w-4 h-4 ${!n.read ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{n.requestId}</Badge>
                    <span className="text-xs text-muted-foreground">{n.timestamp.toLocaleString("ar-EG")}</span>
                  </div>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => markNotificationRead(n.id)} className="shrink-0 h-8 w-8 p-0">
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
