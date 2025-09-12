const fs = require('fs');
const path = require('path');
const { unicodeName } = require('unicode-name');

// Read the template
const templatePath = path.join(__dirname, '..', 'NFTData', 'json_template.json');
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

// Get all emoji files
const emojisDir = path.join(__dirname, '..', 'emojis');
const emojiFiles = fs.readdirSync(emojisDir)
  .filter(file => file.endsWith('.png'))
  .sort(); // Sort to ensure consistent ordering

console.log(`Found ${emojiFiles.length} emoji files`);

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
const shuffledEmojiFiles = deterministicShuffle(emojiFiles);
console.log('Created random assignment of emoji files to token IDs');

// Create metadata directory if it doesn't exist
const metadataDir = path.join(__dirname, '..', 'NFTData', 'metadata_json');
if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir, { recursive: true });
}

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '..', 'NFTData', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
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

// Generate metadata for each token
for (let tokenId = 0; tokenId < emojiFiles.length; tokenId++) {
  const emojiFile = shuffledEmojiFiles[tokenId];
  const emojiName = getEmojiName(emojiFile);
  
  // Copy and rename the emoji file
  const sourceImagePath = path.join(emojisDir, emojiFile);
  const destImagePath = path.join(imagesDir, `${tokenId}.png`);
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
  const metadataPath = path.join(metadataDir, `${tokenId}.json`);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  // Log progress every 100 files with sample assignments
  if ((tokenId + 1) % 100 === 0) {
    console.log(`Generated ${tokenId + 1} metadata files and copied images...`);
    // Show a few sample assignments
    if (tokenId < 10) {
      console.log(`  Sample: Token ${tokenId} → ${emojiFile} (${emojiName})`);
    }
  }
}

console.log(`Successfully generated ${emojiFiles.length} metadata files in ${metadataDir}`);
console.log(`Successfully copied ${emojiFiles.length} emoji images to ${imagesDir}`);
