import { useOnOpenMaterial } from "@/hooks/materials/use-on-open-material";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  id: Id<"materials">;
};

export const NameAction = ({ id }: Props) => {
  const { onOpen } = useOnOpenMaterial();
  const material = useQuery(api.materials.getById, { materialId: id });

  return (
    <div
      className="hover:cursor-pointer font-medium"
      onClick={() => material && onOpen(material)}
    >
      {material?.title}
    </div>
  );
};
