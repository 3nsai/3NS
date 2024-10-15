# Changes Made in BulkRenewal

**Import** the `Ownable` contract **in** `BulkRenewal.sol` and inherit it:

```solidity
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BulkRenewal is IBulkRenewal, Ownable

```

### Explanation of Changes

The `Ownable` contract was previously inherited in the `ETHRegistrarController` contract, which was then imported into `BulkRenewal.sol`. This eliminated the need for explicit inheritance of `Ownable` contract in `BulkRenewal` contract. However, due to upgradeable changes we removed `Ownable` contract from the `ETHRegistrarController` contract. As a result, it became necessary to explicitly import and inherit `Ownable` in `BulkRenewal` to maintain proper ownership control functionality.