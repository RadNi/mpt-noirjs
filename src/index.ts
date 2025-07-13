import RLP from "rlp";
import { Account, MPTProof, Node, TrieAccount } from "./types"
import { ethers, type BytesLike } from "ethers";


function hexToBytes(hex: string) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function hexToBytesPadInverse(raw: string, length: number): number[] {
  let bytes: number[] = hexToBytes(raw.substring(2)).map(e => e)
  const _length = bytes.length
  for (let index = 0; index < length - _length; index++)
    if (index >= _length)
      bytes = [0].concat(bytes)
  return bytes
}

/* eslint-disable @typescript-eslint/no-unsafe-return*/
/* eslint-disable @typescript-eslint/no-explicit-any */
function padArray(data: Array<any>, length: number) {
  for (let index = data.length; index < length; index++) {
    data.push(0)
  }
  return data
}


function encodeAccount(accountRaw:  Uint8Array[], address: string): TrieAccount {
  console.log("before")
  console.log(accountRaw)
  console.log(accountRaw[0])
  const account: Account = {
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    nonce: padArray(Array.from(accountRaw[0]!), 8),
    balance: padArray(Array.from(accountRaw[1]!), 32),
    nonce_length: accountRaw[0]!.length,
    balance_length: accountRaw[1]!.length,
    address: hexToBytesPadInverse(address, 20)
  }
  const trie_key = hexToBytesPadInverse(ethers.keccak256(address), 32)
  console.log("trie key:")
  console.log(trie_key)
  return {"account": account, "trie_key": trie_key}
}

export function getNodesFromProof(proof: BytesLike[], address: string): MPTProof {
  const nodes: Node[] = []
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let accountRaw: any
  const roots: number[][] = []
  console.log("proof:")
  console.log(proof)
  for (let index = 0; index < proof.length; index++) {
    const nodeRaw = proof[index];
    roots.push(hexToBytesPadInverse(ethers.keccak256(nodeRaw!), 32))

    const decoded = RLP.decode(nodeRaw)
    let node_type: number
    const rows: number[][] = []
    const row_exist: number[] = []
    let prefix_addition: number
    if (decoded.length == 17) {
      // branch
      node_type = 0
      prefix_addition = 1
      let row_count = 0
      console.log("injaaaa")
      console.log(decoded)
      decoded.forEach(row => {
        if (row instanceof Uint8Array) {
          if (row_count != 16) {
            let row_: number[] = []
            if (row.length == 32) {
                row_ = Array.from(row)
                row_exist.push(1)
            } else {
                /* eslint-disable @typescript-eslint/no-unsafe-assignment */
                row_ = Array(32).fill(0)
                row_exist.push(0)
            }
            rows.push(row_)
          }
          row_count += 1
        }
      })
    } else if (decoded.length == 2 && index != proof.length - 1) {
      console.log("proof has a extension node!")
      node_type = 1
      if (!(decoded[0] instanceof Uint8Array && decoded[1] instanceof Uint8Array))
          throw Error("extension node has wrong format!")
      if (decoded[0].length == 0)
          throw Error("extension node has wrong format!")
      const first_row: number[] = Array(32).fill(0)
      first_row[0] = (decoded[0][0]! >> 4) & 0xF
      first_row[1] = decoded[0][0]! & 0xF
      first_row[2] = decoded[0].length - 1
      rows.push(first_row)

      const second_row: number[] = Array(32).fill(0)
      for (let index = 0; index < first_row[2]; index++) {
        second_row[index] = decoded[0][index + 1]!;
      }
      rows.push(second_row)

      let third_row: number[] = []
      decoded[1].map(e => third_row.push(e))
      while (third_row.length != 32) {
        third_row = [0].concat(third_row)
      }
      rows.push(third_row)

      const zero: number[] = Array(32).fill(0)
      for (let index = 0; index < 13; index++)
        rows.push(zero)

      for (let index = 0; index < 16; index++)
        row_exist.push(0)

      prefix_addition = first_row[2] * 2 + first_row[0]
    } else {
      console.log("leaf is here:")
      console.log(nodeRaw)
      node_type = 2
      
      accountRaw = RLP.decode(RLP.decode(nodeRaw)[1])
      prefix_addition = 0
    }

    const node_: Node = {
        "rows": rows,
        "row_exist": row_exist,
        "node_type": node_type,
        "prefix_addition": prefix_addition
    }

    if (node_type != 2) {
      // if (index < nodes_initial_length)
      //   nodes_initial.push(node_)
      // else
        nodes.push(node_)
    }
  }
  // console.log("nodes initial")
  // console.log(nodes_initial)
  console.log("nodes")
  console.log(nodes)
  console.log("roots")
  console.log(roots)
  const trie_account = encodeAccount(accountRaw, address)
  return {nodes, roots, trie_account}
}

export * from "./types"