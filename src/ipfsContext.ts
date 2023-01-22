import { IPFS } from "ipfs-core";
import { createContext } from "react";

export const ipfsContext = createContext<IPFS | null>(null);
