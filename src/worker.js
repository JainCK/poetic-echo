import { pipeline } from "@xenova/transformers";

let generator = null;

// Initialize the model
async function initialize() {
  try {
    generator = await pipeline("text-generation", "Xenova/gpt2");
    self.postMessage({ ready: true });
  } catch (error) {
    self.postMessage({
      error: `Failed to initialize the model: ${error.message}`,
    });
  }
}

self.addEventListener("message", async (event) => {
  if (event.data.initialize) {
    initialize();
  } else if (event.data.inputText) {
    if (!generator) {
      self.postMessage({ error: "Model not initialized." });
      return;
    }

    try {
      const output = await generator(event.data.inputText, {
        max_new_tokens: 50,
        num_return_sequences: 1,
      });

      self.postMessage({ poem: output[0].generated_text });
    } catch (error) {
      self.postMessage({ error: `Error during generation: ${error.message}` });
    }
  }
});
