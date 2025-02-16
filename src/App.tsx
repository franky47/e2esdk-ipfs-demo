import { useState, useRef, useEffect, useContext } from "react";
import Dropzone, { DropzoneOptions } from "react-dropzone";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

import "@socialgouv/e2esdk-devtools";
import { E2ESDKClientProvider } from "@socialgouv/e2esdk-react";

import { IpfsProvider } from "./components/IpfsProvider";
import { IpfsStatus } from "./components/IpfsStatus";
import { DevTools } from "./components/DevTools";
import { ipfsContext } from "./ipfsContext";
import { client } from "./e2esdk-client";

import "./App.css";

const PUBSUB_TOPIC = "test-messages";
const E2ESDK_KEY_LABEL = "my-ipfs-workspace";

function Sample2() {
  const ipfs = useContext(ipfsContext);
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [ready, setReady] = useState<Boolean>(false);

  const saveFileToIpfs = async (file: File) => {
    if (!ipfs) {
      return;
    }
    const fileDetails = {
      path: file.name,
      content: file,
    };

    // todo: encrypt

    const options = {
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

  const onMessage = (data: any) => {
    const newText = uint8ArrayToString(data);
    console.info(`pubsub.received: ${newText} on topic ${PUBSUB_TOPIC}`);
    setMessages((messages) => [...messages, newText]);
  };

  useEffect(
    function () {
      if (ipfs && !messages.length) {
        console.info(`Subscribed to ${PUBSUB_TOPIC}`);
        ipfs.pubsub.subscribe(PUBSUB_TOPIC, (evt) => onMessage(evt.data));
        setReady(true);
      }
      return () => {};
    },
    [ipfs, messages]
  );

  const onDrop: DropzoneOptions["onDrop"] = async (acceptedFiles) => {
    acceptedFiles.forEach(async (file) => {
      const cid = await saveFileToIpfs(file);
      if (ipfs && cid) {
        console.info("pubsub.publish", cid);
        ipfs.pubsub.publish(PUBSUB_TOPIC, uint8ArrayFromString("cid:" + cid));
      }
    });
  };

  const send = () => {
    const key = client.findKeyByLabel(E2ESDK_KEY_LABEL);
    if (key) {
      const encrypted = client.encrypt(text, key?.nameFingerprint);
      if (ipfs && ready) {
        ipfs.pubsub.publish(
          PUBSUB_TOPIC,
          uint8ArrayFromString("cipher:" + encrypted)
        );
        setText("");
      }
    }
  };

  const decryptedMessages =
    (messages &&
      messages.map((msg) => {
        if (msg.startsWith("cipher:")) {
          try {
            const key = client.findKeyByLabel(E2ESDK_KEY_LABEL);
            if (key) {
              return client.decrypt(msg.slice(7), key?.nameFingerprint);
            }
          } catch (e) {
            console.error(e);
            return msg;
          }
        }
        return msg;
      })) ||
    [];

  return (
    <div>
      <div>
        <button onClick={() => onMessage(uint8ArrayFromString("coucou"))}>
          setMessages
        </button>
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
        <button disabled={!ready} onClick={send}>
          Send
        </button>
        <br />
        <br />
        <br />
        <div style={{ fontSize: "1.5em" }}>
          {ipfs &&
            decryptedMessages.map((message, i) => (
              <li key={i}>{message as string}</li>
            ))}
        </div>
        <br />
        <br />
      </div>
    </div>
  );
}

function App() {
  return (
    <E2ESDKClientProvider client={client}>
      <IpfsProvider>
        <div className="App">
          <h1>e2esdk + IPFS demo</h1>
          <IpfsStatus />
          <Sample2 />
        </div>
      </IpfsProvider>
      <br />
      <br />
      <br />
      <DevTools />
    </E2ESDKClientProvider>
  );
}

export default App;
