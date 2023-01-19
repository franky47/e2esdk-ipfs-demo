import { create, IPFS } from "ipfs-core";
//import { IPFSConfig } from "ipfs-core/dist/src/components/network";
import { useEffect, useState } from "react";

const ipfsConfig = {
  //start: true,
  // relay: {
  //   enabled: false, // enable relay dialer/listener (STOP)
  //   hop: {
  //     enabled: false, // make this node a relay (HOP)
  //   },
  // },
  // preload: {
  //   enabled: true,
  // },
  repo: "test-e2esdk",
  // EXPERIMENTAL: {
  //   /*pubsub: true*/
  // },
  // libp2p: {
  //   //   config: {
  //   // dht: {
  //   //   enabled: true,
  //   // },
  //   // },
  // },
  config: {
    Addresses: {
      Swarm: [
        // "/dns4/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star",
        // "/dns6/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star",
        //"/dns4/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star",
        //"/dns6/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star",
        //`/dns4/star-signal.cloud.ipfs.team/tcp/443/wss/p2p-webrtc-star`,
        //"/dns4/libp2p-rdv.vps.revolunet.com/tcp/443/wss/p2p-webrtc-star",
      ],
    },
    // Bootstrap: [
    //   //"/dns4/ipfs-ws.vps.revolunet.com/tcp/443/wss/ipfs/QmSEbJSiV8TXyaG9oBJRs2sJ5sttrNQJvbSeGe7Vt8ZBqt",
    // ],
  },
};
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
          const newIpfs = await create(ipfsConfig);
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
