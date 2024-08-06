"use client";

import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialForm } from "@/components/material-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";

interface MaterialIdPageProps {
  params: {
    materialId: Id<"materials">;
  };
}

const DocumentIdPage = ({ params }: MaterialIdPageProps) => {
  const { userId, isSignedIn } = useAuth();

  const material = useQuery(api.materials.getById, {
    materialId: params.materialId,
  });

  const notAuthor = material?.userId !== userId;
  const isSignedUser = isSignedIn;

  if (material === undefined) {
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

  if (material === null) {
    return <div>Document not found</div>;
  }

  return (
    <div className="pb-40">
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Button>{"<-"}</Button>
        <MaterialForm
          initialData={material}
          preview={notAuthor}
          isSignedUser={isSignedUser}
        />
      </div>
    </div>
  );
};

export default DocumentIdPage;
