import { create, IPFS } from "ipfs-core";
import { useEffect, useState } from "react";

//let ipfs: IPFS | null = null;

type IpfsFactoryResult = {
  ipfs: IPFS | null;
  isIpfsReady: boolean;
  ipfsInitError: string | null;
};

type IpfsFactoryProps = {
  commands: string[];
};
/*
 * A quick demo using React hooks to create an ipfs instance.
 *
 * Hooks are brand new at the time of writing, and this pattern
 * is intended to show it is possible. I don't know if it is wise.
 *
 * Next steps would be to store the ipfs instance on the context
 * so use-ipfs calls can grab it from there rather than expecting
 * it to be passed in.
 */
export default function useIpfsFactory(
  opts: IpfsFactoryProps
): IpfsFactoryResult {
  const [ipfs, setIpfs] = useState<IPFS | null>(null);
  const [ipfsInitError, setIpfsInitError] = useState<null | string>(null);

  useEffect(() => {
    if (!ipfs) {
      startIpfs();
    }
    return function cleanup() {
      if (ipfs && ipfs.stop) {
        console.log("Stopping IPFS");
        ipfs.stop().catch((err) => console.error(err));
        setIpfs(null);
      }
    };
  }, []);

  async function startIpfs() {
    if (ipfs) {
      console.log("IPFS already started");
    } else if (window.ipfs && window.ipfs.enable) {
      console.log("Found window.ipfs");
      const ipfs = await window.ipfs.enable({ commands: ["id"] });
      setIpfs(ipfs);
    } else {
      try {
        if (!ipfs) {
          console.info("Create IPFS Node");
          const newIpfs = await create();
          setIpfs(newIpfs);
        }
      } catch (error) {
        console.error("IPFS init error:", error);
        setIpfs(null);
        //@ts-ignore
        setIpfsInitError(error);
      }
    }
  }

  const isIpfsReady = Boolean(ipfs);

  return { ipfs, isIpfsReady, ipfsInitError };
}
