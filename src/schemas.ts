import { fileMetadataSchema } from '@socialgouv/e2esdk-crypto'
import { z } from 'zod'

export const ipfsFileMetadataSchema = fileMetadataSchema.extend({
  cid: z.string(),
})

export type IpfsFileMetadataSchema = z.infer<typeof ipfsFileMetadataSchema>
