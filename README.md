# EvalNaut - AI Model Evaluation Platform

EvalNaut is a dual-model evaluation platform designed to facilitate A/B testing, comparison, and data collection for Large Language Models. It generates parallel responses from a Weak model (GPT-3.5) and a Strong model (GPT-4.1), enabling side-by-side evaluation.

The system includes:

  * A progressive conversation flow

  * Detailed failure categorization

  * A Nudge mechanism to refine the Strong model’s behavior

  * Automated logging of responses, comparisons, failure types, comments, and user ratings

EvalNaut is built as part of an RLHF (Reinforcement Learning with Human Feedback) workflow, allowing the creation of structured datasets for improving model alignment and robustness.


## 📂 Project Structure

```text
├── backend/            # FastAPI server (Python)
│   ├── main.py         # API Endpoints & Logic
│   ├── requirements.txt
│   └── conversations_log.csv (Generated at runtime)
│
└── frontend/           # React Application (TypeScript)
    ├── src/
    │   ├── App.tsx     # Main Interface
    │   └── components/ # UI Components
    └── package.json
````

## 🚀 Getting Started

To run this project locally, you will need two terminal windows open: one for the backend and one for the frontend.

### Prerequisites

  * [Node.js](https://nodejs.org/) (v16 or higher)
  * [Python](https://www.python.org/) (v3.9 or higher)
  * An [OpenAI API Key](https://platform.openai.com/)

-----

### 1\. Backend Setup

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**

      * *Mac/Linux:*
        ```bash
        python -m venv venv
        source venv/bin/activate
        ```
      * *Windows:*
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```

3.  **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    Create a file named `.env` inside the `backend/` folder and add your API key (this keeps your key secure):

    ```env
    OPENAI_API_KEY=sk-proj-your-actual-api-key-here
    ```

5.  **Start the Server:**

    ```bash
    uvicorn main:app --reload
    ```

    *The backend will start at `http://localhost:8000`.*

-----

### 2\. Frontend Setup

1.  **Open a new terminal and navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install Node dependencies:**

    ```bash
    npm install
    # If you see errors about missing icons, run:
    npm install lucide-react
    ```

3.  **Start the React App:**

    ```bash
    npm start
    ```

    *The frontend will launch automatically at `http://localhost:3000`.*

-----

## 🛠 Usage Guide

1.  **Configuration:** On the opening screen, select your **Failure Mode** (e.g., Course Correction), **Intent**, and **Sub-Category**.
2.  **System Prompt:** Enter the base instructions for the AI agents.
3.  **Conversation:**
      * Enter a user prompt.
      * The system generates two responses (Model A & Model B).
      * **Nudge:** If Model B fails, use the "Nudge" button to provide feedback and see if it corrects itself.
4.  **Evaluation:** Expand the evaluation form to rate the models and tag any failures.
5.  [cite\_start]**Save:** At the end of the session, the conversation and your evaluations are automatically logged to `backend/conversations_log.csv`. [cite: 1]

