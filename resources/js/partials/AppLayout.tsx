import { ReactNode, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import AppHeader from "@/partials/AppHeader";
import AppFooter from "@/partials/AppFooter";
import AppSidebar from "@/partials/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePage } from "@inertiajs/react";
import BlastToaster from "@/components/custom/BlastToaster";

interface AppLayoutProps {
    children: ReactNode;
    className?: string;
}

export const useInertiaShared = () => {
    const { flash } = usePage().props as any;
    return { flash };
};

export default function AppLayout({ children, className }: AppLayoutProps) {
    const { flash } = useInertiaShared();

    useEffect(() => {
        if (flash?.success) {
            BlastToaster("success", flash?.success);
        } else if (flash?.error) {
            BlastToaster("error", flash?.error);
        }
    }, []);

    return (
        <SidebarProvider>
            <Toaster
                position={"top-center"}
                toastOptions={{
                    className: "text-sm md:text-base",
                    duration: 3000,
                }}
            />
            <div
                className={`flex min-h-screen w-full bg-slate-50 ${className}`}
            >
                <AppSidebar role={flash?.user?.role as string} />
                <div className="flex flex-col w-full min-w-0">
                    <AppHeader
                        name={flash?.user?.name}
                        role={flash?.user?.role}
                    />
                    <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50 overflow-y-auto overflow-x-hidden">
                        <div className="max-w-full mx-auto">{children}</div>
                    </main>
                    {/*<AppFooter />*/}
                </div>
            </div>
        </SidebarProvider>
    );
}
