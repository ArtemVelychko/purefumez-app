"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { DataTable } from "../../_components/data-table";
import { columns } from "./columns";
import { Spinner } from "@/components/spinner";

interface FormulaListProps {
  data?: Doc<"formulas">[];
}

const FormulasPage = () => {
  const create = useMutation(api.formulas.createFormula);
  const bulkDelete = useMutation(api.formulas.bulkRemoveFormulas);

  const onCreate = () => {
    const promise = create({ title: "Untitled" });

    toast.promise(promise, {
      loading: "Creating a new formula...",
      success: "Formula created successfully",
      error: "Failed to create formula",
    });
  };

  const formulas = useQuery(api.formulas.getFormulasSidebar);

  const handleDelete = (ids: Id<"formulas">[]) => {
    const promise = bulkDelete({ ids });

    setTimeout(() => {
      toast.promise(promise, {
        loading: "Deleting formulas...",
        success: "Formulas deleted successfully",
        error: "Failed to delete formulas",
      });
    }, 200);
  };

  return (
    <div className="h-full flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 mt-14">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">My Formulas</h1>
        <div className="ml-auto">
          <Button onClick={onCreate} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create a formula
          </Button>
        </div>
      </div>
      {formulas ? (
        <DataTable
          columns={columns}
          data={formulas}
          filterKey="title"
          onDelete={(rows) => {
            const ids = rows.map((row) => row.original._id);
            handleDelete(ids);
          }}
          tagsColumn="tags"
        />
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default FormulasPage;
