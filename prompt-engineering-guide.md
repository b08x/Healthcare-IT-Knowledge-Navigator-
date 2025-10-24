# LLM Prompt Engineering Guide: Generating Technical Docs from Screen Recordings

## Overview

This guide details the process of transforming analyzed data from a screen recording—a dynamic, interactive user session—into a static, shareable, and highly relevant technical support document. The core of this process is the intelligent construction of a multi-part prompt for a Large Language Model (LLM) like Gemini.

This process intelligently combines a foundational style guide with the specific, user-curated details from the screen recording session.

---

### 1. Context Gathering: Deconstructing the Screen Recording into "Chunks"

As the application processes a screen recording, it doesn't see a simple video. Instead, it analyzes and deconstructs the entire session into a timeline of discrete, self-contained "chunks" of information. These chunks are the raw materials for the documentation.

**Types of Context Chunks:**

*   **User Actions:** High-level descriptions of what the user did (e.g., `User opened the 'File' menu.`).
*   **UI Interactions:** Granular interactions with specific UI elements (e.g., `User clicked the button with text 'Create New Project'`).
*   **Verbal Narration:** Key phrases transcribed from the user's speech (e.g., `"First, we need to set up the project configuration."`).
*   **System Responses:** Observable changes on the screen as a result of user actions (e.g., `The 'Project Configuration' dialog box appeared.`).

### 2. User Curation: Selecting the "Golden Path"

The raw timeline of chunks will contain errors, pauses, and exploratory actions that are not relevant to the final document. The application must present this timeline to the user.

Next to each chunk in the timeline, a checkbox allows the user to perform a crucial curation step. By selecting these boxes, the user tags the key chunks that represent the correct, most efficient path for the procedure. This filters out noise and ensures the final document is focused and actionable.

### 3. Defining the Goal: Setting the Document Topic

The user provides a clear, descriptive title or topic for the final document in a dedicated input field.

*   **Example:** `"How to Create and Configure a New Project"`

This topic acts as the primary instruction and title for the LLM, defining the document's scope and purpose.

### 4. The Smart Prompt: Combining All The Pieces

When the user clicks "Generate Document," the application constructs a sophisticated, multi-part prompt designed for high-quality, context-aware generation. A simple instruction is not enough; the prompt must be layered with context.

#### Prompt Structure Template:

````
[SYSTEM INSTRUCTION]

You are an expert technical writer specializing in creating clear, concise, and easy-to-follow user guides. Your task is to transform a list of actions and notes from a screen recording session into a well-structured instructional document in Markdown format.

- Use clear headings, ordered lists for steps, and bold text for UI elements.
- Combine related small steps into a single, logical instruction.
- Rephrase the raw user narration into professional, instructional language.
- Create a brief introductory and concluding paragraph.

---
[FOUNDATIONAL KNOWLEDGE / STYLE GUIDE]

- Always refer to the main application as "The Platform".
- Button names should be enclosed in single quotes, e.g., 'Submit'.
- Menu paths should be written as: File > Open > Project.

---
[PRIORITIZED CONTEXT FROM SCREEN RECORDING (Follow these steps)]

- User Action: Clicked the 'File' menu.
- User Action: Clicked the 'New Project' menu item.
- System Response: 'New Project' dialog appeared.
- UI Interaction: Entered 'My First Project' into the input field labeled 'Project Name'.
- Verbal Narration: "Make sure you give your project a descriptive name."
- UI Interaction: Clicked the 'Create' button.
- System Response: A new project dashboard was displayed.

---
[THE TASK / DOCUMENTATION TOPIC]

Generate a guide for the topic: "How to Create a New Project"
````

### 5. AI Synthesis and Generation

The LLM receives this rich, layered prompt and performs a synthesis task:

1.  **Understands its Role:** It adopts the persona of a technical writer.
2.  **Frames the Document:** It uses the user's **topic** as the title and guiding purpose.
3.  **Adheres to Style:** It follows the rules laid out in the **style guide**.
4.  **Builds the Core Content:** It uses the curated **context chunks** as the primary source material, transforming the raw, chronological steps into a polished, human-readable narrative. It will smooth out the language, merge actions, and structure the steps logically.

The final output is a structured Markdown document that is not only procedurally accurate (thanks to the screen recording analysis) but also perfectly customized to the specific, curated workflow the user defined.
