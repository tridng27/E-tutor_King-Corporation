const resourceService = require("../services/resourceService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Tutor = require("../models/tutor");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single("pdfFile");

// Create a new resource
// Create a new resource
const createResource = (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ message: "File upload error", error: err.message });
      }
      
      console.log("Request body:", req.body);
      console.log("File data:", req.file);
      
      // Get tutor ID from user
      let tutorId = null; // Default to null for admin users
      
      if (req.user.Role === "Admin") {
        // Leave tutorId as null for admin users
        // Or you could set it to a specific admin ID if needed
        // tutorId = 0; // Special ID for admin-created resources
      } else if (req.user.Role === "Tutor") {
        // Find tutor record for this user
        const tutor = await Tutor.findOne({ where: { UserID: req.user.UserID } });
        if (!tutor) {
          return res.status(403).json({ message: "No tutor record found for this user" });
        }
        tutorId = tutor.TutorID;
      } else {
        return res.status(403).json({ message: "Only tutors and admins can create resources" });
      }
      
      const resource = await resourceService.createResource(
        {
          title: req.body.title,
          description: req.body.description
        },
        req.file,
        tutorId
      );
      
      res.status(201).json({
        message: "Resource created successfully",
        resource: {
          id: resource.ResourceID,
          title: resource.Name,
          description: resource.Description,
          tutorId: resource.TutorID,
          uploadDate: resource.UploadDate,
          hasResource: !!resource.FilePath
        }
      });
    } catch (error) {
      console.error("Error in createResource controller:", error);
      res.status(500).json({ message: "Failed to create resource", error: error.message });
    }
  });
};

// Get all resources
const getAllResources = async (req, res) => {
  try {
    const resources = await resourceService.getAllResources();
    res.status(200).json(resources);
  } catch (error) {
    console.error("Error in getAllResources controller:", error);
    res.status(500).json({ message: "Failed to get resources", error: error.message });
  }
};

// Get resource by ID
const getResourceById = async (req, res) => {
  try {
    const resourceId = req.params.id;
    const resource = await resourceService.getResourceById(resourceId);
    res.status(200).json(resource);
  } catch (error) {
    console.error("Error in getResourceById controller:", error);
    if (error.message === "Resource not found") {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.status(500).json({ message: "Failed to get resource", error: error.message });
  }
};

// Update resource
// Update resource
const updateResource = (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ message: "File upload error", error: err.message });
      }
      
      const resourceId = req.params.id;
      
      // Get tutor ID from user
      let tutorId = null; // Default to null for admin users
      
      if (req.user.Role === "Admin") {
        // For admin users, use a special identifier that's not a string
        tutorId = "admin"; // This is fine for authorization checks, but not for DB insertion
      } else if (req.user.Role === "Tutor") {
        // Find tutor record for this user
        const tutor = await Tutor.findOne({ where: { UserID: req.user.UserID } });
        if (!tutor) {
          return res.status(403).json({ message: "No tutor record found for this user" });
        }
        tutorId = tutor.TutorID;
      } else {
        return res.status(403).json({ message: "Only tutors and admins can update resources" });
      }
      
      const resource = await resourceService.updateResource(
        resourceId,
        {
          title: req.body.title,
          description: req.body.description
        },
        req.file,
        tutorId
      );
      
      res.status(200).json({
        message: "Resource updated successfully",
        resource
      });
    } catch (error) {
      console.error("Error in updateResource controller:", error);
      if (error.message === "Resource not found") {
        return res.status(404).json({ message: "Resource not found" });
      }
      if (error.message === "Unauthorized to update this resource") {
        return res.status(403).json({ message: "You can only update your own resources" });
      }
      res.status(500).json({ message: "Failed to update resource", error: error.message });
    }
  });
};

// Delete resource
const deleteResource = async (req, res) => {
  try {
    const resourceId = req.params.id;
    
    // Get tutor ID from user
    let tutorId;
    if (req.user.Role === "Admin") {
      tutorId = "admin";
    } else if (req.user.Role === "Tutor") {
      // Find tutor record for this user
      const tutor = await Tutor.findOne({ where: { UserID: req.user.UserID } });
      if (!tutor) {
        return res.status(403).json({ message: "No tutor record found for this user" });
      }
      tutorId = tutor.TutorID;
    } else {
      return res.status(403).json({ message: "Only tutors and admins can delete resources" });
    }
    
    await resourceService.deleteResource(resourceId, tutorId);
    
    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error in deleteResource controller:", error);
    if (error.message === "Resource not found") {
      return res.status(404).json({ message: "Resource not found" });
    }
    if (error.message === "Unauthorized to delete this resource") {
      return res.status(403).json({ message: "You can only delete your own resources" });
    }
    res.status(500).json({ message: "Failed to delete resource", error: error.message });
  }
};

// Download resource
const downloadResource = async (req, res) => {
  try {
    const resourceId = req.params.id;
    const resource = await resourceService.getResourceById(resourceId);
    
    if (!resource.filePath) {
      return res.status(404).json({ message: "No file available for this resource" });
    }
    
    const filePath = path.join(__dirname, "..", resource.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error("Error in downloadResource controller:", error);
    if (error.message === "Resource not found") {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.status(500).json({ message: "Failed to download resource", error: error.message });
  }
};

module.exports = {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
  downloadResource
};
