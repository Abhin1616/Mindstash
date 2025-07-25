const getPublicId = (url) => {
    try {
        const afterUpload = url.split('/upload/')[1]; // skips version
        const parts = afterUpload.split('/');

        // Remove version if present
        if (parts[0].startsWith('v')) parts.shift();

        const lastSegment = parts.pop();
        const filename = lastSegment.split('.')[0]; // removes extension
        const folder = parts.length > 0 ? parts.join('/') : '';

        return folder ? `${folder}/${filename}` : filename;
    } catch (err) {
        console.error("Error extracting public ID:", err);
        return null;
    }
};
export default getPublicId;
