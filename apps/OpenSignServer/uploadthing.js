import { createUploadthing } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    }).onUploadComplete((data) => {
        // console.log("upload completed", data);
    }),

    // Router for PDF documents
    pdfUploader: f({
        pdf: {
            maxFileSize: "16MB",
            maxFileCount: 1,
        },
    }).onUploadComplete((data) => {
        // console.log("PDF upload completed", data);
    }),
};
