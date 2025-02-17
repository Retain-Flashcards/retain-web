export default class PDFViewerController {
    constructor(height) {
        this._takeScreenshotFunc = null;
        this.height = height;
        this.pdfUrl = '';
    }

    attach(takeScreenshotFunc) {
        this._takeScreenshotFunc = takeScreenshotFunc;
    }

    takeScreenshot(cropRect) {
        if (this._takeScreenshotFunc) {
            return this._takeScreenshotFunc(cropRect);
        }
    }
}