const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // IPFS hash to use - update this with your actual IPFS hash
  ipfsHash: 'Qmc2qFt9Qx68F7ZgfpLRBdtsURgtCXbsAHD95AVgMP1gFY',
  metadataDir: path.join(__dirname, '..', 'NFTData', 'metadata_json'),
};

console.log('🔗 Starting IPFS hash update...');
console.log(`📋 Configuration:`);
console.log(`   IPFS Hash: ${CONFIG.ipfsHash}`);
console.log(`   Metadata Directory: ${CONFIG.metadataDir}`);
console.log('');

// Check if metadata directory exists
if (!fs.existsSync(CONFIG.metadataDir)) {
  console.error(`❌ Error: Metadata directory not found at ${CONFIG.metadataDir}`);
  console.log('💡 Make sure you have run generateMetadata.js first to create the metadata files.');
  process.exit(1);
}

// Get all JSON files in the metadata directory
const jsonFiles = fs.readdirSync(CONFIG.metadataDir)
  .filter(file => file.endsWith('.json'))
  .sort((a, b) => {
    // Sort numerically by token ID
    const aId = parseInt(a.replace('.json', ''));
    const bId = parseInt(b.replace('.json', ''));
    return aId - bId;
  });

console.log(`📊 Found ${jsonFiles.length} JSON files to update`);

let updatedCount = 0;
let errorCount = 0;

console.log('🔄 Starting IPFS hash update process...');
console.log('');

// Process each JSON file
for (const jsonFile of jsonFiles) {
  try {
    const filePath = path.join(CONFIG.metadataDir, jsonFile);
    
    // Read the JSON file
    const jsonContent = fs.readFileSync(filePath, 'utf8');
    const metadata = JSON.parse(jsonContent);
    
    // Check if the image field exists and contains the placeholder
    if (metadata.image && metadata.image.includes('<ipfs_hash>')) {
      // Replace the placeholder with the actual IPFS hash
      metadata.image = metadata.image.replace('<ipfs_hash>', CONFIG.ipfsHash);
      
      // Write the updated JSON back to the file
      fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
      
      updatedCount++;
      
      // Log progress every 500 files
      if (updatedCount % 500 === 0) {
        console.log(`📊 Progress: Updated ${updatedCount} files...`);
      }
    } else if (metadata.image) {
      // File already has an IPFS hash, skip it
      console.log(`⏭️  Skipping ${jsonFile} - already has IPFS hash`);
    } else {
      console.warn(`⚠️  Warning: ${jsonFile} has no image field`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${jsonFile}: ${error.message}`);
    errorCount++;
  }
}

console.log('');
console.log('🎉 IPFS hash update complete!');
console.log(`✅ Successfully updated: ${updatedCount} files`);
console.log(`❌ Errors encountered: ${errorCount} files`);
console.log(`📊 Total files processed: ${jsonFiles.length}`);

if (updatedCount > 0) {
  console.log('');
  console.log('🔗 All image URLs now use IPFS hash:', CONFIG.ipfsHash);
  console.log('📝 Example URL format:', `ipfs://${CONFIG.ipfsHash}/0.png`);
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Verify your metadata files have the correct IPFS hash');
  console.log('2. Deploy your contract with the updated base URI');
  console.log('3. Test your NFT metadata on the blockchain');
}
