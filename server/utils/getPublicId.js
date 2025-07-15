const getPublicId = (url) => {
    if (!url) return null;
    return url.split('/').pop().split('.')[0];
};
export default getPublicId;
