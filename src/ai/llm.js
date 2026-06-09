const LLM_PROVIDER = import.meta.env.LLM_PROVIDER || 'openai'
const LLM_MODEL = import.meta.env.LLM_MODEL || 'gpt-4o-mini'
const LLM_PROXY_URL = import.meta.env.LLM_PROXY_URL || ''

export async function queryLLM(prompt, options = {}) {
  const { temperature = 0.7, maxTokens = 1024 } = options
  const endpoint = LLM_PROXY_URL || '/api/openai/v1/chat/completions'
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: LLM_MODEL, messages: [{ role: 'user', content: prompt }], temperature, max_tokens: maxTokens })
  })
  if (!response.ok) { console.error('[llm] Request failed:', response.status); return null }
  const data = await response.json()
  return data.choices?.[0]?.message?.content || null
}

export async function generateContent(systemPrompt, userPrompt, options = {}) {
  const { temperature = 0.75, maxTokens = 1800 } = options
  const endpoint = LLM_PROXY_URL || '/api/openai/v1/chat/completions'
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    })
  })
  if (!response.ok) { console.error('[llm] generateContent failed:', response.status); return null }
  const data = await response.json()
  return data.choices?.[0]?.message?.content || null
}

export const hasLLMKey = () => true
export default { queryLLM, generateContent, LLM_PROVIDER, LLM_MODEL }
