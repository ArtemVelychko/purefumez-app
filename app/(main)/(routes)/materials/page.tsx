"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { columns } from "./columns";
import { DataTable } from "../../_components/data-table";
import { NewMaterialSheet } from "@/components/materials/new-material-sheet";
import { EditMaterialSheet } from "@/components/materials/edit-material-sheet";
import { useOnOpenMaterial } from "@/hooks/materials/use-on-open-material";
import { Spinner } from "@/components/spinner";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

const MaterialsPage = () => {
  const materials = useQuery(api.materials.getSidebar);
  const { material } = useOnOpenMaterial();
  const bulkDelete = useMutation(api.materials.bulkRemove);

  const handleDelete = (ids: Id<"materials">[]) => {
    const promise = bulkDelete({ ids });

    setTimeout(() => {
      toast.promise(promise, {
        loading: "Deleting materials...",
        success: "Materials deleted successfully",
        error: "Failed to delete materials",
      });
    }, 200);
  };

  return (
    <div className="h-full flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 mt-14">
      {/* <MaterialList /> */}
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">My Materials</h1>
        <div className="ml-auto">
          <div className="flex justify-center items-center gap-2">
          {material && <EditMaterialSheet initialData={material} />}
          <NewMaterialSheet />
          </div>
          
        </div>
      </div>

      {materials ? (
        <DataTable
          columns={columns}
          data={materials}
          filterKey="title"
          onDelete={(rows) => {
            const ids = rows.map((row) => row.original._id);
            handleDelete(ids);
          }}
          categoryColumn="category"
          fragrancePyramidColumn="fragrancePyramid"
        />
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default MaterialsPage;
