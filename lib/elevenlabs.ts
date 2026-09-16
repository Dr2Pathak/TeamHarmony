export async function transcribeAudio(audioBuffer: Buffer, fileName: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', new Blob([audioBuffer]), fileName)
  formData.append('model_id', 'scribe_v1')

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ElevenLabs transcription failed: ${error}`)
  }

  const data = await response.json()
  return data.text
}
