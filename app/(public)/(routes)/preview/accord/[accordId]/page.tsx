"use client";

import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { AccordPage } from "@/components/accord-page";

interface DocumentIdPageProps {
  params: {
    accordId: Id<"accords">;
  };
}

const AccordIdPage = ({ params }: DocumentIdPageProps) => {
  const accord = useQuery(api.accords.getAccordById, {
    accordId: params.accordId,
  });

  if (accord === undefined) {
    return (
      <div>
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (accord === null) {
    return <div>Accord not found</div>;
  }

  return (
    <div className="pb-40 ">
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <AccordPage initialData={accord} preview={true} />
      </div>
    </div>
  );
};

export default AccordIdPage;