import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SignoutMenu from "@/components/custom/SignoutMenu";
import { humanRole } from "@/components/helper/helper";

interface AppHeaderProps {
    classNames?: string;
    name: string;
    role: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ classNames, name, role }) => {
    return (
        <header
            className={cn(
                "w-full h-14 md:h-16 lg:h-16 flex items-center justify-between px-4 md:px-6 lg:px-8 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10",
                classNames
            )}
        >
            <div className="flex items-center gap-3 md:gap-4">
                <SidebarTrigger className="w-8 h-8 md:w-9 md:h-9" />
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 md:gap-3 cursor-pointer select-none hover:bg-slate-50 rounded-lg px-2 py-1.5 md:px-3 md:py-2 transition-colors">
                        <div className="flex text-xs md:text-sm flex-col justify-center items-end">
                            <span className="font-medium text-slate-800 truncate max-w-[120px] md:max-w-[200px]">
                                {name}
                            </span>
                            <span className="text-[10px] md:text-xs font-semibold text-slate-600 uppercase">
                                {humanRole(role)}
                            </span>
                        </div>
                        <Avatar className="border-2 border-solid transition-all border-pink-500 w-8 h-8 md:w-10 md:h-10">
                            <AvatarImage src="/assets/img/user_icon.png" />
                            <AvatarFallback className="text-xs md:text-sm bg-pink-100 text-pink-700">
                                ME
                            </AvatarFallback>
                        </Avatar>
                        <ChevronDown
                            size={14}
                            className="md:w-4 md:h-4 text-slate-600"
                        />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 md:w-56" align="end">
                    <DropdownMenuGroup>
                        {/* Custom Dropdown Menu */}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <SignoutMenu />
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
};

export default AppHeader;
