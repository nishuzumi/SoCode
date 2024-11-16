export interface ContractTemplateParams {
    contractName?: string;
    scriptImport: string;
    globalCode: string;
    topLevelCode: string;
    runCode: string;
}

export function contractTemplate(strings: TemplateStringsArray, ...keys: (keyof ContractTemplateParams)[]) {
    return function (params: ContractTemplateParams): string {
        const result = [strings[0]];
        keys.forEach((key, i) => {
            if (key === 'contractName') {
                result.push(params.contractName || "SoliCode", strings[i + 1]);
            } else {
                const value = params[key];
                result.push(value, strings[i + 1]);
            }
        });
        return result.join('');
    };
}

export const defaultTemplate = contractTemplate`// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

${'scriptImport'}
${'globalCode'}

interface VM{
  function broadcast(uint256 privateKey) external returns (bool);
}

library vm {
    VM constant VM_ADDRESS = VM(0xf000000000000000000000000000000000000000);

    function broadcast(uint256 privateKey) internal returns (bool) {
        return VM_ADDRESS.broadcast(privateKey);
    }
}

contract ${'contractName'}{
    ${'topLevelCode'}
    /// @notice Script entry point
    function run() public {
        ${'runCode'}
    }
}
`