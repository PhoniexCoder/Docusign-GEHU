import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  base64ToArrayBuffer,
  decryptPdf,
  deletePdfPage,
  flattenPdf,
  getFileAsArrayBuffer,
  handleRemoveWidgets,
  reorderPdfPages
} from "../../constant/Utils";
import ModalUi from "../../primitives/ModalUi";
import { PDFDocument } from "pdf-lib";
import { maxFileSize } from "../../constant/const";
import PageReorderModal from "./PageReorderModal";

function PdfTools(props) {
  const { t } = useTranslation();
  const mergePdfInputRef = useRef(null);
  const [isDeletePage, setIsDeletePage] = useState(false);
  const [isReorderModal, setIsReorderModal] = useState(false);
  const handleDetelePage = async () => {
    props.setIsUploadPdf && props.setIsUploadPdf(true);
    try {
      const pdfupdatedData = await deletePdfPage(
        props.pdfArrayBuffer,
        props.pageNumber
      );
      if (pdfupdatedData?.totalPages === 1) {
        alert(t("delete-alert"));
      } else {
        props.setPdfBase64Url(pdfupdatedData.base64);
        props.setPdfArrayBuffer(pdfupdatedData.arrayBuffer);
        setIsDeletePage(false);
        handleRemoveWidgets(
          props.setSignerPos,
          props.signerPos,
          props.pageNumber
        );
        props.setAllPages(pdfupdatedData.remainingPages || 1);
        if (props.allPages === props.pageNumber) {
          props.setPageNumber(props.pageNumber - 1);
        } else if (props.allPages > 2) {
          props.setPageNumber(props.pageNumber);
        }
      }
    } catch (e) {
      console.log("error in delete pdf page", e);
    }
  };

  // `removeFile` is used to  remove file if exists
  const removeFile = (e) => {
    if (e) {
      e.target.value = "";
    }
  };

  const handleFileUpload = async (e) => {
    props.setIsTour && props.setIsTour(false);
    const file = e.target.files[0];
    if (!file) {
      alert(t("please-select-pdf"));
      return;
    }
    if (!file.type.includes("pdf")) {
      alert(t("only-pdf-allowed"));
      return;
    }
    const fileSize =
      maxFileSize;
    const pdfsize = file?.size;
    const fileSizeBytes = fileSize * 1024 * 1024;
    if (pdfsize > fileSizeBytes) {
      alert(`${t("file-alert-1")} ${fileSize} MB`);
      removeFile(e);
      return;
    }
    try {
      let uploadedPdfBytes = await file.arrayBuffer();
      try {
        uploadedPdfBytes = await flattenPdf(uploadedPdfBytes);
      } catch (err) {
        if (err?.message?.includes("is encrypted")) {
          try {
            const pdfFile = await decryptPdf(file, "");
            const pdfArrayBuffer = await getFileAsArrayBuffer(pdfFile);
            uploadedPdfBytes = await flattenPdf(pdfArrayBuffer);
          } catch (err) {
            if (err?.response?.status === 401) {
              const password = prompt(
                `PDF "${file.name}" is password-protected. Enter password:`
              );
              if (password) {
                try {
                  const pdfFile = await decryptPdf(file, password);
                  const pdfArrayBuffer = await getFileAsArrayBuffer(pdfFile);
                  uploadedPdfBytes = await flattenPdf(pdfArrayBuffer);
                  // Upload the file to Parse Server
                } catch (err) {
                  console.error("Incorrect password or decryption failed", err);
                  alert(t("incorrect-password-or-decryption-failed"));
                }
              } else {
                alert(t("provide-password"));
              }
            } else {
              console.log("Err ", err);
              alert(t("error-uploading-pdf"));
            }
          }
        } else {
          alert(t("error-uploading-pdf"));
        }
      }
      const uploadedPdfDoc = await PDFDocument.load(uploadedPdfBytes, {
        ignoreEncryption: true
      });
      const basePdfDoc = await PDFDocument.load(props.pdfArrayBuffer);

      // Copy pages from the uploaded PDF to the base PDF
      const uploadedPdfPages = await basePdfDoc.copyPages(
        uploadedPdfDoc,
        uploadedPdfDoc.getPageIndices()
      );
      uploadedPdfPages.forEach((page) => basePdfDoc.addPage(page));
      // Save the updated PDF
      const pdfBase64 = await basePdfDoc.saveAsBase64({
        useObjectStreams: false
      });
      const pdfBuffer = base64ToArrayBuffer(pdfBase64);
      const pdfsize = pdfBuffer?.byteLength;
      const fileSizeBytes = fileSize * 1024 * 1024;
      if (pdfsize > fileSizeBytes) {
        alert(`${t("file-alert-1")} ${fileSize} MB`);
        removeFile(e);
        return;
      }
      props.setPdfArrayBuffer(pdfBuffer);
      props.setPdfBase64Url(pdfBase64);
      props.setIsUploadPdf && props.setIsUploadPdf(true);
      mergePdfInputRef.current.value = "";
    } catch (error) {
      mergePdfInputRef.current.value = "";
      console.error("Error merging PDF:", error);
    }
  };

  const handleReorderSave = async (order) => {
    try {
      const pdfupdatedData = await reorderPdfPages(props.pdfArrayBuffer, order);
      if (pdfupdatedData) {
        props.setPdfArrayBuffer(pdfupdatedData.arrayBuffer);
        props.setPdfBase64Url(pdfupdatedData.base64);
        props.setAllPages(pdfupdatedData.totalPages);
        props.setPageNumber(1);
      }
    } catch (e) {
      console.log("error in reorder pdf pages", e);
    }
    setIsReorderModal(false);
  };

  const handleDeletePage = () => {
    setIsDeletePage(true);
    props.setIsTour && props.setIsTour(false);
  };

  const handleReorderPages = () => {
    setIsReorderModal(true);
    props.setIsTour && props.setIsTour(false);
  };

  const handleZoomIn = () => {
    props.clickOnZoomIn();
    props.setIsTour && props.setIsTour(false);
  };
  const handleZoomOut = () => {
    props.clickOnZoomOut();
    props.setIsTour && props.setIsTour(false);
  };
  const handleRotate = () => {
    props.handleRotationFun(90);
    props.setIsTour && props.setIsTour(false);
  };
  const handleAntiRotate = () => {
    props.handleRotationFun(-90);
    props.setIsTour && props.setIsTour(false);
  };
  return (
    <>
      <div
        data-tut="pdftools"
        className={`hidden md:flex flex-row gap-2 items-center z-40 p-2 rounded-2xl bg-base-100/90 backdrop-blur-md shadow-lg border border-base-200 transition-all duration-300 ${props.className || "absolute top-4 left-1/2 -translate-x-1/2"}`}
      >
        {!props.isDisableEditTools && (
          <div className="flex flex-row gap-1 pr-2 border-r border-base-200 h-full items-center">
            <div
              className="tooltip tooltip-bottom"
              data-tip={t("add-pages")}
            >
              <button
                className="op-btn op-btn-ghost op-btn-sm op-btn-circle"
                onClick={() => mergePdfInputRef.current.click()}
              >
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  ref={mergePdfInputRef}
                  onChange={handleFileUpload}
                />
                <i className="fa-light fa-plus text-base-content text-lg"></i>
              </button>
            </div>

            <div
              className="tooltip tooltip-bottom"
              data-tip={t("delete-page")}
            >
              <button
                className="op-btn op-btn-ghost op-btn-sm op-btn-circle"
                onClick={handleDeletePage}
              >
                <i className="fa-light fa-trash text-base-content text-lg"></i>
              </button>
            </div>

            <div
              className="tooltip tooltip-bottom"
              data-tip={t("reorder-pages")}
            >
              <button
                className="op-btn op-btn-ghost op-btn-sm op-btn-circle"
                onClick={handleReorderPages}
              >
                <i className="fa-light fa-list-ol text-base-content text-lg"></i>
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-row gap-1 items-center">
          <div
            className="tooltip tooltip-bottom"
            data-tip={t("zoom-in")}
          >
            <button
              className="op-btn op-btn-ghost op-btn-sm op-btn-circle"
              onClick={handleZoomIn}
            >
              <i className="fa-light fa-magnifying-glass-plus text-base-content text-lg"></i>
            </button>
          </div>

          <div
            className="tooltip tooltip-bottom"
            data-tip={t("zoom-out")}
          >
            <button
              className="op-btn op-btn-ghost op-btn-sm op-btn-circle"
              onClick={handleZoomOut}
            >
              <i className="fa-light fa-magnifying-glass-minus text-base-content text-lg"></i>
            </button>
          </div>

          {!props.isDisableEditTools && (
            <>
              <div
                className="tooltip tooltip-bottom"
                data-tip={t("rotate-right")}
              >
                <button
                  className="op-btn op-btn-ghost op-btn-sm op-btn-circle"
                  onClick={handleRotate}
                >
                  <i className="fa-light fa-rotate-right text-base-content text-lg"></i>
                </button>
              </div>

              <div
                className="tooltip tooltip-bottom"
                data-tip={t("rotate-left")}
              >
                <button
                  className="op-btn op-btn-ghost op-btn-sm op-btn-circle"
                  onClick={handleAntiRotate}
                >
                  <i className="fa-light fa-rotate-left text-base-content text-lg"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ModalUi
        isOpen={isDeletePage}
        title={t("delete-page")}
        handleClose={() => setIsDeletePage(false)}
      >
        <div className="h-[100%] p-[20px]">
          <p className="font-medium text-base-content">{t("delete-alert-2")}</p>
          <p className="pt-3 text-base-content">{t("delete-note")}</p>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <button
            onClick={() => handleDetelePage()}
            type="button"
            className="op-btn op-btn-primary"
          >
            {t("yes")}
          </button>
          <button
            onClick={() => setIsDeletePage(false)}
            type="button"
            className="op-btn op-btn-ghost text-base-content ml-1"
          >
            {t("no")}
          </button>
        </div>
      </ModalUi>
      <PageReorderModal
        isOpen={isReorderModal}
        handleClose={() => setIsReorderModal(false)}
        totalPages={props.allPages}
        onSave={handleReorderSave}
      />
    </>
  );
}

export default PdfTools;
