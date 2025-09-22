// Quai NFT Example Contract //
//////////////////////////////
// This is an example NFT contract for the Quai Network
// Features:
// - Public minting with configurable price and supply
// - Owner controls for supply, pricing, and metadata
// - Automatic token URI generation
// - Burn functionality for token owners
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract QuaiNFT is ERC721URIStorage, Ownable {
    // State variables
    uint256 public tokenIds = 0;                    // Current token ID counter
    uint256 public mintPrice;                       // Price to mint one NFT (in wei)
    uint256 public supply;                          // Maximum number of NFTs that can be minted
    string public baseTokenURI;                     // Base URI for token metadata
    uint256 public maxMintPerAddress;               // Maximum NFTs one address can mint
    
    /**
     * @dev Constructor that sets the initial owner and NFT details
     * @param initialOwner The address that will own this contract
     * @param _name The name of the NFT collection
     * @param _symbol The symbol of the NFT collection
     * @param _mintPrice The initial mint price in wei
     * @param _supply The maximum supply of NFTs
     * @param _baseTokenURI The base URI for token metadata
     * @param _maxMintPerAddress The maximum NFTs one address can mint
     */
    constructor(
        address initialOwner,
        string memory _name,
        string memory _symbol,
        uint256 _mintPrice,
        uint256 _supply,
        string memory _baseTokenURI,
        uint256 _maxMintPerAddress
    ) Ownable(initialOwner) ERC721(_name, _symbol) {
        mintPrice = _mintPrice;
        supply = _supply;
        baseTokenURI = _baseTokenURI;
        maxMintPerAddress = _maxMintPerAddress;
    }

    /**
     * @dev Mint a new NFT to the specified recipient
     * @param _recipient The address that will receive the minted NFT
     * @return tokenId The ID of the newly minted token
     */
    function mint(address _recipient)
        public 
        payable
        returns (uint256)
    {
        require(msg.value == mintPrice, "Not enough QUAI to mint");
        require(balanceOf(_recipient) < maxMintPerAddress, "You can only mint 2 NFTs.");
        uint256 tokenId = tokenIds;
        require(tokenId < supply, "No more NFTs");
        _mint(_recipient, tokenId);
        tokenIds += 1;
        return tokenId;
    }

    /**
     * @dev Burn an NFT (only the owner can burn their own NFT)
     * @param tokenId The ID of the token to burn
     */
    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Only the owner of the NFT can burn it.");
        _burn(tokenId);
    }

    // ============ OWNER-ONLY FUNCTIONS ============
   
    /**
     * @dev Update the maximum supply of NFTs (owner only)
     * @param _supply The new maximum supply
     * @return The updated supply
     */
    function updateSupply(uint256 _supply)
        public
        onlyOwner()
        returns (uint256)
    {
        require(_supply > tokenIds, "New supply must be greater than current minted supply.");
        supply = _supply;
        return supply;
    }

    /**
     * @dev Update the mint price (owner only)
     * @param _price The new mint price in wei
     * @return The updated mint price
     */
    function updateMintPrice(uint256 _price)
        public
        onlyOwner()
        returns (uint256)
    {
        mintPrice = _price;
        return mintPrice;
    }

    /**
     * @dev Update the maximum number of NFTs one address can mint (owner only)
     * @param _maxMintPerAddress The new maximum mint limit per address
     * @return The updated maximum mint per address
     */
    function updateMaxMintPerAddress(uint256 _maxMintPerAddress)
        public
        onlyOwner()
        returns (uint256)
    {
        maxMintPerAddress = _maxMintPerAddress;
        return maxMintPerAddress;
    }

    /**
     * @dev Update the base token URI for metadata (owner only)
     * @param _baseTokenURI The new base URI
     * @return The updated base token URI
     */
    function updateBaseTokenURI(string memory _baseTokenURI)
        public
        onlyOwner()
        returns (string memory)
    {
        baseTokenURI = _baseTokenURI;
        return baseTokenURI;
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Override tokenURI to return baseURI + tokenId + ".json"
     * @param tokenId The ID of the token
     * @return The complete token URI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        ownerOf(tokenId); // This will revert if token doesn't exist
        
        string memory baseURI = baseTokenURI;
        if (bytes(baseURI).length == 0) {
            return "";
        }
        
        return string(abi.encodePacked(baseURI, _toString(tokenId), ".json"));
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Helper function to convert uint256 to string
     * @param value The number to convert
     * @return The string representation of the number
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // ============ WITHDRAWAL FUNCTION ============

    /**
     * @dev Withdraw all QUAI from the contract to the owner (owner only)
     * @return success Whether the withdrawal was successful
     */
    function withdraw()
        public 
        payable
        onlyOwner()
        returns (bool)
    {
        require(msg.sender == owner(), "Unauthorized");
        (bool success, ) = owner().call{value:address(this).balance}("");
        require(success, "Withdraw failed.");
        return true;
    }

}