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
  id: Id<"formulas">;
};

export const Actions = ({ id }: Props) => {
  const remove = useMutation(api.formulas.removeFormula);
  const formula = useQuery(api.formulas.getFormulaById, { formulaId: id });
  const router = useRouter();
  const duplicate = useMutation(api.formulas.duplicateFormula);

  const onRedirect = (formulaId: string) => {
    router.push(`/formulas/${formulaId}`);
  };

  const handleDeleteFormula = async (formulaId: Id<"formulas">) => {
    const promise = remove({ id: formulaId });
    setTimeout(() => {
      toast.promise(promise, {
        loading: "Deleting formula...",
        success: "Formula deleted successfully",
        error: "Failed to delete formula",
      });
    }, 200);
  };

  const handleDuplicateFormula = async (formulaId: Id<"formulas">) => {
    const promise = duplicate({ id: formulaId });
    setTimeout(() => {
      toast.promise(promise, {
        loading: "Duplicating formula...",
        success: "Formula duplicated successfully",
        error: "Failed to duplicate formula",
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
        <DropdownMenuItem disabled={!formula} onClick={() => onRedirect(id)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDeleteFormula(id)}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDuplicateFormula(id)}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicate</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
