import { generateUploadButton, generateUploadDropzone, generateReactHelpers } from "@uploadthing/react";

// Point to the backend URL where the route handler is mounted
const SERVER_URL = import.meta.env.VITE_APPID ? 'http://localhost:8080' : 'http://localhost:8080';

export const { useUploadThing, uploadFiles } = generateReactHelpers({
    url: `${SERVER_URL}/api/uploadthing`,
});

export const UploadButton = generateUploadButton({
    url: `${SERVER_URL}/api/uploadthing`,
});

export const UploadDropzone = generateUploadDropzone({
    url: `${SERVER_URL}/api/uploadthing`,
});
