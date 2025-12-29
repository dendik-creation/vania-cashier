import React, { FormEvent } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader } from "lucide-react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import BlastToaster from "./BlastToaster";

registerPlugin(FilePondPluginFileValidateType);

type ModalImportProps = {
    title: string;
    description: string;
    triggerNode: React.ReactNode;
    onSubmit: (e: FormEvent) => void;
    exampleFile: string;
    file?: File | null;
    onFileChange: (file: File | null) => void;
    isImporting: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

const ModalImport = ({
    title,
    description,
    triggerNode,
    onSubmit,
    exampleFile,
    file,
    onFileChange = () => {},
    isImporting,
    open = false,
    onOpenChange = () => {},
}: ModalImportProps) => {
    const handleDownloadExample = async () => {
        try {
            const fileName =
                exampleFile.substring(exampleFile.lastIndexOf("/") + 1) ||
                "template.xlsx";
            const response = await fetch(
                new URL(exampleFile, window.location.origin).toString()
            );
            if (!response.ok) throw new Error("File not found");
            const blob = await response.blob();

            const saveWithFilePicker = async () => {
                // @ts-ignore
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [
                        {
                            description: "Excel Files",
                            accept: {
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                                    [".xlsx"],
                                "application/vnd.ms-excel": [".xls"],
                            },
                        },
                    ],
                });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
            };

            const saveWithAnchor = () => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                link.remove();
            };

            // @ts-ignore
            if (window.showSaveFilePicker) {
                await saveWithFilePicker();
            } else {
                saveWithAnchor();
            }

            setTimeout(() => {
                BlastToaster("success", "File berhasil diunduh");
            }, 1000);
        } catch (error) {
            console.error("Error downloading file : ", error);
        }
    };
    return (
        <Dialog open={open || isImporting} onOpenChange={onOpenChange}>
            <DialogTrigger className="w-full">
                <span>{triggerNode}</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="mb-3">
                        {description}
                    </DialogDescription>
                    <div className="flex flex-col gap-3">
                        <Button
                            type="button"
                            variant={"green"}
                            size={"sm"}
                            className="flex items-center gap-2"
                            onClick={handleDownloadExample}
                        >
                            <Download />
                            <span>Unduh format XLSX</span>
                        </Button>
                        <FilePond
                            allowProcess={true}
                            files={file ? [file] : []}
                            onupdatefiles={(fileItems) => {
                                const selectedFile =
                                    fileItems.length > 0
                                        ? fileItems[0].file
                                        : null;
                                onFileChange(selectedFile as File | null);
                            }}
                            allowMultiple={false}
                            acceptedFileTypes={[
                                "application/vnd.ms-excel",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            ]}
                            labelIdle='<span class="filepond--label-action">Cari File Excel</span>'
                        />
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild disabled={isImporting}>
                        <Button
                            type="button"
                            disabled={isImporting}
                            variant="outline"
                        >
                            Batalkan
                        </Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        onClick={onSubmit}
                        disabled={isImporting || !file}
                        variant={"yellow"}
                    >
                        {isImporting ? (
                            <Loader className="animate-spin" />
                        ) : (
                            <span>Import</span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ModalImport;
