[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Package](https://github.com/RadNi/mpt-noirjs/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/RadNi/mpt-noirjs/actions/workflows/npm-publish.yml)

<hr>

**MPT NoirJS** Witness generator for [mpt-noir](https://github.com/radni/mpt-noir) circuits.


## Installation
```
npm i mpt-noirjs
```

## Simple Usage
```javascript

const provider = new ethers.JsonRpcProvider("RPC_URL")
const address = "MY_ADDRESS"
const output = await provider.send("eth_getProof", [address, [], "latest"])
const mpt_proof = getNodesFromProof(output.accountProof, address)
```
The `mpt_proof` contains all the data necessary to generate proof using the mpt-noir circuits. To see an elaborated example you can checkout [Balance Proof](https://github.com/RadNi/balance_proof) application. 


## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/radni/mpt-noirjs/blob/main/LICENSE) file for details.
