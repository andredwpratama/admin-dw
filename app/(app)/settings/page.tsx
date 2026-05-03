"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Bell,
  Settings as SettingsIcon,
  Shield,
  CreditCard,
  Save,
  Loader2,
  Moon,
  Sun,
  Globe,
  Coins
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setFetching(false);
      }
    }
    fetchSettings();
  }, []);

  const handleUpdate = async (newData: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      const updated = await res.json();
      setSettings(updated);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-full border">
          <TabsTrigger value="profile" className="rounded-full gap-2">
            <User size={16} /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-full gap-2">
            <Bell size={16} /> Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-full gap-2">
            <SettingsIcon size={16} /> Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border-2 border-background">
                  M
                </div>
                <div>
                  <CardTitle>Public Profile</CardTitle>
                  <CardDescription>This information will be displayed to your team members.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="dw" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="User" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue="user@dw.com" disabled className="rounded-xl h-12 bg-muted/50" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="rounded-full h-11 px-8 gap-2 font-bold shadow-lg shadow-primary/20">
                  <Save size={18} /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Choose how and when you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive morning AI insights and report summaries via email.</p>
                  </div>
                  <Switch
                    checked={settings?.emailNotifications}
                    onCheckedChange={(checked) => handleUpdate({ emailNotifications: checked })}
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive real-time alerts about campaign anomalies.</p>
                  </div>
                  <Switch
                    checked={settings?.pushNotifications}
                    onCheckedChange={(checked) => handleUpdate({ pushNotifications: checked })}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>Customize your AdMind experience.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Sun size={16} /> Theme Mode
                  </Label>
                  <Select
                    value={settings?.theme}
                    onValueChange={(val) => handleUpdate({ theme: val })}
                    disabled={loading}
                  >
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="dark">Dark Mode</SelectItem>
                      <SelectItem value="system">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Coins size={16} /> Display Currency
                  </Label>
                  <Select
                    value={settings?.currency}
                    onValueChange={(val) => handleUpdate({ currency: val })}
                    disabled={loading}
                  >
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">Indonesian Rupiah (IDR)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="SGD">Singapore Dollar (SGD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Globe size={16} /> Language
                  </Label>
                  <Select
                    value={settings?.language}
                    onValueChange={(val) => handleUpdate({ language: val })}
                    disabled={loading}
                  >
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                      <SelectItem value="en">English (US)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
