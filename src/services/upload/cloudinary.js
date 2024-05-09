const cloudinary = require('cloudinary').v2
const config = require('../../utils/config.js');

/**
 * Configures the Cloudinary SDK with the necessary credentials.
 *
 * @param {Object} config - The configuration object containing Cloudinary credentials.
 * @param {string} config.CLOUDINARY_CLOUD_NAME - The Cloudinary cloud name.
 * @param {string} config.CLOUDINARY_API_KEY - The Cloudinary API key.
 * @param {string} config.CLOUDINARY_API_SECRET - The Cloudinary API secret.
 */

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});


/**
 * Uploads a PDF stream to Cloudinary.
 * @param {Readable} pdfStream - Readable stream containing the PDF data.
 * @returns {Promise<Object>} A promise that resolves with the Cloudinary upload result object.
 * @throws {Error} If there is an error during the upload process.
 */
function uploadToCloudinary(pdfStream) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "auto", },
      (error, result) => {
        if (error) {
          reject(error)
        }
        resolve(result)
      }
    )
    pdfStream.pipe(uploadStream)
  })
}

module.exports = { cloudinary, uploadToCloudinary }