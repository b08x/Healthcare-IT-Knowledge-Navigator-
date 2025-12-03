# LLM Prompt Template: Screen Recording to Documentation

This file provides a structured JSON template for a prompt designed to guide a Large Language Model (LLM) in generating technical documentation from screen recordings. This template can be used by a coding assistant or an application backend to construct a complete prompt.

The template defines the necessary components: a system instruction (persona), a style guide, a placeholder for context chunks from the recording, and a placeholder for the document's topic. An example payload is included to demonstrate how to populate the template.

```json
{
  "prompt_name": "Screen_Recording_To_Documentation_Prompt",
  "description": "A structured prompt for a Large Language Model (LLM) to generate technical documentation by transforming analyzed data from a screen recording session into a well-structured instructional guide.",
  "prompt_structure": {
    "system_instruction": {
      "role": "You are an expert technical writer specializing in creating clear, concise, and easy-to-follow user guides. Your task is to transform a list of actions and notes from a screen recording session into a well-structured instructional document in Markdown format.",
      "rules": [
        "Use clear headings, ordered lists for steps, and bold text for UI elements.",
        "Combine related small steps into a single, logical instruction.",
        "Rephrase the raw user narration into professional, instructional language.",
        "Create a brief introductory and concluding paragraph."
      ]
    },
    "style_guide": {
      "purpose": "Provides foundational knowledge and stylistic rules for the generated document.",
      "rules": [
        "Always refer to the main application as \"The Platform\".",
        "Button names should be enclosed in single quotes, e.g., 'Submit'.",
        "Menu paths should be written as: File > Open > Project."
      ]
    },
    "context_chunks": {
      "purpose": "Provides the curated, prioritized context from the screen recording session. These are the specific steps to be documented.",
      "placeholder": "A JSON array of chunk objects, where each object has a 'type' and 'detail' key.",
      "chunk_types": [
        "User Action",
        "UI Interaction",
        "Verbal Narration",
        "System Response"
      ]
    },
    "documentation_topic": {
      "purpose": "The specific task or title for the document to be generated.",
      "placeholder": "A string defining the topic, e.g., 'How to Create a New Project'."
    }
  },
  "example_payload": {
    "documentation_topic": "How to Create a New Project",
    "context_chunks": [
      {
        "type": "User Action",
        "detail": "Clicked the 'File' menu."
      },
      {
        "type": "User Action",
        "detail": "Clicked the 'New Project' menu item."
      },
      {
        "type": "System Response",
        "detail": "'New Project' dialog appeared."
      },
      {
        "type": "UI Interaction",
        "detail": "Entered 'My First Project' into the input field labeled 'Project Name'."
      },
      {
        "type": "Verbal Narration",
        "detail": "Make sure you give your project a descriptive name."
      },
      {
        "type": "UI Interaction",
        "detail": "Clicked the 'Create' button."
      },
      {
        "type": "System Response",
        "detail": "A new project dashboard was displayed."
      }
    ]
  }
}
```
