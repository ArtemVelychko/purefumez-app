import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash, Copy } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

type Props = {
  id: Id<"accords">;
};

export const Actions = ({ id }: Props) => {
  const remove = useMutation(api.accords.removeAccord);
  const accord = useQuery(api.accords.getAccordById, { accordId: id });
  const router = useRouter();
  const duplicate = useMutation(api.accords.duplicateAccord);

  const onRedirect = (accordId: string) => {
    router.push(`/accords/${accordId}`);
  };

  const handleDeleteAccord = async (accordId: Id<"accords">) => {
    const promise = remove({ id: accordId });
    setTimeout(() => {
      toast.promise(promise, {
        loading: "Deleting accord...",
        success: "Accord deleted successfully",
        error: "Failed to delete accord",
      });
    }, 200);
  };

  const handleDuplicateAccord = async (accordId: Id<"accords">) => {
    const promise = duplicate({ id: accordId });
    setTimeout(() => {
      toast.promise(promise, {
        loading: "Duplicating accord...",
        success: "Accord duplicated successfully",
        error: "Failed to duplicate accord",
      });
    }, 200);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={!accord} onClick={() => onRedirect(id)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDeleteAccord(id)}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDuplicateAccord(id)}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicate</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
