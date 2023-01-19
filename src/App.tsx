import { IPFS } from "ipfs-core";
import { InputFile } from "ipfs-core-types/src/utils";
import { EventHandler, useEffect, useState } from "react";

import "./App.css";
import useIpfs from "./hooks/useIpfs";
import useIpfsFactory from "./hooks/useIpfsFactory";

/** Uses `URL.createObjectURL` free returned ObjectURL with `URL.RevokeObjectURL` when done with it.
 *
 * @param {string} cid CID you want to retrieve
 * @param {string} mime mimetype of image
 * @param {number} limit size limit of image in bytes
 * @returns ObjectURL
 */
async function loadImgURL(
  ipfs: IPFS,
  cid: string,
  mime: string,
  limit = 1000000000
) {
  if (cid == "" || cid == null || cid == undefined) {
    return;
  }
  const content = [];
  for await (const chunk of ipfs.cat(cid, { length: limit })) {
    console.log("loading image", cid);
    content.push(chunk);
  }
  return URL.createObjectURL(new Blob(content, { type: mime }));
}

function IpfsImage({ ipfs, cid }: { ipfs: IPFS; cid: string }) {
  const [data, setData] = useState<string | null>(null);
  useEffect(() => {
    // get ipfs data
    let loaded = false;
    async function loadImage() {
      console.log("loadImage", cid);
      try {
        const imageData = await loadImgURL(ipfs, cid, "image/jpeg");
        if (imageData) {
          console.log("loadedImage", cid);
          setData(imageData);
        }
      } catch (e) {
        //@ts-ignore
        console.log("error loading image", cid, e.message);
      }
    }
    if (ipfs && !loaded) {
      loaded = true;
      loadImage();
    }
  }, [ipfs, cid]);
  return (
    (
      <div>
        <hr />
        <b>{cid}</b>
        <br />
        {
          <>
            local IPFS:{" "}
            <img
              width={100}
              style={{
                border: "1px solid silver",
                minWidth: 100,
                minHeight: 100,
              }}
              src={data || "about:blank"}
            />
            <br />
          </>
        }
        <>
          ipfs.io http gateway:
          <img
            width={100}
            style={{
              border: "1px solid silver",
              minWidth: 100,
              minHeight: 100,
            }}
            src={`https://ipfs.io/ipfs/${cid}`}
          />
        </>
      </div>
    ) || null
  );
}
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


      //How to enable WebRTC support for js-ipfs in the Browser

          repo: 'ok' + Math.random(), // random so we get a new peerid every time, useful for testing
    config: {
        Addresses: {
            Swarm: [
                '/dns4/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star',
                '/dns6/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star'
            ]
        },
    }

    //use a custom signaling endpoint for my WebRTC transport?
     config: {
    Addresses: {
      Swarm: [
        '/ip4/127.0.0.1/tcp/9090/ws/p2p-webrtc-star'
      ]
    }
  }


    const bootstraps = \[
    '/dns6/ipfs.thedisco.zone/tcp/4430/wss/p2p/12D3KooWChhhfGdB9GJy1GbhghAAKCUR99oCymMEVS4eUcEy67nt',
    '/dns4/ipfs.thedisco.zone/tcp/4430/wss/p2p/12D3KooWChhhfGdB9GJy1GbhghAAKCUR99oCymMEVS4eUcEy67nt'
\];
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
  const { ipfs } = useIpfsFactory({ commands: ["id"] });
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

  const captureFile = (event) => {
    event.stopPropagation();
    event.preventDefault();

    saveToIpfs(event.target.files);
  };

  const saveToIpfs = async ([file]) => {
    if (!ipfs) {
      return;
    }
    const fileDetails = {
      path: file.name,
      content: file,
    };

    const options = {
      // wrapWithDirectory: true,
      progress: (prog: number) => console.log(`received: ${prog}`),
    };

    try {
      const added = await ipfs.add(fileDetails, options);

      //setFileHash(added.cid.toString());
      console.log(added.cid.toString());
    } catch (err) {
      // setError(err.message);
      //@ts-ignore
      console.error("error uploading image", err.message);
    }
  };

  const cids = [
    "QmTqKgsMYMJo3yev7JDGwh7gXhMtxjcuV4499LxseVDujX",
    "QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ",
  ];

  //ipfs.io/ipfs/QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ

  //console.log({ id, version });
  https: return (
    (ipfs && (
      <div>
        <p className="read-the-docs">
          IPFS v{version?.version} #{id}
        </p>
        <input
          id="input-file"
          name="input-file"
          type="file"
          onChange={captureFile}
        />
        <label htmlFor="input-file">Input File</label>
        <br />
        <br />
        {ipfs &&
          cids.map((cid) => <IpfsImage key={cid} ipfs={ipfs} cid={cid} />)}
      </div>
    )) || <div>Connecting to IPFS...</div>
  );
}

function App() {
  return (
    <div className="App">
      <h1>e2esdk + IPFS demo</h1>
      <Sample />
    </div>
  );
}

export default App;
