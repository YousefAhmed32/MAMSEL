import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Save, 
  Mail, 
  Bell, 
  Shield, 
  Globe,
  CreditCard,
  Database,
  Palette,
  Smartphone
} from "lucide-react";

function AdminSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "عود الوجبة",
    siteDescription: "متجر  العود الفاخرة",
    contactEmail: "info@oudalwajba.com",
    contactPhone: "+97451227772",
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    reviewNotifications: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: "strong",
    
    // Payment Settings
    paypalEnabled: true,
    stripeEnabled: false,
    currency: "QAR",
    
    // Appearance Settings
    theme: "dark",
    primaryColor: "#D2B065",
    secondaryColor: "#000012",
    
    // Maintenance Settings
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: "daily"
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving settings:", settings);
    // Show success message
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white glow-text">Settings</h1>
          <p className="text-gold-300 mt-2">Manage your store settings and preferences</p>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-gold-950 hover:bg-gold-800 text-navy-950 font-semibold glow-gold"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="perfume-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-gold-950" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName" className="text-gold-300">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleSettingChange("siteName", e.target.value)}
                className="bg-navy-950/50 border-elegant-border text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="siteDescription" className="text-gold-300">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange("siteDescription", e.target.value)}
                className="bg-navy-950/50 border-elegant-border text-white"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="contactEmail" className="text-gold-300">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleSettingChange("contactEmail", e.target.value)}
                className="bg-navy-950/50 border-elegant-border text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="contactPhone" className="text-gold-300">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => handleSettingChange("contactPhone", e.target.value)}
                className="bg-navy-950/50 border-elegant-border text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="perfume-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-gold-950" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gold-300">Email Notifications</Label>
                <p className="text-gold-400 text-sm">Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gold-300">SMS Notifications</Label>
                <p className="text-gold-400 text-sm">Receive notifications via SMS</p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gold-300">Order Notifications</Label>
                <p className="text-gold-400 text-sm">Get notified about new orders</p>
              </div>
              <Switch
                checked={settings.orderNotifications}
                onCheckedChange={(checked) => handleSettingChange("orderNotifications", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gold-300">Review Notifications</Label>
                <p className="text-gold-400 text-sm">Get notified about new reviews</p>
              </div>
              <Switch
                checked={settings.reviewNotifications}
                onCheckedChange={(checked) => handleSettingChange("reviewNotifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="perfume-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-gold-950" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gold-300">Two-Factor Authentication</Label>
                <p className="text-gold-400 text-sm">Add extra security to your account</p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
              />
            </div>
            
            <div>
              <Label htmlFor="sessionTimeout" className="text-gold-300">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange("sessionTimeout", parseInt(e.target.value))}
                className="bg-navy-950/50 border-elegant-border text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="passwordPolicy" className="text-gold-300">Password Policy</Label>
              <select
                id="passwordPolicy"
                value={settings.passwordPolicy}
                onChange={(e) => handleSettingChange("passwordPolicy", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-navy-950/50 border elegant-border text-white"
              >
                <option value="weak">Weak</option>
                <option value="medium">Medium</option>
                <option value="strong">Strong</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card className="perfume-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold-950" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gold-300">PayPal</Label>
                <p className="text-gold-400 text-sm">Enable PayPal payments</p>
              </div>
              <Switch
                checked={settings.paypalEnabled}
                onCheckedChange={(checked) => handleSettingChange("paypalEnabled", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gold-300">Stripe</Label>
                <p className="text-gold-400 text-sm">Enable Stripe payments</p>
              </div>
              <Switch
                checked={settings.stripeEnabled}
                onCheckedChange={(checked) => handleSettingChange("stripeEnabled", checked)}
              />
            </div>
            
            <div>
              <Label htmlFor="currency" className="text-gold-300">Default Currency</Label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => handleSettingChange("currency", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-navy-950/50 border elegant-border text-white"
              >
                <option value="QAR">QAR</option>
                <option value="EUR">EUR</option>
                <option value="EGP">EGP</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="perfume-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-gold-950" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme" className="text-gold-300">Theme</Label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) => handleSettingChange("theme", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-navy-950/50 border elegant-border text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="primaryColor" className="text-gold-300">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleSettingChange("primaryColor", e.target.value)}
                  className="w-16 h-10 p-1 bg-navy-950/50 border elegant-border"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => handleSettingChange("primaryColor", e.target.value)}
                  className="flex-1 bg-navy-950/50 border-elegant-border text-white"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="secondaryColor" className="text-gold-300">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => handleSettingChange("secondaryColor", e.target.value)}
                  className="w-16 h-10 p-1 bg-navy-950/50 border elegant-border"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => handleSettingChange("secondaryColor", e.target.value)}
                  className="flex-1 bg-navy-950/50 border-elegant-border text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Settings */}
        <Card className="perfume-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-gold-950" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gold-300">Maintenance Mode</Label>
                <p className="text-gold-400 text-sm">Put site in maintenance mode</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gold-300">Auto Backup</Label>
                <p className="text-gold-400 text-sm">Automatically backup data</p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
              />
            </div>
            
            <div>
              <Label htmlFor="backupFrequency" className="text-gold-300">Backup Frequency</Label>
              <select
                id="backupFrequency"
                value={settings.backupFrequency}
                onChange={(e) => handleSettingChange("backupFrequency", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-navy-950/50 border elegant-border text-white"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminSettings;
