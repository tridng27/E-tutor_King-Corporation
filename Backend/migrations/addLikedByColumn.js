const { Sequelize } = require('sequelize');
const dbConfig = require('../config/Database');

// Create a new Sequelize instance with the correct configuration
const sequelize = dbConfig; // Use the existing sequelize instance from your config

const addLikedByColumn = async () => {
  try {
    console.log('Checking if LikedBy column exists...');
    
    // Check if the column exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Posts' AND column_name='LikedBy'
    `);
    
    if (results.length === 0) {
      console.log('LikedBy column does not exist. Adding it...');
      
      // Column doesn't exist, add it
      await sequelize.query(`
        ALTER TABLE "Posts" 
        ADD COLUMN "LikedBy" BIGINT[] DEFAULT ARRAY[]::BIGINT[]
      `);
      
      console.log('✅ Added LikedBy column to Posts table');
    } else {
      console.log('✅ LikedBy column already exists');
      
      // Check a sample post to see the current state of LikedBy
      const [posts] = await sequelize.query(`
        SELECT "PostID", "LikedBy" FROM "Posts" LIMIT 1
      `);
      
      if (posts.length > 0) {
        console.log('Sample post LikedBy value:', posts[0].LikedBy);
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

// Run the migration
addLikedByColumn();
