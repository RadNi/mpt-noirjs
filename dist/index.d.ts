import { BytesLike } from 'ethers';

type Node = {
    rows: number[][];
    row_exist: number[];
    node_type: number;
    prefix_addition: number;
};
type Account = {
    nonce: number[];
    balance: number[];
    nonce_length: number;
    balance_length: number;
    address: number[];
    storage_hash: number[];
    code_hash: number[];
};
type TrieAccount = {
    account: Account;
    trie_key: number[];
};
type MPTProof = {
    nodes: Node[];
    roots: number[][];
    trie_account: TrieAccount;
};

declare function getNodesFromProof(proof: BytesLike[], address: string): MPTProof;

export { type Account, type MPTProof, type Node, type TrieAccount, getNodesFromProof };
