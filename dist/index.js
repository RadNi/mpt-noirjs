// src/index.ts
import RLP from "rlp";
import { ethers } from "ethers";
function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}
function hexToBytesPadInverse(raw, length) {
  let bytes = hexToBytes(raw.substring(2)).map((e) => e);
  const _length = bytes.length;
  for (let index = 0; index < length - _length; index++)
    if (index >= _length)
      bytes = [0].concat(bytes);
  return bytes;
}
function padArray(data, length) {
  for (let index = data.length; index < length; index++) {
    data.push(0);
  }
  return data;
}
function encodeAccount(accountRaw, address) {
  console.log("before");
  console.log(accountRaw);
  const account = {
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    nonce: padArray(Array.from(accountRaw[0]), 8),
    balance: padArray(Array.from(accountRaw[1]), 32),
    nonce_length: accountRaw[0].length,
    balance_length: accountRaw[1].length,
    address: hexToBytesPadInverse(address, 20),
    storage_hash: padArray(Array.from(accountRaw[2]), 32),
    code_hash: padArray(Array.from(accountRaw[3]), 32)
  };
  const trie_key = hexToBytesPadInverse(ethers.keccak256(address), 32);
  console.log("trie key:");
  console.log(trie_key);
  return { "account": account, "trie_key": trie_key };
}
function getNodesFromProof(proof, address) {
  const nodes = [];
  let accountRaw;
  const roots = [];
  console.log("proof:");
  console.log(proof);
  for (let index = 0; index < proof.length; index++) {
    const nodeRaw = proof[index];
    roots.push(hexToBytesPadInverse(ethers.keccak256(nodeRaw), 32));
    const decoded = RLP.decode(nodeRaw);
    let node_type;
    const rows = [];
    const row_exist = [];
    let prefix_addition;
    if (decoded.length == 17) {
      node_type = 0;
      prefix_addition = 1;
      let row_count = 0;
      console.log("injaaaa");
      console.log(decoded);
      decoded.forEach((row) => {
        if (row instanceof Uint8Array) {
          if (row_count != 16) {
            let row_ = [];
            if (row.length == 32) {
              row_ = Array.from(row);
              row_exist.push(1);
            } else {
              row_ = Array(32).fill(0);
              row_exist.push(0);
            }
            rows.push(row_);
          }
          row_count += 1;
        }
      });
    } else if (decoded.length == 2 && index != proof.length - 1) {
      console.log("proof has a extension node!");
      node_type = 1;
      if (!(decoded[0] instanceof Uint8Array && decoded[1] instanceof Uint8Array))
        throw Error("extension node has wrong format!");
      if (decoded[0].length == 0)
        throw Error("extension node has wrong format!");
      const first_row = Array(32).fill(0);
      first_row[0] = decoded[0][0] >> 4 & 15;
      first_row[1] = decoded[0][0] & 15;
      first_row[2] = decoded[0].length - 1;
      rows.push(first_row);
      const second_row = Array(32).fill(0);
      for (let index2 = 0; index2 < first_row[2]; index2++) {
        second_row[index2] = decoded[0][index2 + 1];
      }
      rows.push(second_row);
      let third_row = [];
      decoded[1].map((e) => third_row.push(e));
      while (third_row.length != 32) {
        third_row = [0].concat(third_row);
      }
      rows.push(third_row);
      const zero = Array(32).fill(0);
      for (let index2 = 0; index2 < 13; index2++)
        rows.push(zero);
      for (let index2 = 0; index2 < 16; index2++)
        row_exist.push(0);
      prefix_addition = first_row[2] * 2 + first_row[0];
    } else {
      console.log("leaf is here:");
      console.log(nodeRaw);
      node_type = 2;
      accountRaw = RLP.decode(RLP.decode(nodeRaw)[1]);
      prefix_addition = 0;
    }
    const node_ = {
      "rows": rows,
      "row_exist": row_exist,
      "node_type": node_type,
      "prefix_addition": prefix_addition
    };
    if (node_type != 2) {
      nodes.push(node_);
    }
  }
  console.log("nodes");
  console.log(nodes);
  console.log("roots");
  console.log(roots);
  const trie_account = encodeAccount(accountRaw, address);
  return { nodes, roots, trie_account };
}
export {
  getNodesFromProof
};
//# sourceMappingURL=index.js.map