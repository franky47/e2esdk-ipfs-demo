import Dropzone, { DropzoneOptions } from "react-dropzone";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

import { Client } from "@socialgouv/e2esdk-client";
import { E2ESDKClientProvider } from "@socialgouv/e2esdk-react";

import { usePubSub } from "./hooks/usePubSub";
import { IpfsImage } from "./components/IpfsImage";
import { IpfsProvider } from "./components/IpfsProvider";

import "./App.css";
import { useIpfs } from "./hooks/useIpfs";
import { useState, useRef, useEffect } from "react";

import { client } from "./e2esdk-client";

import "@socialgouv/e2esdk-devtools";
import { E2ESDKDevtoolsElement } from "@socialgouv/e2esdk-devtools";
import { useE2ESDKClient } from "@socialgouv/e2esdk-react";

export const Devtools = () => {
  const client = useE2ESDKClient();
  const ref = useRef<E2ESDKDevtoolsElement>(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.client = client;
  }, [client]);
  return <e2esdk-devtools ref={ref} theme="dark" />;
};

const PUBSUB_TOPIC = "test-messages";

function Sample2({}) {
  const ipfs = useIpfs();
  //const messages = usePubSub(ipfs, PUBSUB_TOPIC);
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState("");
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

  if (ipfs) {
    ipfs.pubsub.subscribe(PUBSUB_TOPIC, (evt) => {
      console.info(
        `pubsub.received: ${uint8ArrayToString(evt.data)} on topic ${evt.topic}`
      );
      setMessages([...messages, uint8ArrayToString(evt.data)]);
    });
  }

  const onDrop: DropzoneOptions["onDrop"] = async (acceptedFiles) => {
    acceptedFiles.forEach(async (file) => {
      const cid = await saveToIpfs(file);
      if (ipfs && cid) {
        console.info("pubsub.publish", cid);
        ipfs.pubsub.publish(PUBSUB_TOPIC, uint8ArrayFromString(cid));
      }
    });
  };

  const send = () => {
    console.log("send", text);
    //const nameFingerprint
    const label = "my-ipfs-workspace";
    const key = client.findKeyByLabel(label);
    ///console.log("keys", keys);
    const encrypted = client.encrypt(text, key?.nameFingerprint);
    console.log("encrypted", encrypted);
    if (ipfs) {
      ipfs.pubsub.publish(PUBSUB_TOPIC, uint8ArrayFromString(encrypted));
      setText("");
    }
  };

  const decryptedMessages = messages.map((msg) => {
    const label = "my-ipfs-workspace";
    try {
      const key = client.findKeyByLabel(label);
      console.log("key", key);
      const decrypted = client.decrypt(msg, key?.nameFingerprint);
      return decrypted;
    } catch (e) {
      console.error(e);
      return msg;
    }
  });

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
        <br />
        <textarea
          onChange={(e) => setText(e.currentTarget.value)}
          style={{ width: 500, height: 100 }}
          value={text}
        ></textarea>
        <br />
        <button onClick={send}>Send</button>
        <br />
        <br />
        <br />
        <div style={{ fontSize: "1.5em" }}>
          {ipfs &&
            decryptedMessages.map((message, i) => <li key={i}>{message}</li>)}
        </div>
        <br />
        <br />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <h1>e2esdk + IPFS demo</h1>
      <E2ESDKClientProvider client={client}>
        <IpfsProvider>
          <Sample2 />
        </IpfsProvider>
        <Devtools />
      </E2ESDKClientProvider>
    </div>
  );
}

export default App;
