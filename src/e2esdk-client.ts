import { Client } from '@socialgouv/e2esdk-client'
import qs from 'query-string'

const params = qs.parse(document.location.hash)

const serverURL = 'https://e2esdk.dev.fabrique.social.gouv.fr'
const serverPublicKey = '_XDQj6-paJAnpCp_pfBhGUUe6cA0MjLXsgAOgYDhCRI'

const mainKeyStr = params.mainKey as string
const userId = params.userId as string

export const client = new Client({
  serverURL: serverURL,
  serverPublicKey: serverPublicKey,
  handleNotifications: true,
})

const mainKey = client.decode(mainKeyStr)
await client.sodium.ready

client
  .signup(userId, mainKey)
  .catch((e) => {
    console.log(e.message)
    if (e.message === 'This account was already registered') {
      return client.login(userId, mainKey)
    }
    throw e
  })
  .finally(() => {
    client.sodium.memzero(mainKey)
    //  return client.createKey("my-ipfs-workspace", "secretBox");
  })
