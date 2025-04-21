export let assistantId = "asst_useEgvQwrSxKWNN0sV63yA0o"; // set your assistant ID here

if (assistantId === "") {
  assistantId = process.env.OPENAI_ASSISTANT_ID;
}
