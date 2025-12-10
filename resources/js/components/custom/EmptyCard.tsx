import { Card, CardContent } from "../ui/card";
import { SearchXIcon } from "lucide-react";

type EmptyCardProps = {
    message?: string;
};

const EmptyCard = ({ message }: EmptyCardProps) => {
    return (
        <Card className="relative py-3 overflow-hidden md:col-span-2 lg:col-span-3 xl:col-span-4">
            <CardContent className="px-3 w-full h-full flex flex-col items-center justify-center gap-3">
                <SearchXIcon size={24} className="text-red-400" />
                <span>{message || "Data tidak ada"}</span>
            </CardContent>
        </Card>
    );
};

export default EmptyCard;
