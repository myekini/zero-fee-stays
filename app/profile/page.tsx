"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  ArrowLeft,
  Loader2,
  Camera,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, authUser, updateProfile } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  // Load profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        bio: user.user_metadata?.bio || "",
        location: user.user_metadata?.location || "",
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        bio: profileData.bio,
        },
      });

      if (authError) {
        throw authError;
      }

      // Also try to update profiles table if it exists
      try {
        const { error: profileError } = await supabase.from("profiles").upsert({
          user_id: user.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          bio: profileData.bio,
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn("Profiles table update failed:", profileError);
          // Don't throw error here as auth update succeeded
        }
      } catch (profileError) {
        console.warn(
          "Profiles table doesn't exist or update failed:",
          profileError
        );
        // Continue as auth update succeeded
      }

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
        variant: "success",
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description:
          error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    if (user) {
      setProfileData({
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        bio: user.user_metadata?.bio || "",
        location: user.user_metadata?.location || "",
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sand-50 to-terracotta-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23d4a574%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-sage-200/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-terracotta-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <Logo className="h-8 w-8" />
              <h1 className="text-3xl font-bold text-warm-gray-800">
                My Profile
              </h1>
            </div>
          </div>

          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-xl">
            <CardHeader className="text-center pb-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-brand-100">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url}
                      alt={`${profileData.firstName} ${profileData.lastName}`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-brand-500 to-accent-500 text-white text-2xl font-bold">
                      {profileData.firstName?.[0] ||
                        profileData.email?.[0] ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      variant="secondary"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl text-warm-gray-800">
                    {profileData.firstName && profileData.lastName
                      ? `${profileData.firstName} ${profileData.lastName}`
                      : profileData.email?.split("@")[0] || "User"}
                  </CardTitle>
                  <CardDescription className="text-warm-gray-600">
                    {authUser?.role === "admin"
                      ? "Administrator"
                      : authUser?.role === "host"
                        ? "Host"
                        : "Guest"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4 text-brand-600" />
                    <span>First Name</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="Enter your first name"
                    className="bg-white/50"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4 text-brand-600" />
                    <span>Last Name</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="Enter your last name"
                    className="bg-white/50"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center space-x-2"
                  >
                    <Mail className="h-4 w-4 text-brand-600" />
                    <span>Email</span>
                  </Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-100 text-gray-600"
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center space-x-2"
                  >
                    <Phone className="h-4 w-4 text-brand-600" />
                    <span>Phone</span>
                  </Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    className="bg-white/50"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="location"
                    className="flex items-center space-x-2"
                  >
                    <MapPin className="h-4 w-4 text-brand-600" />
                    <span>Location</span>
                  </Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="Enter your location"
                    className="bg-white/50"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
