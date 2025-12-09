import { ymdToIdDate } from "@/components/helper/helper";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

const AppFooter = () => {
    const [dateTime, setDateTime] = useState(
        ymdToIdDate(new Date().toISOString(), true, false, true),
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(
                ymdToIdDate(new Date().toISOString(), true, false, true),
            );
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <footer className="w-full h-10 md:h-12 lg:h-12 flex items-center justify-start bg-white border-t border-slate-200 shadow-inner text-slate-600">
            <div className="flex items-center ms-3 md:ms-4 lg:ms-6 gap-2 md:gap-3 lg:gap-4">
                <Calendar className="text-slate-500 w-4 h-4 md:w-5 md:h-5" />
                <p className="text-xs md:text-sm lg:text-base font-medium">
                    {dateTime}
                </p>
            </div>
        </footer>
    );
};

export default AppFooter;
