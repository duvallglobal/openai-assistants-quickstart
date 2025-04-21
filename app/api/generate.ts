import { NextApiRequest, NextApiResponse } from 'next'
import { openai } from '@utils/openai'
import { isContentText } from '@utils/isContentText'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed')

  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

  try {
    const thread = await openai.beta.threads.create()

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: prompt,
    })

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID!,
    })

    let status = run.status
    while (status !== 'completed' && status !== 'failed') {
      const check = await openai.beta.threads.runs.retrieve(thread.id, run.id)
      status = check.status
      await new Promise((r) => setTimeout(r, 2000))
    }

    if (status === 'failed') {
      return res.status(500).json({ error: 'Run failed' })
    }

    const messages = await openai.beta.threads.messages.list(thread.id)
    const latest = messages.data[0]?.content?.find(isContentText) as any
    const content = latest?.text?.value || '{}'
    const parsed = JSON.parse(content)

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Error during code generation:', err)
    return res.status(500).json({ error: 'Failed to generate code' })
  }
}
