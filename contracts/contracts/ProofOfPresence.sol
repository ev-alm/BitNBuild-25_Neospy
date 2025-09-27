// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ProofOfPresence is ERC721, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _eventIds;
    Counters.Counter private _tokenIds;

    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    // --- NEW: Define the event we will emit ---
    event EventCreated(uint256 indexed eventId, address indexed organizer, string metadataURI);

    struct Event {
        address organizer;
        string metadataURI;
        bool exists;
    }
    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    mapping(uint256 => uint256) private _tokenToEvent;

    constructor(address _adminAddress, address _relayerAddress) ERC721("Proof of Presence", "POAP") {
        _grantRole(DEFAULT_ADMIN_ROLE, _adminAddress);
        _grantRole(RELAYER_ROLE, _relayerAddress);
    }

    function createEvent(string memory _metadataURI) public {
        _eventIds.increment();
        uint256 newEventId = _eventIds.current();

        events[newEventId] = Event({
            organizer: msg.sender,
            metadataURI: _metadataURI,
            exists: true
        });

        // --- NEW: Emit the event with the new ID ---
        emit EventCreated(newEventId, msg.sender, _metadataURI);
    }

    // --- mintBadge and tokenURI functions remain the same ---
    function mintBadge(uint256 _eventId, address _attendee) public onlyRole(RELAYER_ROLE) {
        require(events[_eventId].exists, "Event does not exist.");
        require(!hasClaimed[_eventId][_attendee], "Attendee has already claimed this badge.");
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        hasClaimed[_eventId][_attendee] = true;
        _tokenToEvent[newTokenId] = _eventId;
        _safeMint(_attendee, newTokenId);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
        uint256 eventId = _tokenToEvent[_tokenId];
        return events[eventId].metadataURI;
    }

    // --- We NO LONGER NEED getLatestEventId, so it can be removed ---

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}