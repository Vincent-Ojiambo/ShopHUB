import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  name: string;
  image: string;
  itemCount: number;
  href: string;
}

export const CategoryCard = ({ name, image, itemCount, href }: CategoryCardProps) => {
  return (
    <Link to={href}>
      <Card className="group overflow-hidden border border-border hover:shadow-[var(--shadow-hover)] transition-[box-shadow] duration-300 cursor-pointer">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-bold text-lg mb-1">{name}</h3>
            <p className="text-sm text-white/90">{itemCount} items</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};