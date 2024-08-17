"use client";

import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Spinner } from "@/components/spinner";
import { NewProfileDialog } from "../../_components/new-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { EditProfileDialog } from "@/components/profiles/edit-profile-dialog";

const ProfilesPage = () => {
  const profiles = useQuery(api.profiles.get);
  const deleteProfile = useMutation(api.profiles.remove);
  const [editingProfile, setEditingProfile] = useState<Id<"profiles"> | null>(null);

  const handleDelete = async (id: Id<"profiles">) => {
    try {
      await deleteProfile({ id });
      toast.success("Profile deleted successfully");
    } catch (error) {
      toast.error("Failed to delete profile");
    }
  };

  return (
    <div className="h-full flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 mt-14">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">My Profiles</h1>
        <NewProfileDialog />
      </div>

      {profiles === undefined && <Spinner />}
      {profiles && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {profiles.map((profile) => (
            <Card 
              key={profile._id} 
              className="aspect-square rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group"
              style={{ backgroundColor: profile.color }}
            >
              <CardContent className="p-2 w-full h-full flex items-center justify-center">
                <div className="text-white text-center font-bold text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl break-words overflow-hidden">
                  {profile.title.length > 20 ? `${profile.title.slice(0, 20)}...` : profile.title}
                </div>
              </CardContent>
              
              {/* Buttons container */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-top justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="m-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setEditingProfile(profile._id)}
                  className="h-8 w-8 mr-2"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleDelete(profile._id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                </div>
                
              </div>
            </Card>
          ))}
        </div>
      )}
      {editingProfile && (
        <EditProfileDialog
          profileId={editingProfile}
          onClose={() => setEditingProfile(null)}
        />
      )}
    </div>
  );
};

export default ProfilesPage;