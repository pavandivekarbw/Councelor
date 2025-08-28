import { useCallback, useState } from "react";
import { saveAs } from "file-saver";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
// import Image from "next/image";
import { X } from "lucide-react";

type PdfModalProps = {
    docName: string;
    fileLocation: {
        documentLocation: string;
        documentName: string;
        documentStream: string;
    };
    jsonData?: string;
    onClose: () => void;
    mimeType?: string;
};

const handleDownload = (props: PdfModalProps) => {
    const baseUrl = window.location.origin;
    saveAs(
        baseUrl +
            "/" +
            props.fileLocation.documentLocation +
            "/" +
            props.fileLocation.documentName,
        props.fileLocation.documentName
    );
};

const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // This will disable the right-click context menu
};

const CustomFileViewer: React.FC<PdfModalProps> = ({
    docName = "",
    fileLocation = {
        documentLocation: "",
        documentName: "",
        documentStream: "",
    },
    jsonData = "",
    onClose = () => {},
}) => {
    const [scale, setScale] = useState<number>(1.0);

    const zoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
    const zoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));

    const renderModal = useCallback(() => {
        if (docName && fileLocation) {
            // const blob = new Blob([atob(fileLocation.documentStream)], {
            //     type: mimeType,
            // });
            // const blobUrl = URL.createObjectURL(blob);
            const baseUrl = window.location.origin;
            const fileType = (docName.split(".").pop() ?? "").toLowerCase();
            const url =
                baseUrl +
                "/" +
                fileLocation.documentLocation.split("\\").join("/") +
                "/" +
                encodeURIComponent(fileLocation.documentName);
            const docs = [
                {
                    uri: url,
                    fileType: fileType,
                    fileName: fileLocation.documentName,
                },
            ];
            if (
                fileType === "pptx" ||
                fileType === "ppt" ||
                fileType === "jpg" ||
                fileType === "jpeg" ||
                fileType === "png" ||
                fileType === "txt" ||
                fileType === "doc" ||
                fileType === "docx" ||
                fileType === "xlsx" ||
                fileType === "xls" ||
                fileType === "xlsm" ||
                fileType === "json" ||
                fileType === "edi" ||
                fileType === "pdf" ||
                fileType === "txt" ||
                fileType === "html" ||
                fileType === "htm" ||
                fileType === "bmp" ||
                fileType === "mp4" ||
                fileType === "webp"
            ) {
                return (
                    <div
                        onContextMenu={handleContextMenu}
                        className="relative w-full"
                    >
                        <DocViewer
                            key={fileLocation.documentName}
                            documents={docs}
                            pluginRenderers={DocViewerRenderers}
                            theme={{
                                secondary: "#ffffff",
                            }}
                            style={{
                                fontSize: "1rem",
                                color: "black",
                                background: "white",
                                whiteSpace: "pre-wrap",
                            }}
                            config={{
                                header: {
                                    disableHeader: true,
                                    disableFileName: true,
                                    retainURLParams: false,
                                },
                            }}
                        />
                    </div>
                );
                //     } else if (fileType === "xml") {
                //         return (
                //             <div onContextMenu={handleContextMenu}>
                //                 <XmlFileViewer
                //                     key={fileLocation.documentName}
                //                     fileUrl={docs[0].uri}
                //                     fileName={docName}
                //                 ></XmlFileViewer>
                //             </div>
                //         );
            } else if (fileType === "svg") {
                return (
                    <div onContextMenu={handleContextMenu}>
                        <div className="docViewContainer w-[41.75rem] h-[68vh] mx-auto bg-white">
                            <div className="pt-12">
                                <div className="flex flex-wrap justify-center p-6">
                                    <img
                                        src="/images/basicfile.png"
                                        width={50}
                                        height={50}
                                        alt="Basic file icon"
                                    />
                                </div>
                                <div className="flex flex-wrap justify-center p-6">
                                    Sorry! Preview is not available for this
                                    file.
                                </div>
                                <div className="flex flex-wrap justify-center p-6">
                                    <button
                                        className="addAlertBtn border-none px-5 py-2"
                                        onClick={() =>
                                            handleDownload({
                                                docName,
                                                fileLocation,
                                                onClose,
                                            })
                                        }
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        } else {
            return null;
        }
    }, [docName, fileLocation]);

    return (
        <div className="fixed inset-0 z-50 bg-transparent bg-opacity-50 flex justify-center items-center">
            <div className="relative bg-gray-700 rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>{docName}</div>
                    <button
                        className="mr-8 px-4 py-1 border rounded hover:bg-gray-100 hidden"
                        onClick={() => alert("Attach To Flow")}
                    >
                        Attach To Flow
                    </button>
                </div>

                <div className="flex-1 overflow-auto flex justify-center bg-white">
                    {!jsonData ? (
                        renderModal()
                    ) : (
                        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-black">
                            {jsonData}
                        </pre>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="items-center justify-center gap-4 p-4 border-t hidden">
                    <button
                        onClick={zoomOut}
                        className="px-3 py-1 border rounded cursor-pointer"
                        title="Zoom Out"
                    >
                        −
                    </button>
                    <span>{Math.round(scale * 100)}%</span>
                    <button
                        onClick={zoomIn}
                        className="px-3 py-1 border rounded cursor-pointer"
                        title="Zoom In"
                    >
                        +
                    </button>
                    <a
                        href={docName}
                        download
                        className="px-3 py-1 border rounded hover:bg-gray-200 cursor-pointer"
                        title="Download"
                    >
                        ⬇️
                    </a>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 text-xl"
                    title="Close"
                    aria-label="Close"
                >
                    <X className="w-6 h-6 cursor-pointer text-white" />
                </button>
            </div>
        </div>
    );
};

export default CustomFileViewer;
