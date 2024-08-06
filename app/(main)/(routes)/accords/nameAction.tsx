import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

type Props = {
  id: Id<"accords">;
};

export const NameAction = ({ id }: Props) => {
  const accord = useQuery(api.accords.getAccordById, { accordId: id });
  const router = useRouter();
  const onRedirect = (accordId: string) => {
    router.push(`/accords/${accordId}`);
  };

  return (
    <div
      className="hover:cursor-pointer font-medium"
      onClick={() => accord && onRedirect(id)}
    >
      {accord?.title}
    </div>
  );
};
