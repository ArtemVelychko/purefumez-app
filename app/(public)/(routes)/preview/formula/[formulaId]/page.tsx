"use client";

import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { FormulaPage } from "@/components/formula-page";

interface FormulaPreviewPageProps {
  params: {
    formulaId: Id<"formulas">;
  };
}

const FormulaPreviewPage = ({ params }: FormulaPreviewPageProps) => {
  const sharedFormula = useQuery(api.formulas.getFormulaById, {
    formulaId: params.formulaId,
  });

  if (sharedFormula === undefined) {
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

  if (sharedFormula === null) {
    return <div>Formula not found or not published</div>;
  }

  return (
    <div className="pb-40">
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <FormulaPage 
          preview 
          initialData={sharedFormula}
        />
      </div>
    </div>
  );
};

export default FormulaPreviewPage;