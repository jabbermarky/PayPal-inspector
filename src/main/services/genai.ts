import OpenAI from "openai";
const OPENAI_API_KEY = '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';
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const BRANDI = 'asst_hgQI3zd62AJEbHZjmKudrGyF';

export async function testCompletion() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: "Write a haiku about recursion in programming.",
      },
    ],
  });
  return completion.choices[0].message;
}


export async function callAssistant(url: string): Promise<object> {
  const run = await openai.beta.threads.createAndRun({
    assistant_id: BRANDI,
    thread: {
      messages: [
        { role: "user", content: `What can you tell me about ${url}?` },
      ],
    },
  });

  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(
      run.thread_id
    );
    for (const message of messages.data.reverse()) {
      console.log(`${message.role} > ${message.content[0]}`);
    }
  } else {
    console.log(run.status);
  }
  return run;
}