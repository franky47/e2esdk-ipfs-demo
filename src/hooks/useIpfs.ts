import { useState, useEffect, useContext } from "react";
import { getProperty } from "dot-prop";
import { IPFS } from "ipfs-core";
import { IPFSRepo } from "ipfs-core/dist/src/components/storage";

import { ipfsContext } from "../ipfsContext";

export function useIpfs(): IPFS | null {
  const ipfs = useContext(ipfsContext);
  return ipfs;
}
