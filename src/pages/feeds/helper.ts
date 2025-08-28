export const getMimeTypes = (fileType: string) => {
    const mimeTypeMap = new Map<string, string>([]);

    mimeTypeMap.set("doc", "application/msword");
    mimeTypeMap.set(
        "docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    mimeTypeMap.set("pdf", "application/pdf");
    mimeTypeMap.set("jpg", "image/jpeg");
    mimeTypeMap.set("jpeg", "image/jpeg");
    mimeTypeMap.set("png", "image/png");
    mimeTypeMap.set("gif", "image/gif");
    mimeTypeMap.set("txt", "text/plain");
    mimeTypeMap.set("csv", "text/csv");
    mimeTypeMap.set("xls", "application/vnd.ms-excel");
    mimeTypeMap.set(
        "xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    mimeTypeMap.set("ppt", "application/vnd.ms-powerpoint");
    mimeTypeMap.set(
        "pptx",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
    mimeTypeMap.set("html", "text/html");

    return mimeTypeMap.get(fileType.toLowerCase());
};
