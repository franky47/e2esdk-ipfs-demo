import { useState, useEffect } from "react";
import Dropzone, { DropzoneOptions } from "react-dropzone";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";

import { useIpfs } from "./hooks/useIpfs";
import { useIpfsFactory } from "./hooks/useIpfsFactory";
import { usePubSub } from "./hooks/usePubSub";
import { IpfsImage } from "./components/IpfsImage";

import "./App.css";

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
  const messages = usePubSub(ipfs, "test-messages");

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

  const PUBSUB_TOPIC = "test-messages";

  const saveToIpfs = async (file: File) => {
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
      return added.cid.toString();
    } catch (err) {
      //@ts-ignore
      console.error("error uploading image", err.message);
    }
  };

  const onDrop: DropzoneOptions["onDrop"] = async (acceptedFiles) => {
    acceptedFiles.forEach(async (file) => {
      const cid = await saveToIpfs(file);
      if (ipfs && cid) {
        console.info("pubsub.publish", cid);
        ipfs.pubsub.publish(PUBSUB_TOPIC, uint8ArrayFromString(cid));
      }
    });
  };

  const acceptStyle = {
    borderColor: "#00e676",
  };

  return (
    (ipfs && (
      <div>
        <p className="read-the-docs">
          IPFS v{version?.version} #{id}
        </p>
        <Dropzone onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <section className="drop-zone">
              <br />
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>
        <br />
        {ipfs &&
          messages.map((message) => (
            <IpfsImage key={message} ipfs={ipfs} cid={message} />
          ))}
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
