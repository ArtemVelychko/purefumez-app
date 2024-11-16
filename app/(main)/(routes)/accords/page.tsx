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

interface AccordListProps {
  data?: Doc<"accords">[];
}

const AccordsPage = () => {
  const create = useMutation(api.accords.createAccord);
  const bulkDelete = useMutation(api.accords.bulkRemoveAccords);

  const onCreate = () => {
    const promise = create({ title: "Untitled" });

    toast.promise(promise, {
      loading: "Creating a new accord...",
      success: "Accord created successfully",
      error: "Failed to create accord",
    });
  };

  const accords = useQuery(api.accords.getAccordsSidebar);

  const handleDelete = (ids: Id<"accords">[]) => {
    const promise = bulkDelete({ ids });

    setTimeout(() => {
      toast.promise(promise, {
        loading: "Deleting accords...",
        success: "Accords deleted successfully",
        error: "Failed to delete accords",
      });
    }, 200);
  };

  return (
    <div className="h-full flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 mt-14">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">My Accords</h1>
        <div className="ml-auto">
          <Button onClick={onCreate} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create an accord
          </Button>
        </div>
      </div>
      {accords ? (
        <DataTable
          columns={columns}
          data={accords}
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

export default AccordsPage;

