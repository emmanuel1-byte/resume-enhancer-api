const PDFParser = require("pdf-parse");
const removeMarkdown = require("markdown-to-text").default;
const axios = require("axios").default;
const model = require("../../services/ai/gemini");
const respository = require("./repository");
const config = require("../../utils/config");
const resumeSchemaParam = require("./schema");
const respond = require("../../utils/respond");;
const createAndUploadPdf = require("./pdf");

/**
 * Enhances a resume by parsing, generating content, and uploading to Cloudinary.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves once the enhancement process is completed.
 */
async function enhanceResume(req, res, next) {
  try {
    const resumeBuffer = req.file.buffer;
    const parsedPdf = await PDFParser(resumeBuffer);
    const enhancedContent = await model.generateContent(config.GEMINI_PROMPT + parsedPdf.text);
    const resume = removeMarkdown(enhancedContent.response.text());
    createAndUploadPdf(res, resume)
  } catch (err) {
    next(err)
  }
}

/**
 * Previews a resume by its ID.
 *
 * @param {Object} req - The HTTP request object.
 * @param {string} req.params.resumeId - The ID of the resume to preview.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A Promise that resolves when the resume preview is sent.
 */
async function previewResume(req, res, next) {
  try {
    const requestParam = await resumeSchemaParam.validateAsync(req.params);
    const resume = await respository.findResume(requestParam.resumeId);
    if (!resume) return respond(res, 404, "Resume not found")
    return respond(res, 200, { resume })
  } catch (err) {
    next(err)
  }
}

/**
 * Deletes a resume from the system.
 *
 * @param {Object} req - The HTTP request object.
 * @param {string} req.params.resumeId - The ID of the resume to delete.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<Object>} - A JSON response indicating the success or failure of the operation.
 */
async function deleteResume(req, res, next) {
  try {
    const requestParam = await resumeSchemaParam.validateAsync(req.params);
    const resume = await respository.deleteResume(requestParam.resumeId);
    if (!resume) return respond(res, 404, "Resume not found")
    return respond(res, 200, "Resume deleted successfully")
  } catch (err) {
    next(err)
  }
}

/**
 * Downloads a resume from a given URL and sends it as an attachment in the response.
 *
 * @param {Object} req - The Express request object.
 * @param {string} req.params.resumeId - The ID of the resume to download.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A Promise that resolves when the resume has been downloaded and sent in the response.
 */
async function downloadResume(req, res, next) {
  try {
    const requestParam = await resumeSchemaParam.validateAsync(req.params);
    const resume = await respository.findResume(requestParam.resumeId);
    if (!resume) return respond(res, 404, "Resume not found")
    const response = await axios.get(resume.resume_url, { responseType: "stream" });
    if (!response) return respond(res, 400, "Download was'nt succesfull")
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
    res.setHeader("Content-Type", "application/pdf");
    response.data.pipe(res);
  } catch (err) {
    next(err)
  }
}

module.exports = { enhanceResume, previewResume, deleteResume, downloadResume };
