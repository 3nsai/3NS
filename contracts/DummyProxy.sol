// SPDX-License-Identifier: AGPL-3
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DummyProxy is ERC1967Proxy {
    constructor(address _impl) ERC1967Proxy(_impl, "") {}
}