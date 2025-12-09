import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { useEffect } from "react";

export type PageTitleProps = {
    title?: string;
    description?: string;
};

export const PageTitle = ({ title, description }: PageTitleProps) => {
    const pathname = window.location.pathname;

    useEffect(() => {
        document.title = title || "CV Sri Slamet";
    }, [title]);

    return (
        <>
            <div className="flex justify-start items-start md:items-center gap-3 md:gap-4 lg:gap-5 mb-4 md:mb-5 lg:mb-6">
                {!pathname.includes("dashboard") &&
                    pathname.split("/").length > 1 && (
                        <Button
                            onClick={() => window.history.back()}
                            className="h-9 w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 shrink-0"
                            size={"icon"}
                            variant={"outline"}
                        >
                            <ChevronLeftIcon className="text-gray-800 w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                    )}
                <div className="flex flex-col gap-0.5 md:gap-1 min-w-0">
                    <h2 className="font-semibold text-xl md:text-2xl lg:text-3xl text-slate-900 truncate">
                        {title}
                    </h2>
                    {description && (
                        <span className="text-slate-600 text-xs md:text-sm lg:text-base line-clamp-2 md:line-clamp-1">
                            {description}
                        </span>
                    )}
                </div>
            </div>
        </>
    );
};
