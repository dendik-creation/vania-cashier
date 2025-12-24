import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";

type PageProps = PageTitleProps & {};
const AdminDashboard = ({ title, description }: PageProps) => {
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />
        </AppLayout>
    );
};

export default AdminDashboard;
