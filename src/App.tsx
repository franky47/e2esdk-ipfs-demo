import Dropzone, { DropzoneOptions } from "react-dropzone";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";

import { Client } from "@socialgouv/e2esdk-client";
import { E2ESDKClientProvider } from "@socialgouv/e2esdk-react";

import { usePubSub } from "./hooks/usePubSub";
import { IpfsImage } from "./components/IpfsImage";
import { IpfsProvider } from "./components/IpfsProvider";

import "./App.css";
import { useIpfs } from "./hooks/useIpfs";

const PUBSUB_TOPIC = "test-messages";

function Sample2({}) {
  const ipfs = useIpfs();
  const messages = usePubSub(ipfs, PUBSUB_TOPIC);

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

  return (
    <div>
      <div>
        <p className="read-the-docs">IPFS vxxx #yyyy</p>
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
    </div>
  );
}
const serverURL = "https://e2esdk.dev.fabrique.social.gouv.fr";
const serverPublicKey = "_XDQj6-paJAnpCp_pfBhGUUe6cA0MjLXsgAOgYDhCRI";
const mainKeyStr = "Yl62MSH6Gke5So1aPKhtWidL5WcMUh8tLlNW1pU_oeg";
const userId = "ffee47af-2edc-479f-8a1e-47544f243085";
const client = new Client({
  serverURL: serverURL,
  serverPublicKey: serverPublicKey,
  handleNotifications: true,
});
const mainKey = client.decode(mainKeyStr);
await client.sodium.ready;

client
  .signup(userId, mainKey)
  .catch((e) => {
    console.log(e.message);
    if (e.message === "This account was already registered") {
      return client.login(userId, mainKey);
    }
    throw e;
  })
  .then(() => {
    client.sodium.memzero(mainKey);
  });

function App() {
  return (
    <div className="App">
      <h1>e2esdk + IPFS demo</h1>
      <E2ESDKClientProvider client={client}>
        <IpfsProvider>
          <Sample2 />
        </IpfsProvider>
      </E2ESDKClientProvider>
    </div>
  );
}

export default App;
