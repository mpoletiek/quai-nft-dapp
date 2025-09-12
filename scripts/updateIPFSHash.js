const fs = require('fs');
const path = require('path');

// IPFS hash to use
const IPFS_HASH = 'Qmc2qFt9Qx68F7ZgfpLRBdtsURgtCXbsAHD95AVgMP1gFY';

// Path to metadata directory
const metadataDir = path.join(__dirname, '..', 'NFTData', 'metadata_json');

console.log('Starting IPFS hash update...');
console.log(`Using IPFS hash: ${IPFS_HASH}`);
console.log(`Metadata directory: ${metadataDir}`);

// Check if metadata directory exists
if (!fs.existsSync(metadataDir)) {
  console.error(`Error: Metadata directory not found at ${metadataDir}`);
  process.exit(1);
}

// Get all JSON files in the metadata directory
const jsonFiles = fs.readdirSync(metadataDir)
  .filter(file => file.endsWith('.json'))
  .sort((a, b) => {
    // Sort numerically by token ID
    const aId = parseInt(a.replace('.json', ''));
    const bId = parseInt(b.replace('.json', ''));
    return aId - bId;
  });

console.log(`Found ${jsonFiles.length} JSON files to update`);

let updatedCount = 0;
let errorCount = 0;

// Process each JSON file
for (const jsonFile of jsonFiles) {
  try {
    const filePath = path.join(metadataDir, jsonFile);
    
    // Read the JSON file
    const jsonContent = fs.readFileSync(filePath, 'utf8');
    const metadata = JSON.parse(jsonContent);
    
    // Check if the image field exists and contains the placeholder
    if (metadata.image && metadata.image.includes('<ipfs_hash>')) {
      // Replace the placeholder with the actual IPFS hash
      metadata.image = metadata.image.replace('<ipfs_hash>', IPFS_HASH);
      
      // Write the updated JSON back to the file
      fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
      
      updatedCount++;
      
      // Log progress every 500 files
      if (updatedCount % 500 === 0) {
        console.log(`Updated ${updatedCount} files...`);
      }
    } else if (metadata.image) {
      // File already has an IPFS hash, skip it
      console.log(`Skipping ${jsonFile} - already has IPFS hash`);
    } else {
      console.warn(`Warning: ${jsonFile} has no image field`);
    }
    
  } catch (error) {
    console.error(`Error processing ${jsonFile}: ${error.message}`);
    errorCount++;
  }
}

console.log('\n=== Update Complete ===');
console.log(`Successfully updated: ${updatedCount} files`);
console.log(`Errors encountered: ${errorCount} files`);
console.log(`Total files processed: ${jsonFiles.length}`);

if (updatedCount > 0) {
  console.log(`\nAll image URLs now use IPFS hash: ${IPFS_HASH}`);
  console.log('Example URL format: ipfs://Qmc2qFt9Qx68F7ZgfpLRBdtsURgtCXbsAHD95AVgMP1gFY/0.png');
}
