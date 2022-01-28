import sanityClient from '@sanity/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  useCdn: process.env.NODE_ENV === 'production',
  apiVersion: '2021-03-25',
  token: process.env.SANITY_API_TOKEN
}

const client = sanityClient(config)

export default async function comment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { _id, name, email, comment } = JSON.parse(req.body)

  try {
    const rs = await client.create({
      _type: 'comment',
      post: {
        _type: 'reference',
        _ref: _id
      },
      name,
      email,
      comment
    })

  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: 'Message could not be submitted' })
  }
  return res.status(200).json({ msg: 'Comment submitted' })
}
