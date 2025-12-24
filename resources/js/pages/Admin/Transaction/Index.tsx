import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import { PaginationData } from "@/types/global";
import { Transaction } from "@/types/transaction";

type PageProps = PageTitleProps & {
    transactions: PaginationData<Transaction>;
    filters: {
        by_search: string;
        by_customer_type: string;
        by_payment_method: string;
        by_start_date: string;
        by_end_date: string;
    };
};

const AdminTransactionIndex = ({
    title,
    description,
    transactions,
    filters,
}: PageProps) => {
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />
        </AppLayout>
    );
};
export default AdminTransactionIndex;
