//SPDX-License-Identifier: MIT
pragma solidity ~0.8.17;

import "../registry/ENS.sol";
import "./ETHRegistrarController.sol";
import "./IETHRegistrarController.sol";
import "../resolvers/Resolver.sol";
import "./IBulkRenewal.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract BulkRenewal is IBulkRenewal, Ownable {
    bytes32 private constant ETH_NAMEHASH =
        0x587d09fe5fa45354680537d38145a28b772971e0f293af3ee0c536fc919710fb; // .web3

    ENS public immutable ens;

    constructor(ENS _ens) {
        ens = _ens;
    }

    function getController() internal view returns (ETHRegistrarController) {
        Resolver r = Resolver(ens.resolver(ETH_NAMEHASH));
        return
            ETHRegistrarController(
                r.interfaceImplementer(
                    ETH_NAMEHASH,
                    type(IETHRegistrarController).interfaceId
                )
            );
    }

    function renewAll(
        string[] calldata names,
        uint256 duration
    ) external override {
        ETHRegistrarController controller = getController();
        uint256 length = names.length;
        for (uint256 i = 0; i < length; ) {
            controller.renew(names[i], duration);
            unchecked {
                ++i;
            }
        }
    }

    function supportsInterface(
        bytes4 interfaceID
    ) external pure returns (bool) {
        return
            interfaceID == type(IERC165).interfaceId ||
            interfaceID == type(IBulkRenewal).interfaceId;
    }
}
