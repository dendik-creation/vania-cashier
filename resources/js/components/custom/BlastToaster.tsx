import toast from "react-hot-toast";

const BlastToaster = (type: "success" | "error", message: string) => {
    if (type === "success") {
        toast.success(message, {
            duration: 3000,
            style: {
                background: "#C8E6C9",
                color: "#222",
                boxShadow: "0 4px 16px rgba(76,175,80,0.10)",
                border: "1px solid #A5D6A7",
                zIndex: 1000,
            },
        });
    } else if (type === "error") {
        toast.error(message, {
            duration: 3000,
            style: {
                background: "#FFCDD2",
                color: "#222",
                boxShadow: "0 4px 16px rgba(244,67,54,0.10)",
                border: "1px solid #EF9A9A",
                zIndex: 1000,
            },
        });
    }
};

export default BlastToaster;
