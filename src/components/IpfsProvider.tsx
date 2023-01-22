import { ReactNode, useEffect, useState } from "react";
import { create, IPFS, Options } from "ipfs-core";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";

import { ipfsContext } from "../ipfsContext";

type IpfsProviderProps = {
  config?: Options;
  children: ReactNode;
};

const defaultConfig: Options = {
  start: true,
  relay: { enabled: false, hop: { enabled: false, active: false } },
  preload: {
    enabled: true,
  },
  repo: "./something",
  libp2p: {
    // https://github.com/ChainSafe/js-libp2p-gossipsub
    pubsub: gossipsub({ allowPublishToZeroPeers: true, emitSelf: true }),
  },

  config: {
    Addresses: {
      Swarm: [
        "/dns4/libp2p-rdv.vps.revolunet.com/tcp/443/wss/p2p-webrtc-star",
        // "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
        // "/dns6/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
        //"/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
        // "/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/",
      ],
    },
    Bootstrap: [
      "/dns4/ipfs-ws.vps.revolunet.com/tcp/443/wss/ipfs/QmSEbJSiV8TXyaG9oBJRs2sJ5sttrNQJvbSeGe7Vt8ZBqt",
      // "/dns4/star.desend.ml/tcp/443/wss/p2p/12D3KooWRkt9teYUZTwSFVq11ZB55LWF1knJgnE15imVnxBDopAy",
      // // "/dns4/star.desend.ml/tcp/443/wss/p2p/12D3KooWRkt9teYUZTwSFVq11ZB55LWF1knJgnE15imVnxBDopAy",
      // "/dns6/ipfs.thedisco.zone/tcp/4430/wss/p2p/12D3KooWChhhfGdB9GJy1GbhghAAKCUR99oCymMEVS4eUcEy67nt",
      // "/dns4/ipfs.thedisco.zone/tcp/4430/wss/p2p/12D3KooWChhhfGdB9GJy1GbhghAAKCUR99oCymMEVS4eUcEy67nt",
    ],
  },
};

export function IpfsProvider({ config, ...props }: IpfsProviderProps) {
  const { Provider } = ipfsContext;
  const [client, setClient] = useState<IPFS | null>(null);
  useEffect(() => {
    //ipfs = "io";
    const ipfsConfig = {
      ...defaultConfig,
      ...config,
    };
    const start = async () => {
      if (client === null) {
        console.info("create ipfs client");
        const newClient = await create(ipfsConfig);
        const id = await newClient.id();
        console.log("id", id);
        setClient(newClient);
      }
    };
    start();
    return function cleanup() {
      if (client && client.stop) {
        console.log("Stopping IPFS");
        client.stop().catch((err) => console.error(err));
        setClient(null);
      }
    };
  }, [config]);
  return client !== null ? (
    <Provider value={client} {...props} />
  ) : (
    <div>Loading IPFS...</div>
  );
}
