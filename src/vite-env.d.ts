/// <reference types="vite/client" />

import { IPFS } from "ipfs-core";

// declare global {
//   const ipfs: IPFS;
// }

interface Window {
  ipfs: IPFS;
}

export declare global {
  interface Window {
    ipfs: IPFS & {
      enable?: (any) => IPFS;
    };

    // add you custom properties and methods
    //    foo: string;
  }
}
