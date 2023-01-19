import { IPFS } from "ipfs-core-types";
import { useState, useEffect } from "react";

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
    content.push(chunk);
  }
  return URL.createObjectURL(new Blob(content, { type: mime }));
}

export function IpfsImage({ ipfs, cid }: { ipfs: IPFS; cid: string }) {
  const [data, setData] = useState<string | null>(null);
  useEffect(() => {
    let loaded = false;
    async function loadImage() {
      try {
        const imageData = await loadImgURL(ipfs, cid, "image/jpeg");
        if (imageData) {
          setData(imageData);
        }
      } catch (e) {
        //@ts-ignore
        console.error("error loading image", cid, e.message);
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
