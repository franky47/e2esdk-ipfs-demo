import { create, IPFS, Options } from "ipfs-core";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";

//import { IPFSConfig } from "ipfs-core/dist/src/components/network";
import { useEffect, useState } from "react";

const ipfsConfig: Options = {
  start: true,
  // relay: {
  //   enabled: false, // enable relay dialer/listener (STOP)
  //   hop: {
  //     enabled: false, // make this node a relay (HOP)
  //   },
  // },
  relay: { enabled: false, hop: { enabled: false, active: false } },
  preload: {
    enabled: false,
  },
  repo: "./something",
  // EXPERIMENTAL: {
  //   /*pubsub: true*/
  // },
  libp2p: {
    // https://github.com/ChainSafe/js-libp2p-gossipsub
    pubsub: gossipsub({ allowPublishToZeroPeers: true, emitSelf: true }),
  },

  config: {
    // Bootstrap: [
    //   //"/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
    //   // "/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
    //   // "/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
    //   // "/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
    //   // "/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm",
    //   // "/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
    //   //"/dns4/ipfs-ws.vps.revolunet.com/tcp/443/wss/ipfs/QmSEbJSiV8TXyaG9oBJRs2sJ5sttrNQJvbSeGe7Vt8ZBqt",
    // ],
    // Addresses: {
    //   Swarm: [
    //     "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
    //     "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
    //     "/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/",
    //     //"/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
    //     // "/dns4/star-signal.cloud.ipfs.team/tcp/443/wss/p2p-webrtc-star",
    //     // "/dns4/libp2p-rdv.vps.revolunet.com/tcp/443/wss/p2p-webrtc-star",
    //     //const addr = multiaddr('/ip4/188.166.203.82/tcp/20000/wss/p2p-webrtc-star/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2a')
    //     //"/dns4/ipfs-ws.vps.revolunet.com/tcp/443/wss/ipfs/QmSEbJSiV8TXyaG9oBJRs2sJ5sttrNQJvbSeGe7Vt8ZBqt",
    //     //"/dns4/ws-star1.par.dwebops.pub/tcp/443/wss/p2p-websocket-star",
    //   ],
    //},
    Addresses: {
      Swarm: [
        "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
        "/dns6/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
        "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
        "/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/",
      ],
    },
    Bootstrap: [
      "/dns4/star.desend.ml/tcp/443/wss/p2p/12D3KooWRkt9teYUZTwSFVq11ZB55LWF1knJgnE15imVnxBDopAy",
      "/dns4/star.desend.ml/tcp/443/wss/p2p/12D3KooWRkt9teYUZTwSFVq11ZB55LWF1knJgnE15imVnxBDopAy",
      "/dns6/ipfs.thedisco.zone/tcp/4430/wss/p2p/12D3KooWChhhfGdB9GJy1GbhghAAKCUR99oCymMEVS4eUcEy67nt",
      "/dns4/ipfs.thedisco.zone/tcp/4430/wss/p2p/12D3KooWChhhfGdB9GJy1GbhghAAKCUR99oCymMEVS4eUcEy67nt",
    ],
  },
};
//let ipfs: IPFS | null = null;

type IpfsFactoryResult = {
  ipfs: IPFS | null;
  isIpfsReady: boolean;
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
export function useIpfsFactory(opts: IpfsFactoryProps): IpfsFactoryResult {
  const [ipfs, setIpfs] = useState<IPFS | null>(null);
  // const [ipfsInitError, setIpfsInitError] = useState<null | string>(null);

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
          //window.ipfs = newIpfs;
          //newIpfs.files.stat()
          //newIpfs.get("bla", { preload: true });
          setIpfs(newIpfs);
        }
      } catch (error) {
        console.error("IPFS init error:", error);
        //setIpfs(null);
        //@ts-ignore
        //setIpfsInitError(error);
      }
    }
  }

  const isIpfsReady = Boolean(ipfs);

  return { ipfs, isIpfsReady };
}
