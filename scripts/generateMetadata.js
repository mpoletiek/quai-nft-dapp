const fs = require('fs');
const path = require('path');
const { unicodeName } = require('unicode-name');

// Configuration
const CONFIG = {
  emojisDir: path.join(__dirname, '..', 'emojis'),
  templatePath: path.join(__dirname, '..', 'NFTData', 'json_template.json'),
  metadataDir: path.join(__dirname, '..', 'NFTData', 'metadata_json'),
  imagesDir: path.join(__dirname, '..', 'NFTData', 'images'),
  shuffleSeed: 42, // For deterministic shuffling
};

console.log('🎨 Starting NFT metadata generation...');
console.log(`📁 Emojis directory: ${CONFIG.emojisDir}`);
console.log(`📄 Template file: ${CONFIG.templatePath}`);
console.log(`📂 Output directories: ${CONFIG.metadataDir}, ${CONFIG.imagesDir}`);
console.log('');

// Read the template
if (!fs.existsSync(CONFIG.templatePath)) {
  console.error(`❌ Template file not found: ${CONFIG.templatePath}`);
  process.exit(1);
}
const template = JSON.parse(fs.readFileSync(CONFIG.templatePath, 'utf8'));

// Get all emoji files
if (!fs.existsSync(CONFIG.emojisDir)) {
  console.error(`❌ Emojis directory not found: ${CONFIG.emojisDir}`);
  process.exit(1);
}

const emojiFiles = fs.readdirSync(CONFIG.emojisDir)
  .filter(file => file.endsWith('.png'))
  .sort(); // Sort to ensure consistent ordering

console.log(`📊 Found ${emojiFiles.length} emoji files`);

// Function to create a deterministic shuffle using Fisher-Yates algorithm
function deterministicShuffle(array, seed = 42) {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  
  // Simple seeded random number generator
  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
  
  // Fisher-Yates shuffle with seeded random
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(seededRandom(seed + currentIndex) * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }
  
  return shuffled;
}

// Create random assignment of emoji files to token IDs
const shuffledEmojiFiles = deterministicShuffle(emojiFiles, CONFIG.shuffleSeed);
console.log('🔀 Created deterministic random assignment of emoji files to token IDs');

// Create output directories if they don't exist
if (!fs.existsSync(CONFIG.metadataDir)) {
  fs.mkdirSync(CONFIG.metadataDir, { recursive: true });
  console.log(`📁 Created metadata directory: ${CONFIG.metadataDir}`);
}

if (!fs.existsSync(CONFIG.imagesDir)) {
  fs.mkdirSync(CONFIG.imagesDir, { recursive: true });
  console.log(`📁 Created images directory: ${CONFIG.imagesDir}`);
}

// Function to convert Unicode codepoint to emoji name using unicode-name library
function getEmojiName(filename) {
  // Remove .png extension
  const codepoint = filename.replace('.png', '');
  
  try {
    // Handle multi-codepoint emojis (like flags with combining sequences)
    if (codepoint.includes('-')) {
      // Split by dashes and convert each part to a character
      const codePoints = codepoint.split('-').map(cp => parseInt(cp, 16));
      const character = String.fromCodePoint(...codePoints);
      const unicodeCharName = unicodeName(character);
      
      // Clean up the name for better readability
      return cleanUnicodeName(unicodeCharName);
    } else {
      // Single codepoint emoji
      const codePoint = parseInt(codepoint, 16);
      const character = String.fromCodePoint(codePoint);
      const unicodeCharName = unicodeName(character);
      
      // Clean up the name for better readability
      return cleanUnicodeName(unicodeCharName);
    }
  } catch (error) {
    console.warn(`Could not get Unicode name for ${codepoint}: ${error.message}`);
    
    // Fallback naming based on codepoint pattern
    if (codepoint.includes('-1F1')) {
      return `Flag: ${codepoint}`;
    }
    
    return `Emoji ${codepoint}`;
  }
}

// Function to clean up Unicode names for better readability
function cleanUnicodeName(name) {
  if (!name) return 'Unknown Emoji';
  
  // Remove common prefixes and clean up the name
  let cleaned = name
    .replace(/^EMOJI MODIFIER SEQUENCE/, '')
    .replace(/^REGIONAL INDICATOR SYMBOL LETTERS?/, 'Flag')
    .replace(/^KEYCAP/, 'Keycap')
    .replace(/^INPUT SYMBOL FOR/, 'Input Symbol')
    .replace(/^A BUTTON \(BLOOD TYPE\)/, 'A Button (Blood Type)')
    .replace(/^B BUTTON \(BLOOD TYPE\)/, 'B Button (Blood Type)')
    .replace(/^O BUTTON \(BLOOD TYPE\)/, 'O Button (Blood Type)')
    .replace(/^AB BUTTON \(BLOOD TYPE\)/, 'AB Button (Blood Type)')
    .replace(/^CL BUTTON/, 'CL Button')
    .replace(/^COOL BUTTON/, 'Cool Button')
    .replace(/^FREE BUTTON/, 'Free Button')
    .replace(/^ID BUTTON/, 'ID Button')
    .replace(/^NEW BUTTON/, 'New Button')
    .replace(/^NG BUTTON/, 'NG Button')
    .replace(/^OK BUTTON/, 'OK Button')
    .replace(/^SOS BUTTON/, 'SOS Button')
    .replace(/^UP! BUTTON/, 'Up! Button')
    .replace(/^VS BUTTON/, 'Vs Button')
    .replace(/^HASH KEY/, 'Hash Key')
    .replace(/^ASTERISK KEY/, 'Asterisk Key')
    .replace(/^MINUS SIGN/, 'Minus Sign')
    .replace(/^COPYRIGHT SIGN/, 'Copyright')
    .replace(/^REGISTERED SIGN/, 'Registered')
    .replace(/^MAHJONG TILE RED DRAGON/, 'Mahjong Red Dragon')
    .replace(/^PLAYING CARD JOKER/, 'Joker')
    .replace(/^INPUT LATIN LETTERS/, 'Input Latin Letters')
    .replace(/^INPUT LATIN SMALL LETTER/, 'Input Latin Small Letter')
    .replace(/^INPUT LATIN CAPITAL LETTER/, 'Input Latin Capital Letter')
    .replace(/^INPUT LATIN CAPITAL LETTERS/, 'Input Latin Capital Letters')
    .replace(/^INPUT LATIN SMALL LETTERS/, 'Input Latin Small Letters')
    .replace(/^INPUT NUMBERS/, 'Input Numbers')
    .replace(/^INPUT SYMBOLS/, 'Input Symbols')
    .replace(/^P BUTTON/, 'P Button')
    .trim();
  
  // If the name is too long, truncate it
  if (cleaned.length > 50) {
    cleaned = cleaned.substring(0, 47) + '...';
  }
  
  return cleaned || 'Unknown Emoji';
}

console.log('🔄 Starting metadata generation and image copying...');
console.log('');

// Generate metadata for each token
let successCount = 0;
let errorCount = 0;

for (let tokenId = 0; tokenId < emojiFiles.length; tokenId++) {
  try {
    const emojiFile = shuffledEmojiFiles[tokenId];
    const emojiName = getEmojiName(emojiFile);
    
    // Copy and rename the emoji file
    const sourceImagePath = path.join(CONFIG.emojisDir, emojiFile);
    const destImagePath = path.join(CONFIG.imagesDir, `${tokenId}.png`);
    fs.copyFileSync(sourceImagePath, destImagePath);
    
    // Create a copy of the template
    const metadata = JSON.parse(JSON.stringify(template));
    
    // Update the metadata with token-specific information
    metadata.name = emojiName;
    metadata.image = `ipfs://<ipfs_hash>/${tokenId}.png`;
    
    // Add token-specific attributes
    metadata.attributes.push({
      "trait_type": "Token ID",
      "value": tokenId.toString()
    });
    
    metadata.attributes.push({
      "trait_type": "Unicode Codepoint",
      "value": emojiFile.replace('.png', '')
    });
    
    // Write the metadata file
    const metadataPath = path.join(CONFIG.metadataDir, `${tokenId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    successCount++;
    
    // Log progress every 100 files with sample assignments
    if ((tokenId + 1) % 100 === 0) {
      console.log(`📊 Progress: ${tokenId + 1}/${emojiFiles.length} files processed...`);
      // Show a few sample assignments
      if (tokenId < 10) {
        console.log(`   Sample: Token ${tokenId} → ${emojiFile} (${emojiName})`);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing token ${tokenId}: ${error.message}`);
    errorCount++;
  }
}

console.log('');
console.log('🎉 Metadata generation complete!');
console.log(`✅ Successfully generated: ${successCount} metadata files`);
console.log(`✅ Successfully copied: ${successCount} emoji images`);
if (errorCount > 0) {
  console.log(`❌ Errors encountered: ${errorCount} files`);
}
console.log('');
console.log('📁 Output locations:');
console.log(`   Metadata: ${CONFIG.metadataDir}`);
console.log(`   Images: ${CONFIG.imagesDir}`);
console.log('');
console.log('📝 Next steps:');
console.log('1. Update the IPFS hash in your metadata files using updateIPFSHash.js');
console.log('2. Upload your images and metadata to IPFS');
console.log('3. Deploy your contract with the IPFS hash');
