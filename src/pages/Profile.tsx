import { useContext } from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { AuthContext } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function Profile() {
  const { user } = useContext(AuthContext);
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe } =
    usePushNotifications(user?.id || 0);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Profile</CardTitle>
        <CardDescription>
          Your personal information and notification settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="settings-section">
          <h3 className="mb-2 text-lg font-medium">Notifications</h3>

          {!isSupported && (
            <p className="warning">
              Push notifications are not supported in this browser.
            </p>
          )}

          {isSupported && (
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label>Enable inquiry followup reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications 10 minutes before inquiries followup
                  time
                </p>
              </div>
              <div>
                <Switch
                  className="ml-2"
                  checked={isSubscribed}
                  onCheckedChange={isSubscribed ? unsubscribe : subscribe}
                  disabled={permission === "denied"}
                />
              </div>
            </div>
          )}
          {permission === "denied" && (
            <p className="text-sm text-red-700 mt-1 px-3">
              Notifications are blocked. Please enable them in browser settings.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Profile;
