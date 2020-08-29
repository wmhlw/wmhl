pragma solidity ^0.4.0;

contract WMHL is SeroInterface {
    uint256 constant private period = 3600;

    struct User {
        uint id;
        address referrer;
        uint partnersCount;
        uint s3Income;
        uint s4Income;

        mapping(uint8 => bool) activeS3Levels;
        mapping(uint8 => bool) activeS4Levels;

        mapping(uint8 => S3) s3Matrix;
        mapping(uint8 => S4) s4Matrix;
    }

    struct S3 {
        address currentReferrer;
        address[] referrals;
        uint8[] relationships;
        bool blocked;
        uint reinvestCount;
        uint partnersCount;
        bool isExtraDividends;
    }

    struct S4 {
        address currentReferrer;
        address[] firstLevelReferrals;
        uint8[] firstRelationships;
        address[] secondLevelReferrals;
        uint8[] secondRelationships;
        bool blocked;
        uint reinvestCount;
        uint partnersCount;

        address closedPart;
        bool isExtraDividends;

    }


    uint8 public constant LAST_LEVEL = 12;

    mapping(address => User) public users;
    mapping(uint => address) public idToAddress;

    mapping(uint => uint) public registrationTimes;
    uint total;

    uint public lastUserId = 2;
    address private owner;
    address private other;
    address private market;

    mapping(uint8 => uint) public levelPrice;

    constructor(address ownerAddress, address marketAddr) public {
        levelPrice[1] = 3e19;
        for (uint8 i = 2; i <= LAST_LEVEL; i++) {
            levelPrice[i] = levelPrice[i - 1] * 2;
        }

        owner = ownerAddress;
        other = msg.sender;
        market = marketAddr;

        User memory user = User({
            id : 1,
            referrer : address(0),
            partnersCount : uint(0),
            s3Income : 0,
            s4Income : 0
            });

        users[ownerAddress] = user;
        idToAddress[1] = ownerAddress;

        for (uint8 i = 1; i <= LAST_LEVEL; i++) {
            users[ownerAddress].activeS3Levels[i] = true;
            users[ownerAddress].activeS4Levels[i] = true;
        }
    }

    function registration(uint referrerId) public payable {
        require(stringEq("SERO", sero_msg_currency()));
        total += msg.value;
        address referrerAddress = idToAddress[referrerId];
        registration(msg.sender, referrerAddress);
    }

    function buyNewLevel(uint8 matrix, uint8 level) public payable {
        require(stringEq("SERO", sero_msg_currency()));
        require(isUserExists(msg.sender), "user is not exists. Register first.");
        require(matrix == 1 || matrix == 2, "invalid matrix");
        require(msg.value == levelPrice[level], "invalid price");
        require(level > 1 && level <= LAST_LEVEL, "invalid level");

        total += msg.value;

        if (matrix == 1) {
            require(!users[msg.sender].activeS3Levels[level], "level already activated");

            if (users[msg.sender].s3Matrix[level - 1].blocked) {
                users[msg.sender].s3Matrix[level - 1].blocked = false;
            }

            address freeX3Referrer = findFreeS3Referrer(msg.sender, level);
            users[msg.sender].s3Matrix[level].currentReferrer = freeX3Referrer;
            users[msg.sender].activeS3Levels[level] = true;
            updateX3Referrer(msg.sender, freeX3Referrer, level);

        } else {
            require(!users[msg.sender].activeS4Levels[level], "level already activated");

            if (users[msg.sender].s4Matrix[level - 1].blocked) {
                users[msg.sender].s4Matrix[level - 1].blocked = false;
            }

            address freeS4Referrer = findFreeS4Referrer(msg.sender, level);

            users[msg.sender].activeS4Levels[level] = true;
            updateS4Referrer(msg.sender, freeS4Referrer, level, 1);
        }
    }

    function registration(address userAddress, address referrerAddress) private {
        require(msg.value == 6e19, "registration cost 60");
        require(!isUserExists(userAddress), "user exists");
        require(isUserExists(referrerAddress), "referrer not exists");

        uint32 size;
        assembly {
            size := extcodesize(userAddress)
        }
        require(size == 0, "cannot be a contract");

        User memory user = User({
            id : lastUserId,
            referrer : referrerAddress,
            partnersCount : 0,
            s3Income : 0,
            s4Income : 0
            });

        uint timeIndex = timeIndex();
        if (registrationTimes[timeIndex] == 0) {
            registrationTimes[timeIndex] = lastUserId;
        }

        users[userAddress] = user;
        idToAddress[lastUserId] = userAddress;

        users[userAddress].referrer = referrerAddress;

        users[userAddress].activeS3Levels[1] = true;
        users[userAddress].activeS4Levels[1] = true;

        lastUserId++;

        users[referrerAddress].partnersCount++;

        address freeX3Referrer = findFreeS3Referrer(userAddress, 1);
        users[userAddress].s3Matrix[1].currentReferrer = freeX3Referrer;
        updateX3Referrer(userAddress, freeX3Referrer, 1);


        updateS4Referrer(userAddress, findFreeS4Referrer(userAddress, 1), 1, 1);
    }

    function updateX3Referrer(address userAddress, address referrerAddress, uint8 level) private {
        users[referrerAddress].s3Matrix[level].referrals.push(userAddress);
        if (users[userAddress].referrer == referrerAddress) {
            users[referrerAddress].s3Matrix[level].relationships.push(1);
        } else {
            users[referrerAddress].s3Matrix[level].relationships.push(4);
        }

        if (users[referrerAddress].s3Matrix[level].referrals.length < 3) {
            return sendETHDividends(referrerAddress, userAddress, 1, level, levelPrice[level]);
        } else {

            uint8 layer = 6;
            uint value = levelPrice[level];
            address ref = referrerAddress;
            while (layer > 0) {
                if (ref == owner) {
                    sendETHDividends(owner, userAddress, 1, level, value);
                    break;
                } else {
                    sendETHDividends(ref, userAddress, 1, level, value / layer);
                }

                value = value - value / layer;
                layer--;
                ref = findFreeS3Referrer(ref, level);
            }

            users[referrerAddress].s3Matrix[level].referrals = new address[](0);
            users[referrerAddress].s3Matrix[level].relationships = new uint8[](0);

            if (!users[referrerAddress].activeS3Levels[level + 1] && level != LAST_LEVEL) {
                users[referrerAddress].s3Matrix[level].blocked = true;
            }

            users[referrerAddress].s3Matrix[level].reinvestCount++;
        }
    }

    function updateS4Referrer(address userAddress, address referrerAddress, uint8 level, uint8 relationship) private {
        require(users[referrerAddress].activeS4Levels[level], "500. Referrer level is inactive");

        if (users[referrerAddress].s4Matrix[level].firstLevelReferrals.length < 2) {
            users[referrerAddress].s4Matrix[level].firstLevelReferrals.push(userAddress);
            if (users[userAddress].referrer == referrerAddress) {
                users[referrerAddress].s4Matrix[level].firstRelationships.push(relationship);
            } else {
                users[referrerAddress].s4Matrix[level].firstRelationships.push(4);
            }

            //set current level
            users[userAddress].s4Matrix[level].currentReferrer = referrerAddress;

            if (referrerAddress == owner) {
                return sendETHDividends(referrerAddress, userAddress, 2, level, levelPrice[level]);
            }

            address ref = users[referrerAddress].s4Matrix[level].currentReferrer;
            users[ref].s4Matrix[level].secondLevelReferrals.push(userAddress);
            users[ref].s4Matrix[level].secondRelationships.push(2);

            return updateS4ReferrerSecondLevel(userAddress, ref, level);
        }

        users[referrerAddress].s4Matrix[level].secondLevelReferrals.push(userAddress);
        if (users[userAddress].referrer == referrerAddress) {
            users[referrerAddress].s4Matrix[level].secondRelationships.push(relationship);
        } else {
            users[referrerAddress].s4Matrix[level].secondRelationships.push(4);
        }

        updateS4ReferrerSecondLevel(userAddress, referrerAddress, level);
    }

    function updateS4ReferrerSecondLevel(address userAddress, address referrerAddress, uint8 level) private {
        if (users[referrerAddress].s4Matrix[level].secondLevelReferrals.length < 4) {
            return sendETHDividends(referrerAddress, userAddress, 2, level, levelPrice[level]);
        }

        uint8 layer = 6;
        uint value = levelPrice[level];
        address ref = referrerAddress;
        while (layer > 0) {
            if (ref == owner) {
                sendETHDividends(owner, userAddress, 1, level, value);
                break;
            } else {
                sendETHDividends(ref, userAddress, 1, level, value / layer);
            }

            value = value - value / layer;
            layer--;
            ref = findFreeS4Referrer(ref, level);
        }

        users[referrerAddress].s4Matrix[level].firstLevelReferrals = new address[](0);
        users[referrerAddress].s4Matrix[level].firstRelationships = new uint8[](0);
        users[referrerAddress].s4Matrix[level].secondLevelReferrals = new address[](0);
        users[referrerAddress].s4Matrix[level].secondRelationships = new uint8[](0);
        users[referrerAddress].s4Matrix[level].closedPart = address(0);

        if (!users[referrerAddress].activeS4Levels[level + 1] && level != LAST_LEVEL) {
            users[referrerAddress].s4Matrix[level].blocked = true;
        }

        users[referrerAddress].s4Matrix[level].reinvestCount++;
    }

    function findFreeS3Referrer(address userAddress, uint8 level) private view returns (address) {
        while (true) {
            if (users[users[userAddress].referrer].activeS3Levels[level]) {
                return users[userAddress].referrer;
            }

            userAddress = users[userAddress].referrer;
        }
    }

    function findFreeS4Referrer(address userAddress, uint8 level) private view returns (address) {
        while (true) {
            if (users[users[userAddress].referrer].activeS4Levels[level]) {
                return users[userAddress].referrer;
            }

            userAddress = users[userAddress].referrer;
        }
    }

    function userInfo() public view returns (uint id, uint referrer, uint partnersCount, uint s3Income, uint s4Income, bool[] memory activeS3Levels, bool[] memory activeS4Levels) {
        User storage user = users[msg.sender];
        id = user.id;
        referrer = users[user.referrer].id;
        partnersCount = user.partnersCount;
        s3Income = user.s3Income;
        s4Income = user.s4Income;

        activeS3Levels = new bool[](LAST_LEVEL);
        activeS4Levels = new bool[](LAST_LEVEL);
        for (uint i = 0; i < LAST_LEVEL; i++) {
            activeS3Levels[i] = user.activeS3Levels[uint8(i + 1)];
            activeS4Levels[i] = user.activeS4Levels[uint8(i + 1)];
        }
    }

    function usersS3Matrix(uint id, uint8 level) public view returns (uint, uint[] memory, uint8[] memory, uint, uint, bool, bool) {
        address userAddress = idToAddress[id];
        S3 storage s3 = users[userAddress].s3Matrix[level];

        return (users[s3.currentReferrer].id,
        addressListToIds(s3.referrals),
        s3.relationships,
        s3.reinvestCount,
        s3.partnersCount,
        s3.blocked,
        s3.isExtraDividends);
    }

    function addressListToIds(address[] memory list) private view returns (uint[] memory ret) {
        ret = new uint[](list.length);
        for (uint i = 0; i < list.length; i++) {
            ret[i] = users[list[i]].id;
        }
    }

    function usersS4Matrix(uint id, uint8 level) public view returns (uint, uint[] memory, uint8[] memory, uint[] memory, uint8[] memory, uint, uint, bool, bool) {
        address userAddress = idToAddress[id];
        S4 storage s4 = users[userAddress].s4Matrix[level];

        return (users[s4.currentReferrer].id,
        addressListToIds(s4.firstLevelReferrals),
        s4.firstRelationships,
        addressListToIds(s4.secondLevelReferrals),
        s4.secondRelationships,
        s4.reinvestCount,
        s4.partnersCount,
        s4.blocked,
        s4.isExtraDividends);
    }

    function isUserExists(address user) public view returns (bool) {
        return (users[user].id != 0);
    }

    function info() public view returns (uint256, uint256, uint256) {
        return (total, regOf24H(), lastUserId);
    }

    function regOf24H() private view returns (uint256) {
        uint256 timeIndex = timeIndex();
        uint256 index = timeIndex - period * 23;

        while (index <= timeIndex) {
            if (registrationTimes[index] != 0) {
                return lastUserId - registrationTimes[index];
            } else {
                index = index + period;
            }
        }
        return 0;
    }

    function findEthReceiver(address userAddress, uint8 matrix, uint8 level) private view returns (address, bool) {
        address receiver = userAddress;
        bool isExtraDividends;
        if (matrix == 1) {
            while (true) {
                if (users[receiver].s3Matrix[level].blocked) {
                    isExtraDividends = true;
                    receiver = users[receiver].s3Matrix[level].currentReferrer;
                } else {
                    return (receiver, isExtraDividends);
                }
            }
        } else {
            while (true) {
                if (users[receiver].s4Matrix[level].blocked) {
                    isExtraDividends = true;
                    receiver = users[receiver].s4Matrix[level].currentReferrer;
                } else {
                    return (receiver, isExtraDividends);
                }
            }
        }
    }

    function sendETHDividends(address userAddress, address _from, uint8 matrix, uint8 level, uint value) private {
        (address receiver, bool isExtraDividends) = findEthReceiver(userAddress, matrix, level);

        uint256 otherFee = value / 100;
        uint256 marketFee = value / 20;
        require(sero_send_token(other, "SERO", otherFee));
        require(sero_send_token(market, "SERO", marketFee));

        value = value - otherFee - marketFee;

        if (receiver == owner) {
            if (matrix == 1) {
                users[receiver].s3Income += value;
            } else {
                users[receiver].s4Income += value;
            }

            if (!sero_send_token(receiver, "SERO", value)) {
                sero_send_token(receiver, "SERO", sero_balanceOf("SERO"));
            }
        } else {

            if (matrix == 1) {
                if (isExtraDividends) {
                    users[receiver].s3Matrix[level].isExtraDividends = true;
                }
                if (users[_from].referrer == receiver) {
                    users[receiver].s3Matrix[level].partnersCount++;
                }
                users[receiver].s3Income += value;
            } else {
                if (isExtraDividends) {
                    users[receiver].s4Matrix[level].isExtraDividends = true;
                }

                if (users[_from].referrer == receiver) {
                    users[receiver].s4Matrix[level].partnersCount++;
                }
                users[receiver].s4Income += value;
            }

            require(sero_send_token(receiver, "SERO", value));
        }
    }

    function timeIndex() private view returns (uint256) {
        return now - now % period;
    }

    function stringEq(string memory a, string memory b) private pure returns (bool) {
        if (bytes(a).length != bytes(b).length) {
            return false;
        }
        for (uint i = 0; i < bytes(a).length; i ++) {
            if (bytes(a)[i] != bytes(b)[i]) {
                return false;
            }
        }
        return true;
    }

}




