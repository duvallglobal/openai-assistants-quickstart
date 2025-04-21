import { openai } from '../utils/openai'
import { isContentText } from '../utils/isContentText'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

const prompt = process.argv[2]
if (!prompt) {
  console.error('❌ Prompt required. Usage: `npx tsx cli/generate.ts "your prompt"`')
  process.exit(1)
}

async function run() {
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

  const messages = await openai.beta.threads.messages.list(thread.id)
  const latest = messages.data[0]?.content?.find(isContentText) as any
  const content = latest?.text?.value || '{}'
  const parsed = JSON.parse(content)

  for (const file of parsed.files || []) {
    const fullPath = path.join(process.cwd(), file.path, file.filename)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    fs.writeFileSync(fullPath, file.content, 'utf-8')
    console.log(`✅ Wrote ${fullPath}`)
  }
}

run().catch((err) => {
  console.error('❌ Error:', err)
})
