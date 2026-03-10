// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateStorage {

    // ============ STRUCTS ============

    struct Institute {
        string name;
        string id;
        string email;
        string website;
        bool isActive;
        uint256 registeredAt;
        uint256 certificatesIssued;
    }

    // NEW CONTACT STRUCT
    struct InstituteContact {
        string contactPerson;
        string contactEmail;
        string contactPhone;
        string contactPosition;
    }

    // NEW DETAIL STRUCT
    struct InstituteDetails {
        uint256 establishedYear;
        string accreditation;
        string description;
        string motto;
        uint256 studentCount;
        uint256 facultyCount;
        uint256 programCount;
    }

    // NEW SOCIAL STRUCT
    struct InstituteSocial {
        string twitter;
        string linkedin;
        string taxId;
        string registrationNumber;
    }

    struct Certificate {
        string studentName;
        string course;
        string ipfsHash;
        bytes32 fileHash;
        address issuer;
        address student;
        uint256 issuedAt;
        bool revoked;
        string instituteName;
        string studentId;
        string grade;
        uint256 credits;
        string duration;
        string[] skills;
    }

    // ============ STATE VARIABLES ============

    address public owner;

    mapping(address => Institute) public institutes;
    address[] public instituteAddresses;

    // NEW STORAGE
    mapping(address => InstituteContact) public contactInfos;
    mapping(address => InstituteDetails) public detailInfos;
    mapping(address => InstituteSocial) public socialInfos;

    mapping(bytes32 => Certificate) public certificates;
    mapping(address => bytes32[]) public studentCertificates;
    mapping(address => bytes32[]) public issuerCertificates;
    mapping(bytes32 => bool) public certificateHashes;
    mapping(address => mapping(bytes32 => bool)) public studentCourseIssued;

    address[] public studentList;
    mapping(address => bool) public isStudent;

    // ============ EVENTS ============

    event InstituteRegistered(address indexed institute, string name);
    event InstituteStatusUpdated(address indexed institute, bool active);

    event CertificateIssued(
        bytes32 indexed certificateId,
        string studentName,
        string course,
        address indexed issuer,
        address indexed student,
        uint256 timestamp,
        string instituteName
    );

    event CertificateRevoked(bytes32 indexed certificateId, address revokedBy);

    // ============ MODIFIERS ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyActiveInstitute() {
        require(institutes[msg.sender].isActive, "Institute not active");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor() {
        owner = msg.sender;
    }

    // ============ INSTITUTE MANAGEMENT ============

    function registerInstitute(
        address _wallet,
        string memory _name,
        string memory _id,
        string memory _email,
        string memory _website,

        string memory _contactPerson,
        string memory _contactEmail,
        string memory _contactPhone,
        string memory _contactPosition,

        uint256 _establishedYear,
        string memory _accreditation,
        string memory _description,
        string memory _motto,
        uint256 _studentCount,
        uint256 _facultyCount,
        uint256 _programCount,

        string memory _twitter,
        string memory _linkedin,
        string memory _taxId,
        string memory _registrationNumber

    ) public onlyOwner {

        require(_wallet != address(0), "Invalid wallet");
        require(institutes[_wallet].registeredAt == 0, "Institute already exists");

        institutes[_wallet] = Institute({
            name: _name,
            id: _id,
            email: _email,
            website: _website,
            isActive: true,
            registeredAt: block.timestamp,
            certificatesIssued: 0
        });

        // STORE CONTACT INFO
        contactInfos[_wallet] = InstituteContact({
            contactPerson: _contactPerson,
            contactEmail: _contactEmail,
            contactPhone: _contactPhone,
            contactPosition: _contactPosition
        });

        // STORE DETAILS
        detailInfos[_wallet] = InstituteDetails({
            establishedYear: _establishedYear,
            accreditation: _accreditation,
            description: _description,
            motto: _motto,
            studentCount: _studentCount,
            facultyCount: _facultyCount,
            programCount: _programCount
        });

        // STORE SOCIAL
        socialInfos[_wallet] = InstituteSocial({
            twitter: _twitter,
            linkedin: _linkedin,
            taxId: _taxId,
            registrationNumber: _registrationNumber
        });

        instituteAddresses.push(_wallet);

        emit InstituteRegistered(_wallet, _name);
    }

    function setInstituteStatus(address _wallet, bool _status) public onlyOwner {
        require(institutes[_wallet].registeredAt != 0, "Institute not found");

        institutes[_wallet].isActive = _status;

        emit InstituteStatusUpdated(_wallet, _status);
    }

    function getAllInstitutes() public view returns (address[] memory) {
        return instituteAddresses;
    }

    function getInstituteBasicInfo(address _wallet)
    public view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        bool,
        uint256,
        uint256
    ) {

        Institute memory inst = institutes[_wallet];

        return (
            inst.name,
            inst.id,
            inst.email,
            inst.website,
            inst.isActive,
            inst.registeredAt,
            inst.certificatesIssued
        );
    }

    function getInstituteContactInfo(address _wallet)
    public view returns (
        string memory,
        string memory,
        string memory,
        string memory
    ) {

        InstituteContact memory c = contactInfos[_wallet];

        return (
            c.contactPerson,
            c.contactEmail,
            c.contactPhone,
            c.contactPosition
        );
    }

    function getInstituteDetails(address _wallet)
    public view returns (
        uint256,
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        uint256
    ) {

        InstituteDetails memory d = detailInfos[_wallet];

        return (
            d.establishedYear,
            d.accreditation,
            d.description,
            d.motto,
            d.studentCount,
            d.facultyCount,
            d.programCount
        );
    }

    function getInstituteSocialInfo(address _wallet)
    public view returns (
        string memory,
        string memory,
        string memory,
        string memory
    ) {

        InstituteSocial memory s = socialInfos[_wallet];

        return (
            s.twitter,
            s.linkedin,
            s.taxId,
            s.registrationNumber
        );
    }

    // ============ CERTIFICATE FUNCTIONS ============
    // (ALL YOUR CERTIFICATE LOGIC REMAINS UNCHANGED)

    function _issueCertificate(
        string memory _studentName,
        string memory _course,
        string memory _ipfsHash,
        bytes32 _fileHash,
        address _studentWallet,
        string memory _studentId,
        string memory _grade,
        uint256 _credits,
        string memory _duration,
        string[] memory _skills
    ) internal returns (bytes32) {

        require(bytes(_studentName).length > 0, "Student name required");
        require(bytes(_course).length > 0, "Course required");
        require(_fileHash != bytes32(0), "Invalid file hash");
        require(_studentWallet != address(0), "Invalid student wallet");

        bytes32 hashKey = keccak256(abi.encodePacked(_fileHash));
        require(!certificateHashes[hashKey], "Certificate exists");
        bytes32 studentCourseKey = keccak256(abi.encodePacked(_studentWallet, _course));
        require(!studentCourseIssued[_studentWallet][studentCourseKey], "Student already has certificate for this course");

        bytes32 certificateId = _fileHash;

        string memory instName = institutes[msg.sender].name;

        certificates[certificateId] = Certificate({
            studentName: _studentName,
            course: _course,
            ipfsHash: _ipfsHash,
            fileHash: _fileHash,
            issuer: msg.sender,
            student: _studentWallet,
            issuedAt: block.timestamp,
            revoked: false,
            instituteName: instName,
            studentId: _studentId,
            grade: _grade,
            credits: _credits,
            duration: _duration,
            skills: _skills
        });

        studentCertificates[_studentWallet].push(certificateId);
        issuerCertificates[msg.sender].push(certificateId);

        institutes[msg.sender].certificatesIssued++;

        certificateHashes[hashKey] = true;
        studentCourseIssued[_studentWallet][studentCourseKey] = true;

        if (!isStudent[_studentWallet]) {
            isStudent[_studentWallet] = true;
            studentList.push(_studentWallet);
        }

        emit CertificateIssued(
            certificateId,
            _studentName,
            _course,
            msg.sender,
            _studentWallet,
            block.timestamp,
            instName
        );

        return certificateId;
    }

    function issueCertificate(
        string memory _studentName,
        string memory _course,
        string memory _ipfsHash,
        bytes32 _fileHash,
        address _studentWallet,
        string memory _studentId,
        string memory _grade,
        uint256 _credits,
        string memory _duration,
        string[] memory _skills
    ) public onlyActiveInstitute returns (bytes32) {
        return _issueCertificate(
            _studentName,
            _course,
            _ipfsHash,
            _fileHash,
            _studentWallet,
            _studentId,
            _grade,
            _credits,
            _duration,
            _skills
        );
    }

    function batchIssueCertificates(
        string[] memory _studentNames,
        string[] memory _courses,
        string[] memory _ipfsHashes,
        bytes32[] memory _fileHashes,
        address[] memory _studentWallets,
        string[] memory _studentIds,
        string[] memory _grades,
        uint256[] memory _credits,
        string[] memory _durations,
        string[][] memory _skills
    ) public onlyActiveInstitute returns (bytes32[] memory) {
        uint256 count = _studentNames.length;
        require(count > 0, "Empty batch");
        require(
            count == _courses.length &&
            count == _ipfsHashes.length &&
            count == _fileHashes.length &&
            count == _studentWallets.length &&
            count == _studentIds.length &&
            count == _grades.length &&
            count == _credits.length &&
            count == _durations.length &&
            count == _skills.length,
            "Batch array length mismatch"
        );

        bytes32[] memory certificateIds = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            certificateIds[i] = _issueCertificate(
                _studentNames[i],
                _courses[i],
                _ipfsHashes[i],
                _fileHashes[i],
                _studentWallets[i],
                _studentIds[i],
                _grades[i],
                _credits[i],
                _durations[i],
                _skills[i]
            );
        }

        return certificateIds;
    }

    function getTotalStudents() public view returns (uint256) {
        return studentList.length;
    }

    function getInstituteCount() public view returns (uint256) {
        return instituteAddresses.length;
    }

    function certificateExists(bytes32 _certificateId) public view returns (bool) {
        return certificates[_certificateId].issuedAt != 0;
    }

    function getStudentCertificates(address _student) public view returns (bytes32[] memory) {
        return studentCertificates[_student];
    }

    function getIssuerCertificates(address _issuer) public view returns (bytes32[] memory) {
        return issuerCertificates[_issuer];
    }

    function verifyCertificate(bytes32 _certificateId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            bytes32,
            address,
            address,
            uint256,
            bool,
            string memory
        )
    {
        require(certificateExists(_certificateId), "Certificate not found");

        Certificate storage cert = certificates[_certificateId];

        return (
            cert.studentName,
            cert.course,
            cert.ipfsHash,
            cert.fileHash,
            cert.issuer,
            cert.student,
            cert.issuedAt,
            cert.revoked,
            cert.instituteName
        );
    }

    function revokeCertificate(bytes32 _certificateId) public {
        require(certificateExists(_certificateId), "Certificate not found");

        Certificate storage cert = certificates[_certificateId];
        require(!cert.revoked, "Already revoked");
        require(
            msg.sender == owner || msg.sender == cert.issuer,
            "Only owner or issuer can revoke"
        );

        cert.revoked = true;

        emit CertificateRevoked(_certificateId, msg.sender);
    }

}
