import React from 'react';
import { UploadButton } from '../utils/uploadthing';
import "@uploadthing/react/styles.css";

const UploadThingButton = ({ onUploadComplete, onUploadError, endpoint = "imageUploader" }) => {
    return (
        <div className='flex flex-col items-center justify-center p-4'>
            <UploadButton
                endpoint={endpoint}
                onClientUploadComplete={(res) => {
                    // Do something with the response
                    // console.log("Files: ", res);
                    if (res && res.length > 0) {
                        onUploadComplete(res);
                    }
                }}
                onUploadError={(error) => {
                    // Do something with the error.
                    console.error(`ERROR! ${error.message}`);
                    if (onUploadError) onUploadError(error);
                }}
            />
        </div>
    );
};

export default UploadThingButton;
