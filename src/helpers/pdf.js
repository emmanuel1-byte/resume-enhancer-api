const { Readable } = require("stream");
const PDFDOCUMENT = require("pdfkit");
const respository = require("../modules/resume-enhancement/repository");
const { uploadToCloudinary } = require("../services/upload/cloudinary");
const logger = require("../utils/logger");


/**
 * Converts an array of data chunks into a readable stream.
 * @param {Buffer[]} data - An array of data chunks.
 * @returns {Readable} A readable stream containing the concatenated data.
 */
function streamOperation(data) {
    const pdfBuffer = Buffer.concat(data);
    const pdfStream = new Readable();
    pdfStream.push(pdfBuffer);
    pdfStream.push(null);
    return pdfStream
}



/**
 * Creates a PDF document from the provided resume text.
 * @param {string} resume - The resume text.
 * @returns {Promise<Buffer[]>} A promise that resolves with an array of data chunks representing the PDF content.
 */
function createPdf(resume) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDOCUMENT();
        const chunks = [];

        doc.on("data", (chunk) => { chunks.push(chunk) });
        doc.on('end', () => resolve(chunks));
        doc.on('error', (err) => reject(err));

        doc.text(resume);
        doc.end();
    });
}


/**
 * Creates and uploads a PDF document to Cloudinary.
 * @param {Object} res - The response object.
 * @param {string} resume - The resume text.
 * @returns {Promise<void>} A promise that resolves once the upload is completed.
 */
async function createAndUploadPdf(resume) {
    try {
        const chunks = await createPdf(resume)
        const pdfStream = streamOperation(chunks)
        const cloudinaryUpload = await uploadToCloudinary(pdfStream)
        return await respository.create(cloudinaryUpload.secure_url);
    } catch (err) {
        logger.error(err.message)
    }
}

module.exports = createAndUploadPdf