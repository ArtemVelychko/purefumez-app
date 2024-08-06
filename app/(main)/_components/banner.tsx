"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface BannerProps {
  materialId: Id<"materials">;
}

export const Banner = ({ materialId }: BannerProps) => {
  const router = useRouter();
  const remove = useMutation(api.materials.remove);

  const onRemove = () => {
    const promise = remove({ id: materialId });

    toast.promise(promise, {
      loading: "Deleting material...",
      success: "Material deleted",
      error: "Failed to delete material",
    });

    router.push("/materials");
  };

  return (
    <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
      <p>This material is in the Trash.</p>

      <Button
        size="sm"
        // onClick={onRestore}
        variant="outline"
        className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
      >
        Restore material
      </Button>
      <ConfirmModal onConfirm={onRemove}>
        <Button
          size="sm"
          variant="outline"
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
        >
          Delete forever
        </Button>
      </ConfirmModal>
    </div>
  );
};
