import { useState, useEffect } from "react";
import { getProperty } from "dot-prop";
import { IPFS } from "ipfs-core";
import { IPFSRepo } from "ipfs-core/dist/src/components/storage";

interface IpfsResponse {
  id: string;
  publicKey: string;
  addresses: any[];
  agentVersion: string;
  protocolVersion: string;
  protocols: string[];
}

// dot-prop: used to obtain a property of an object when the name of property is a string
// here we get ipfs.id when calling dotProp.get(ipfs, cmd), with cmd = 'id'
// and we get ipfs.hash when calling with cmd = 'hash' etc.

/*
 * Pass the command you'd like to call on an ipfs instance.
 *
 * callIpfs uses setState write the response as a state variable, so that your component
 * will re-render when the result 'res' turns up from the call await ipfsCmd.
 *
 */

export default function useIpfs(
  ipfs: IPFS,
  cmd: string,
  opts: Record<string, any> = {}
): IpfsResponse | null {
  const [res, setRes] = useState<IpfsResponse | null>(null);
  useEffect(() => {
    // todo
    const onSetRes = (newRes: any) => {
      if (!res || newRes.id !== res.id) {
        setRes(newRes);
      }
    };
    callIpfs(ipfs, cmd, onSetRes, opts);
  }, [ipfs, cmd, opts]);
  return res;
}

async function callIpfs(
  ipfs: IPFS,
  cmd: string,
  setRes: (param: IpfsResponse | null) => void,
  ...opts: Record<string, any>[]
): Promise<void> {
  if (ipfs) {
    const ipfsCmd = getProperty(ipfs, cmd);
    if (ipfsCmd) {
      const res = await ipfsCmd(...opts);
      setRes(res);
      return;
    }
    // setRes(null);
  } else {
    console.error(`Cannot call ipfs.${cmd}: ipfs not ready`);
    //setRes(null);
  }
}
