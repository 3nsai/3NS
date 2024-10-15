
## ETHRegistrarController changes to remove commitment feature

1. **Remove** the following error statements:
```solidity
error UnexpiredCommitmentExists(bytes32 commitment);
error InsufficientValue();
error Unauthorised(bytes32 node);
error MaxCommitmentAgeTooLow();
error MaxCommitmentAgeTooHigh();
error CommitmentTooNew(bytes32 commitment);
error CommitmentTooOld(bytes32 commitment);
```

2. **Remove** the following state variables:
```solidity
uint256 public minCommitmentAge;
uint256 public maxCommitmentAge;
mapping(bytes32 => uint256) public commitments;
```

3. **Remove** the following functions:
- `makeCommitment`
- `commit`
- `_consumeCommitment`


4. **Replace** the `register` function with the following code:
```solidity
function register(
    string calldata name,
    address owner,
    uint256 duration,
    address resolver,
    bytes[] calldata data,
    bool reverseRecord,
    uint16 ownerControlledFuses
) public override onlyAdmin {
    if (data.length > 0 && resolver == address(0)) {
        revert ResolverRequiredWhenDataSupplied();
    }

    if (!available(name)) {
        revert NameNotAvailable(name);
    }

    if (duration < MIN_REGISTRATION_DURATION) {
        revert DurationTooShort(duration);
    }

    uint256 expires = nameWrapper.registerAndWrapETH2LD(
        name,
        owner,
        duration,
        resolver,
        ownerControlledFuses
    );

    if (data.length > 0) {
        _setRecords(resolver, keccak256(bytes(name)), data);
    }

    if (reverseRecord) {
        _setReverseRecord(name, resolver, msg.sender);
    }

    emit NameRegistered(name, keccak256(bytes(name)), owner, expires);
}
```
