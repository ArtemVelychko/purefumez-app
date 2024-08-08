import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

type Props = {
  id: Id<"formulas">;
};

export const NameAction = ({ id }: Props) => {
  const formula = useQuery(api.formulas.getFormulaById, { formulaId: id });
  const router = useRouter();
  const onRedirect = (formulaId: string) => {
    router.push(`/formulas/${formulaId}`);
  };

  return (
    <div
      className="hover:cursor-pointer font-medium"
      onClick={() => formula && onRedirect(id)}
    >
      {formula?.title}
    </div>
  );
};
