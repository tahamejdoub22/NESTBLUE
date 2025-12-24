"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Avatar } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";
import { Tabs } from "@/components/molecules/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Checkbox } from "@/components/atoms/checkbox";
import { 
  User, 
  Settings, 
  Lock, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2,
  Camera,
  Save,
  Globe,
  Bell,
  Palette,
  Shield,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, transitions } from "@/lib/motion";
import { toast } from "sonner";
import type { UserProfile } from "@/interfaces";
import { userApi } from "@/core/services/api-helpers";

export interface ProfilePageTemplateProps {
  user: UserProfile | undefined;
  onUpdateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isUpdating?: boolean;
}

export function ProfilePageTemplate({
  user,
  onUpdateProfile,
  isUpdating = false,
}: ProfilePageTemplateProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "",
    position: user?.position || "",
    role: user?.role || "",
    avatar: user?.avatar || "",
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || "system",
    language: user?.preferences?.language || "en",
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      push: user?.preferences?.notifications?.push ?? true,
      sms: user?.preferences?.notifications?.sms ?? false,
    },
  });

  // Settings state
  const [settings, setSettings] = useState({
    timezone: user?.settings?.timezone || "UTC",
    dateFormat: user?.settings?.dateFormat || "MMM dd, yyyy",
    currency: user?.settings?.currency || "USD",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 1, label: "Weak", color: "bg-red-500" };
    if (password.length < 10) return { strength: 2, label: "Medium", color: "bg-amber-500" };
    if (password.length < 12) return { strength: 3, label: "Strong", color: "bg-blue-500" };
    return { strength: 4, label: "Very Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);
  const passwordsMatch = passwordData.newPassword && passwordData.confirmPassword && 
    passwordData.newPassword === passwordData.confirmPassword;

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        position: user.position || "",
        role: user.role || "",
        avatar: user.avatar || "",
      });
      setPreferences({
        theme: user.preferences?.theme || "system",
        language: user.preferences?.language || "en",
        notifications: {
          email: user.preferences?.notifications?.email ?? true,
          push: user.preferences?.notifications?.push ?? true,
          sms: user.preferences?.notifications?.sms ?? false,
        },
      });
      setSettings({
        timezone: user.settings?.timezone || "UTC",
        dateFormat: user.settings?.dateFormat || "MMM dd, yyyy",
        currency: user.settings?.currency || "USD",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateProfile(profileData);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile");
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateProfile({ preferences });
      toast.success("Preferences updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update preferences");
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateProfile({ settings });
      toast.success("Settings updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update settings");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsChangingPassword(true);
      await userApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "away":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "busy":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const timezones = [
    "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "Europe/London", "Europe/Paris", "Asia/Dubai", "Asia/Tokyo", "Australia/Sydney"
  ];

  const dateFormats = [
    { value: "MMM dd, yyyy", label: "Jan 15, 2024" },
    { value: "dd/MM/yyyy", label: "15/01/2024" },
    { value: "MM/dd/yyyy", label: "01/15/2024" },
    { value: "yyyy-MM-dd", label: "2024-01-15" },
    { value: "dd MMM yyyy", label: "15 Jan 2024" },
  ];

  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "MAD", label: "MAD (د.م)" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
                Profile Settings
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your account information, preferences, and security settings
              </p>
            </div>
          </motion.div>

          {/* Profile Overview Card */}
          <motion.div
            variants={fadeInUp}
            transition={{ ...transitions.default, delay: 0.1 }}
          >
            <Card className="border border-border/40 bg-card/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative group">
                    <div className="relative">
                      <Avatar
                        fallback={user?.name || "User"}
                        size="lg"
                        src={user?.avatar}
                        className="h-28 w-28 sm:h-32 sm:w-32 ring-4 ring-primary/10 shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-background border-2 border-border shadow-lg hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 hover:scale-110"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <h2 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                        {user?.name || "User"}
                      </h2>
                      {user?.status && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize text-xs px-2.5 py-1 flex items-center gap-1.5 w-fit",
                            getStatusColor(user.status)
                          )}
                        >
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            user.status === "online" && "bg-emerald-500",
                            user.status === "away" && "bg-amber-500",
                            user.status === "busy" && "bg-red-500",
                            !["online", "away", "busy"].includes(user.status) && "bg-muted-foreground"
                          )} />
                          {user.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate">{user?.email}</span>
                      </div>
                      {user?.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{user.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                      {user?.role && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">{user.role}</span>
                        </div>
                      )}
                      {user?.department && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-foreground">{user.department}</span>
                        </div>
                      )}
                      {user?.position && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/5 border border-purple-500/10">
                          <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium text-foreground">{user.position}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            variants={fadeInUp}
            transition={{ ...transitions.default, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <Tabs.List className="grid w-full grid-cols-1 sm:grid-cols-3 bg-card border border-border/40 rounded-xl p-1.5 gap-1.5">
                <Tabs.Trigger 
                  value="profile" 
                  className="flex items-center justify-center gap-2 h-11 rounded-lg transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Profile</span>
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="preferences" 
                  className="flex items-center justify-center gap-2 h-11 rounded-lg transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Preferences</span>
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="security" 
                  className="flex items-center justify-center gap-2 h-11 rounded-lg transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Security</span>
                </Tabs.Trigger>
              </Tabs.List>

              {/* Profile Tab */}
              <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border border-border/30 bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pt-6 pb-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/10 flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-2xl font-semibold text-foreground mb-1.5">Profile Information</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                              Update your personal information and contact details
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 pb-6 px-6">
                        <form onSubmit={handleProfileSubmit} className="space-y-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                              className="space-y-2.5 w-full"
                            >
                              <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                  <User className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span>Full Name</span>
                                <span className="text-destructive text-xs">*</span>
                              </Label>
                              <Input
                                id="name"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                placeholder="John Doe"
                                className="h-12 border border-border/60 bg-background hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base w-full"
                                required
                              />
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.15 }}
                              className="space-y-2.5 w-full"
                            >
                              <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                  <Mail className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span>Email Address</span>
                                <span className="text-destructive text-xs">*</span>
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                placeholder="john@example.com"
                                className="h-12 border border-border/60 bg-background hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base w-full"
                                required
                              />
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="space-y-2.5 w-full"
                            >
                              <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                  <Phone className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span>Phone Number</span>
                              </Label>
                              <Input
                                id="phone"
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                placeholder="+1 (555) 000-0000"
                                className="h-12 border border-border/60 bg-background hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base w-full"
                              />
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.25 }}
                              className="space-y-2.5 w-full"
                            >
                              <Label htmlFor="role" className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span>Role</span>
                              </Label>
                              <Input
                                id="role"
                                value={profileData.role}
                                onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                                placeholder="e.g., Designer, Developer"
                                className="h-12 border border-border/60 bg-background hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base w-full"
                              />
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="space-y-2.5 w-full"
                            >
                              <Label htmlFor="department" className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                  <Building2 className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span>Department</span>
                              </Label>
                              <Input
                                id="department"
                                value={profileData.department}
                                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                placeholder="e.g., Engineering, Design"
                                className="h-12 border border-border/60 bg-background hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base w-full"
                              />
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.35 }}
                              className="space-y-2.5 w-full"
                            >
                              <Label htmlFor="position" className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                  <User className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span>Position</span>
                              </Label>
                              <Input
                                id="position"
                                value={profileData.position}
                                onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                                placeholder="e.g., Senior Developer, Lead Designer"
                                className="h-12 border border-border/60 bg-background hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base w-full"
                              />
                            </motion.div>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border/30 mt-0">
                            <Button
                              type="submit"
                              disabled={isUpdating}
                              className="gap-2 h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                            >
                              {isUpdating ? (
                                <>
                                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <Card className="border border-border/30 bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pt-6 pb-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center border border-purple-500/20 flex-shrink-0">
                            <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-2xl font-semibold text-foreground mb-1.5">Appearance & Language</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                              Customize how the application looks and feels
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 pb-6 px-6">
                        <form onSubmit={handlePreferencesSubmit} className="space-y-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            <div className="space-y-2.5 w-full">
                              <Label htmlFor="theme" className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                  <Palette className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span>Theme</span>
                              </Label>
                              <Select
                                value={preferences.theme}
                                onValueChange={(value) => setPreferences({ ...preferences, theme: value as any })}
                              >
                                <SelectTrigger id="theme" className="h-12 border border-border/60 bg-background hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2.5 w-full">
                              <Label htmlFor="language" className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                  <Globe className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span>Language</span>
                              </Label>
                              <Select
                                value={preferences.language}
                                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                              >
                                <SelectTrigger id="language" className="h-12 border border-border/60 bg-background hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="fr">Français</SelectItem>
                                  <SelectItem value="es">Español</SelectItem>
                                  <SelectItem value="ar">العربية</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-border/30">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <Label className="text-sm font-semibold">Notification Preferences</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Choose how you want to be notified
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3 pl-11">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    id="email-notifications"
                                    checked={preferences.notifications.email}
                                    onCheckedChange={(checked) =>
                                      setPreferences({
                                        ...preferences,
                                        notifications: { ...preferences.notifications, email: checked as boolean },
                                      })
                                    }
                                  />
                                  <div>
                                    <Label htmlFor="email-notifications" className="font-medium cursor-pointer">
                                      Email notifications
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                                  </div>
                                </div>
                                <Mail className="h-4 w-4 text-muted-foreground" />
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    id="push-notifications"
                                    checked={preferences.notifications.push}
                                    onCheckedChange={(checked) =>
                                      setPreferences({
                                        ...preferences,
                                        notifications: { ...preferences.notifications, push: checked as boolean },
                                      })
                                    }
                                  />
                                  <div>
                                    <Label htmlFor="push-notifications" className="font-medium cursor-pointer">
                                      Push notifications
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Browser push notifications</p>
                                  </div>
                                </div>
                                <Bell className="h-4 w-4 text-muted-foreground" />
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    id="sms-notifications"
                                    checked={preferences.notifications.sms}
                                    onCheckedChange={(checked) =>
                                      setPreferences({
                                        ...preferences,
                                        notifications: { ...preferences.notifications, sms: checked as boolean },
                                      })
                                    }
                                  />
                                  <div>
                                    <Label htmlFor="sms-notifications" className="font-medium cursor-pointer">
                                      SMS notifications
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Text message alerts</p>
                                  </div>
                                </div>
                                <Phone className="h-4 w-4 text-muted-foreground" />
                              </motion.div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border/30 mt-0">
                            <Button
                              type="submit"
                              disabled={isUpdating}
                              className="gap-2 h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                            >
                              {isUpdating ? (
                                <>
                                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  Save Preferences
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Settings Card */}
                    <Card className="border border-border/30 bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pt-6 pb-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                            <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-2xl font-semibold text-foreground mb-1.5">Regional Settings</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                              Configure timezone, date format, and currency preferences
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 pb-6 px-6">
                        <form onSubmit={handleSettingsSubmit} className="space-y-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
                            <div className="space-y-2.5 w-full">
                              <Label htmlFor="timezone" className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                  <Clock className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span>Timezone</span>
                              </Label>
                              <Select
                                value={settings.timezone}
                                onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                              >
                                <SelectTrigger id="timezone" className="h-12 border border-border/60 bg-background hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {timezones.map((tz) => (
                                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2.5 w-full">
                              <Label htmlFor="dateFormat" className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                  <Calendar className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span>Date Format</span>
                              </Label>
                              <Select
                                value={settings.dateFormat}
                                onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                              >
                                <SelectTrigger id="dateFormat" className="h-12 border border-border/60 bg-background hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {dateFormats.map((format) => (
                                    <SelectItem key={format.value} value={format.value}>
                                      {format.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2.5 w-full">
                              <Label htmlFor="currency" className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                                  <DollarSign className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span>Currency</span>
                              </Label>
                              <Select
                                value={settings.currency}
                                onValueChange={(value) => setSettings({ ...settings, currency: value })}
                              >
                                <SelectTrigger id="currency" className="h-12 border border-border/60 bg-background hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {currencies.map((curr) => (
                                    <SelectItem key={curr.value} value={curr.value}>
                                      {curr.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border/30 mt-0">
                            <Button
                              type="submit"
                              disabled={isUpdating}
                              className="gap-2 h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                            >
                              {isUpdating ? (
                                <>
                                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  Save Settings
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border border-border/30 bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pt-6 pb-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center border border-red-500/20 flex-shrink-0">
                            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-2xl font-semibold text-foreground mb-1.5">Change Password</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                              Update your password to keep your account secure
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 pb-6 px-6">
                        <form onSubmit={handlePasswordChange} className="space-y-0">
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor="current-password" className="text-sm font-semibold flex items-center gap-2">
                                <Lock className="h-4 w-4 text-primary" />
                                Current Password
                                <span className="text-destructive">*</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  id="current-password"
                                  type={showPasswords.current ? "text" : "password"}
                                  value={passwordData.currentPassword}
                                  onChange={(e) =>
                                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                                  }
                                  placeholder="Enter your current password"
                                  className="h-11 border-2 focus:border-primary/50 transition-colors pr-10"
                                  required
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                >
                                  {showPasswords.current ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="new-password" className="text-sm font-semibold flex items-center gap-2">
                                <Lock className="h-4 w-4 text-primary" />
                                New Password
                                <span className="text-destructive">*</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  id="new-password"
                                  type={showPasswords.new ? "text" : "password"}
                                  value={passwordData.newPassword}
                                  onChange={(e) =>
                                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                                  }
                                  placeholder="Enter your new password (min. 8 characters)"
                                  className={cn(
                                    "h-11 border-2 focus:border-primary/50 transition-colors pr-10",
                                    passwordData.newPassword && passwordStrength.strength > 0 && "border-primary/30"
                                  )}
                                  required
                                  minLength={8}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                >
                                  {showPasswords.new ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                              {passwordData.newPassword && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 h-2 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                                      className={cn("h-full rounded-full transition-colors", passwordStrength.color)}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className={cn(
                                      "font-medium",
                                      passwordStrength.strength === 1 && "text-red-600 dark:text-red-400",
                                      passwordStrength.strength === 2 && "text-amber-600 dark:text-amber-400",
                                      passwordStrength.strength === 3 && "text-blue-600 dark:text-blue-400",
                                      passwordStrength.strength === 4 && "text-emerald-600 dark:text-emerald-400"
                                    )}>
                                      {passwordStrength.label}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {passwordData.newPassword.length} / 12+ characters
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="confirm-password" className="text-sm font-semibold flex items-center gap-2">
                                <Lock className="h-4 w-4 text-primary" />
                                Confirm New Password
                                <span className="text-destructive">*</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  id="confirm-password"
                                  type={showPasswords.confirm ? "text" : "password"}
                                  value={passwordData.confirmPassword}
                                  onChange={(e) =>
                                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                  }
                                  placeholder="Confirm your new password"
                                  className={cn(
                                    "h-11 border-2 transition-colors pr-10",
                                    passwordData.confirmPassword && passwordsMatch && "border-emerald-500/50 focus:border-emerald-500/50",
                                    passwordData.confirmPassword && !passwordsMatch && "border-red-500/50 focus:border-red-500/50",
                                    !passwordData.confirmPassword && "focus:border-primary/50"
                                  )}
                                  required
                                  minLength={8}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                >
                                  {showPasswords.confirm ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                              {passwordData.confirmPassword && (
                                <div className="flex items-center gap-2 text-xs">
                                  {passwordsMatch ? (
                                    <>
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                        Passwords match
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                      <span className="text-red-600 dark:text-red-400 font-medium">
                                        Passwords do not match
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4">
                            <div className="flex items-start gap-3">
                              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">Password Requirements</p>
                                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                  <li>At least 8 characters long</li>
                                  <li>Use a mix of letters, numbers, and symbols</li>
                                  <li>Avoid common words or personal information</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border/30 mt-0">
                            <Button
                              type="submit"
                              disabled={isChangingPassword || !passwordsMatch || passwordData.newPassword.length < 8}
                              className="gap-2 h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isChangingPassword ? (
                                <>
                                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Changing...
                                </>
                              ) : (
                                <>
                                  <Lock className="h-4 w-4" />
                                  Change Password
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

