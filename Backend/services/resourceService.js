const Resource = require("../models/resource");
const Tutor = require("../models/tutor");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");

// Create a new resource
const createResource = async (resourceData, file, tutorId) => {
  try {
    let filePath = null;
    
    if (file) {
      // Create uploads/resources directory if it doesn't exist
      const uploadDir = path.join(__dirname, "../uploads/resources");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Generate unique filename
      const uniqueFilename = `${Date.now()}-${file.originalname}`;
      filePath = `/uploads/resources/${uniqueFilename}`;
      
      // Save file to disk
      fs.writeFileSync(path.join(__dirname, "..", filePath), file.buffer);
    }
    
    // Create resource in database
    const resource = await Resource.create({
      TutorID: tutorId,
      Name: resourceData.title,
      Description: resourceData.description,
      FilePath: filePath,
      UploadDate: new Date()
    });
    
    return resource;
  } catch (error) {
    console.error("Error creating resource:", error);
    throw error;
  }
};

// Get all resources
const getAllResources = async () => {
  try {
    const resources = await Resource.findAll({
      include: [
        {
          model: Tutor,
          include: [
            {
              model: User,
              attributes: ["Name"]
            }
          ]
        }
      ],
      order: [["UploadDate", "DESC"]]
    });
    
    // Transform data for frontend
    return resources.map(resource => ({
      id: resource.ResourceID,
      title: resource.Name,
      description: resource.Description,
      tutorId: resource.TutorID,
      // If TutorID is null, it was created by an admin
      tutorName: resource.TutorID === null ? "Admin (System)" : (resource.Tutor?.User?.Name || "Unknown"),
      uploadDate: resource.UploadDate,
      hasResource: !!resource.FilePath
    }));
  } catch (error) {
    console.error("Error getting resources:", error);
    throw error;
  }
};

// Get resource by ID
// Get resource by ID
const getResourceById = async (resourceId) => {
  try {
    const resource = await Resource.findByPk(resourceId, {
      include: [
        {
          model: Tutor,
          include: [
            {
              model: User,
              attributes: ["Name"]
            }
          ]
        }
      ]
    });
    
    if (!resource) {
      throw new Error("Resource not found");
    }
    
    // Transform data for frontend
    return {
      id: resource.ResourceID,
      title: resource.Name,
      description: resource.Description,
      tutorId: resource.TutorID,
      // Check if TutorID is null - this means it was created by an admin
      tutorName: resource.TutorID === null ? "Admin (System)" : (resource.Tutor?.User?.Name || "Unknown"),
      uploadDate: resource.UploadDate,
      filePath: resource.FilePath,
      hasResource: !!resource.FilePath
    };
  } catch (error) {
    console.error("Error getting resource:", error);
    throw error;
  }
};

// Update resource
const updateResource = async (resourceId, resourceData, file, tutorId) => {
  try {
    const resource = await Resource.findByPk(resourceId);
    
    if (!resource) {
      throw new Error("Resource not found");
    }
    
    // Check if user is authorized to update this resource
    if (resource.TutorID !== tutorId && tutorId !== "admin") {
      throw new Error("Unauthorized to update this resource");
    }
    
    let filePath = resource.FilePath;
    
    // If a new file is uploaded, update the file
    if (file) {
      // Delete old file if it exists
      if (resource.FilePath) {
        const oldFilePath = path.join(__dirname, "..", resource.FilePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Create uploads/resources directory if it doesn't exist
      const uploadDir = path.join(__dirname, "../uploads/resources");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Generate unique filename
      const uniqueFilename = `${Date.now()}-${file.originalname}`;
      filePath = `/uploads/resources/${uniqueFilename}`;
      
      // Save file to disk
      fs.writeFileSync(path.join(__dirname, "..", filePath), file.buffer);
    }
    
    // Update resource in database
    await resource.update({
      Name: resourceData.title,
      Description: resourceData.description,
      FilePath: filePath
    });
    
    return await getResourceById(resourceId);
  } catch (error) {
    console.error("Error updating resource:", error);
    throw error;
  }
};

// Delete resource
const deleteResource = async (resourceId, tutorId) => {
  try {
    const resource = await Resource.findByPk(resourceId);
    
    if (!resource) {
      throw new Error("Resource not found");
    }
    
    // Check if user is authorized to delete this resource
    if (resource.TutorID !== tutorId && tutorId !== "admin") {
      throw new Error("Unauthorized to delete this resource");
    }
    
    // Delete file if it exists
    if (resource.FilePath) {
      const filePath = path.join(__dirname, "..", resource.FilePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete resource from database
    await resource.destroy();
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
};

module.exports = {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource
};
