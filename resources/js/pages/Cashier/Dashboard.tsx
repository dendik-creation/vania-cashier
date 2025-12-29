import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/Partials/PageTitle";
import React from "react";

type PageProps = PageTitleProps & {};

const CashierDashboard = ({ title, description }: PageProps) => {
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />
        </AppLayout>
    );
};

export default CashierDashboard;
