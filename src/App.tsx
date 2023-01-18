import { IPFS } from "ipfs-core";
import { IPFSRepo } from "ipfs-core/dist/src/components/storage";
import { useEffect, useState } from "react";

import "./App.css";
import useIpfs from "./hooks/useIpfs";
import useIpfsFactory from "./hooks/useIpfsFactory";

/*

repo: repo,
      libp2p: {
        config: {
          dht: {
            enabled: true
          },
        },
      },
      config: {
        Addresses: {
          Swarm: [`/dns4/star-signal.cloud.ipfs.team/tcp/443/wss/p2p-webrtc-star`],
        },
        Bootstrap: [],
      },

      */

// todo: use export from  ifs-core-types/src/root
interface VersionResult {
  version: string;
  commit?: string;
  repo?: string;
  system?: string;
  golang?: string;
  "ipfs-core"?: string;
  "interface-ipfs-core"?: string;
  "ipfs-http-client"?: string;
}

function Sample() {
  const { ipfs, ipfsInitError } = useIpfsFactory({ commands: ["id"] });
  //@ts-ignore
  const res = useIpfs(ipfs, "id");
  const [version, setVersion] = useState<null | VersionResult>(null);
  const id = res && res.id.toString();
  useEffect(() => {
    if (!ipfs) return;
    const getVersion = async () => {
      const nodeId = await ipfs.version();
      setVersion(nodeId);
    };
    if (!version) {
      getVersion();
    }
  }, [ipfs]);
  //console.log({ id, version });
  return (
    <div>
      <p className="read-the-docs">IPFS #{id}</p>
      <p className="read-the-docs">IPFS v{version?.version}</p>
    </div>
  );
}
function App() {
  return (
    <div className="App">
      <h1>e2esdk + IPFS demo</h1>
      <div className="card">
        <p className="read-the-docs">Hello, world</p>
      </div>
      <Sample />
    </div>
  );
}

export default App;
