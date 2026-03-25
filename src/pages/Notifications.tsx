import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, BellOff } from "lucide-react";

const Notifications = () => {
  const { currentRequest } = useApp();
  const notifications = currentRequest?.notifications ?? [];

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">الإشعارات</h1>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد إشعارات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {[...notifications].reverse().map((n, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{n}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentRequest?.id} - {new Date().toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
