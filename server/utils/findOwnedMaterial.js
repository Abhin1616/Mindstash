import Material from "../models/Material.js";


const findOwnedMaterial = async (materialId, userId) => {
    return await Material.findOne({ _id: materialId, uploadedBy: userId });
};
export default findOwnedMaterial;
