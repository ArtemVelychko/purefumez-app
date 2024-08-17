import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HexColorPicker } from "react-colorful";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface EditProfileDialogProps {
  profileId: Id<"profiles">;
  onClose: () => void;
}

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ profileId, onClose }) => {
  const profile = useQuery(api.profiles.getById, { profileId });
  const updateProfile = useMutation(api.profiles.update);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    if (profile) {
      setTitle(profile.title);
      setColor(profile.color);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateProfile({ id: profileId, title, color });
      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle>Edit Profile</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter profile title"
              required
            />
          </div>
          <div>
            <Label>Color</Label>
            <HexColorPicker color={color} onChange={setColor} />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#000000"
              className="mt-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Update Profile</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};