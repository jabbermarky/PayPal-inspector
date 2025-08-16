import OpenAI from "openai";
import fs from 'fs';
import { configStore } from '../services/store';
// import dotenv from 'dotenv';

// dotenv.config();
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// if (!OPENAI_API_KEY) {
//   console.error("OpenAI API key is not set");
//   process.exit(1);
// }

//const OPENAI_API_KEY = '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';
//const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
var openai: OpenAI | null = null;
const BRANDI = 'asst_0gvshl7GZDs6dCUIvxLzWLaj';
const BRANDI_JSON = 'asst_KetBa5TJspGM51mMsie3hBd5';

export interface CallAssistant {
  screenshot?: string; // filename
  url?: string;
}


const SYSTEM_MESSAGE = `** ROLE **
you are an expert at e - commerce websites.You know all of the common payment methods that e - commerce websites use.You know what the user workflows are for the most common e - commerce use cases and are able to discern the different steps in the buyer journey.

** TASK **
You will analyze a webpage for logos of payment methods and buttons with payment options on the button.  
You will identify which payment methods are present in the webpage, and also the size of each payment method relative to other payment methods. Note that payment options may be in multiple locations in the webpage, for example a prominent payment button and multiple payment options in the page footer. Include multiple instances of each payment method when the payment method appears multiple times.Try to differentiate when a payment method is shown on a button vs shown as a logo or "mark".Many logos may be shown near the bottom of the page in the "footer".
These are the important payment methods to recognize:
- Apple Pay
- Google Pay
- Shop Pay
- American Express
- Visa
- MasterCard
- Diners Club
- Discover
- PayPal
- PayPal Credit
- PayPal Pay Later
- Venmo
- Klarna
- Afterpay
- Other

When  you recognize a valid payment method that is not included in this list, return "Other".

You will discern what step in the buyer journey a webpage most likely represents.If you are unable to determine the step, then you will respond with "unknown".these are the critical buyer journey steps to recognize, with the name of each step:
- "product_list": a  product list or catalog page comprised of multiple products
- "product_details": a product details page showing the details for a single product
- "cart": a shopping cart showing the contents of the buyer's shopping cart
- "checkout": a checkout
- "mini-cart": a mini - cart may show a slide - out cart showing both the product details and something akin to "your cart"

You will try to determine the name of the website / webpage.

** INPUT **
  <webpage>: webpage URL or uploaded screenshot of a webpage

    ** OUTPUT **
    Return your response in a properly formatted JSON object, similar to the following:
{
  "name": <name of the page or site as best you can determine >,
  "page_type": <buyer journey step name >,
  "page_type_reason": <a 1 sentence  rationale for deciding this page type",
  "payment_methods": [
    { "type": <payment_method>, "size": <size relative to other payment methods>, "format": <button, mark or other}, ...
]
}

** EXAMPLE OUTPUT **
{
  "name": "demo_site.demo.com",
  "page_type": "checkout",
  "payment_methods": [
    { "type": "PayPal", "size": "medium", "format": "mark" },
    { "type": "Visa", "size": "medium", "format": "mark" },
    { "type": "MasterCard", "size": "medium", "format": "mark" },
    { "type": "Apple Pay", "size": "larger", "format": "button" }
  ]
}`;

function readBase64File(filePath: string): string | null {
  // Read the file as binary data
  const fileData = fs.readFileSync(filePath);

  if (fileData) {
    // Convert the binary data to Base64
    const base64Data = fileData.toString('base64');
    return base64Data;
  }
  return null;
}

function initOpenAI(): any {
  // create openAI object
  const OPENAI_API_KEY = configStore.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    return { error: "OpenAI API key is not set", openai:null };
  }

  if (!openai) openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  if (!openai) {
    return { error: "Failed starting OpenAI interface", openai: null };
  }
  return { openai: openai };
}

export async function callChat(params: CallAssistant): Promise<object> {
  if (!params.screenshot) {
    return { error: "screenshot parameter is not defined" };
  }
  // Validate file path
  if (!fs.existsSync(params.screenshot)) {
    return { error: "screenshot file does not exist" };
  }

  const result = initOpenAI();
  openai = result.openai;
  if (!openai) {
    return result;
  }

  // Proceed with processing
  try {
    console.log(`callChat screenshot is ${params.screenshot}`);
    let base64_image: string | null = readBase64File(params.screenshot);
    const createParams: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
      model: "gpt-4o-2024-11-20",
      response_format: { "type": "json_object" },
      messages: [
        { role: "system", content: SYSTEM_MESSAGE },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${base64_image}`, detail: "high" }
            }
          ]
        }
      ]
    }
    let chat = await openai.chat.completions.create(createParams);
    let response = chat.choices[0].message.content;
    console.log('callChat returned ', response);
    if (response)
      return JSON.parse(response);
    else
      return { error: "Nothing returned" };
  } catch (err) {
    return { error: err };
  }
}

export async function callAssistant(params: CallAssistant): Promise<object> {
  try {
    let messages: OpenAI.Beta.Threads.ThreadCreateAndRunParams.Thread.Message[] = [];

    if (params.url && !params.screenshot) {
      messages.push({ role: "user", content: `What can you tell me about ${params.url}?` });
    }
    const result = initOpenAI();
    openai = result.openai;
    if (!openai) {
      return result;
    }

    if (params.screenshot) {
      // upload file
      let file = await openai.files.create({ file: fs.createReadStream(params.screenshot), purpose: 'vision' });

      let message: OpenAI.Beta.Threads.ThreadCreateAndRunParams.Thread.Message = {
        role: "user",
        content: [
          {
            "type": "image_file",
            "image_file": {
              "file_id": file.id,
              "detail": "auto",
            }
          }
        ]
      }
      messages.push(message);
    }

    let run = await openai.beta.threads.createAndRun({
      assistant_id: BRANDI_JSON,
      response_format: { "type": "json_object" },
      thread: {
        messages: messages
      }
    });

    const waiting_states = ["queued", "in_progress", "cancelling"];

    // Polling mechanism to see if runStatus is completed
    // This should be made more robust.
    while (waiting_states.includes(run.status)) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      run = await openai.beta.threads.runs.retrieve(run.thread_id, run.id);
    }

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(
        run.thread_id
      );
      for (const message of messages.data.reverse()) {
        console.log(`${message.role} > `, message.content[0]);
      }
    } else {
      console.log(run.status);
    }
    return run;
  } catch (err) {
    console.error("Got error calling OpenAI assistant", err);
    return { error: err };
  }
}