
export type Node = {
  rows: number[][],
  row_exist: number[],
  node_type: number,
  prefix_addition: number
}

export type Account = {
  nonce: number[]
  balance: number[]
  nonce_length: number
  balance_length: number
  address: number[]
}

export type TrieAccount = {
  account: Account,
  trie_key: number[]
}

export type MPTProof = {
  nodes: Node[],
  roots: number[][],
  trie_account: TrieAccount
}
