import { Client } from '@socialgouv/e2esdk-client'
import { concat, decryptFileContents } from '@socialgouv/e2esdk-crypto'
import { useE2ESDKClient } from '@socialgouv/e2esdk-react'
import { IPFS } from 'ipfs-core-types'
import { useEffect, useState } from 'react'
import { IpfsFileMetadataSchema } from '../schemas'

/** Uses `URL.createObjectURL` free returned ObjectURL with `URL.RevokeObjectURL` when done with it.
 *
 * @param {string} cid CID you want to retrieve
 * @param {string} mime mimetype of image
 * @param {number} limit size limit of image in bytes
 * @returns ObjectURL
 */
async function loadImgURL(
  ipfs: IPFS,
  client: Client,
  { cid, type, key }: IpfsFileMetadataSchema,
  limit = 1_000_000_000
) {
  if (cid == '' || cid == null || cid == undefined) {
    return
  }
  const chunks = []
  for await (const chunk of ipfs.cat(cid, { length: limit })) {
    chunks.push(chunk)
  }
  const content = concat(...chunks)
  const cleartext = decryptFileContents(client.sodium, content, {
    algorithm: 'secretBox',
    key: client.decode(key),
  })
  return URL.createObjectURL(new Blob([cleartext], { type }))
}

type IpfsImageProps = {
  ipfs: IPFS
  metadata: IpfsFileMetadataSchema
  nameFingerprint: string
}

export function IpfsImage({ ipfs, nameFingerprint, metadata }: IpfsImageProps) {
  const client = useE2ESDKClient()
  const [data, setData] = useState<string | null>(null)
  useEffect(() => {
    let loaded = false
    async function loadImage() {
      try {
        const imageData = await loadImgURL(ipfs, client, metadata)
        if (imageData) {
          setData(imageData)
        }
      } catch (e) {
        //@ts-ignore
        console.error('error loading image', cid, e.message)
      }
    }
    if (ipfs && !loaded) {
      loaded = true
      loadImage()
    }
  }, [ipfs, metadata, client, nameFingerprint])
  return (
    <img
      width={100}
      style={{
        border: '1px solid silver',
        minWidth: 100,
        minHeight: 100,
      }}
      src={data || 'about:blank'}
    />
  )
}
