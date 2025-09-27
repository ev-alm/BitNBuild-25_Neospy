// contracts/ProofOfPresence.sol (v3 - With Base URI for Metadata)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol"; // Import the Strings library

contract ProofOfPresence is ERC721, AccessControl {
    using Counters for Counters.Counter;
    using Strings for uint256; // Use the library for uint256 type
    Counters.Counter private _eventIds;
    Counters.Counter private _tokenIds;

    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    // --- NEW: This will store the base URL of our metadata server ---
    string private _baseTokenURI;

    struct Event {
        address organizer;
        string metadataURI; // We still store the original IPFS link here
        bool exists;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    mapping(uint256 => uint256) private _tokenToEvent;

    /**
     * @dev UPDATED CONSTRUCTOR: Now accepts the base URI for our metadata server.
     */
    constructor(
        address _adminAddress,
        address _relayerAddress,
        string memory baseTokenURI_ // The URL, e.g., "http://localhost:3001/metadata/"
    ) ERC721("Proof of Presence", "POAP") {
        _grantRole(DEFAULT_ADMIN_ROLE, _adminAddress);
        _grantRole(RELAYER_ROLE, _relayerAddress);
        // --- NEW: Set the base URI when the contract is deployed ---
        _baseTokenURI = baseTokenURI_;
    }

    // createEvent and mintBadge functions remain exactly the same...
    function createEvent(string memory _metadataURI) public {
        _eventIds.increment();
        uint256 newEventId = _eventIds.current();
        events[newEventId] = Event({
            organizer: msg.sender,
            metadataURI: _metadataURI,
            exists: true
        });
    }

    function mintBadge(uint256 _eventId, address _attendee) public onlyRole(RELAYER_ROLE) {
        require(events[_eventId].exists, "Event does not exist.");
        require(!hasClaimed[_eventId][_attendee], "Attendee has already claimed this badge.");
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        hasClaimed[_eventId][_attendee] = true;
        _tokenToEvent[newTokenId] = _eventId;
        _safeMint(_attendee, newTokenId);
    }
    
    /**
     * @dev UPDATED tokenURI FUNCTION: Now constructs the full metadata URL.
     * It combines the base URI with the specific event ID for the token.
     */
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
        uint256 eventId = _tokenToEvent[_tokenId];
        // Concatenates the base URI with the event ID (e.g., "http://.../metadata/" + "1")
        return bytes(_baseTokenURI).length > 0 ? string(abi.encodePacked(_baseTokenURI, eventId.toString())) : "";
    }

    // getLatestEventId and supportsInterface functions remain the same...
    function getLatestEventId() public view returns (uint256) {
        return _eventIds.current();
    }
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}