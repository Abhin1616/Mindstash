const getDownloadUrl = (program, branch, semester, fileUrl) => {
    try {
        if (!fileUrl.includes('/upload/')) return fileUrl;

        const [prefix, suffix] = fileUrl.split('/upload/');

        // Replace periods with hyphens
        const safeProgram = program.replace(/\./g, '-');
        const safeBranch = branch.replace(/\./g, '-');

        const filename = `${safeProgram}_${safeBranch}_${semester}_notes`; // no extension
        return `${prefix}/upload/fl_attachment:${filename}/${suffix}`;
    } catch (err) {
        console.error('Invalid file URL:', err);
        return fileUrl;
    }
};

export default getDownloadUrl;