from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import csv
import uuid
from datetime import datetime
from fastapi import Request
import os 
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    # In production, replace "*" with your actual frontend domain, e.g. ["https://myapp.com"]
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client - Pulls from environment variable now
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("No OPENAI_API_KEY found in environment variables")

client = OpenAI(api_key=api_key)

# Request schema
class RequestData(BaseModel):
    system_prompt: str
    user_prompt: str
    history_weak: list
    history_strong: list

@app.post("/generate")
def generate_response(request: RequestData):
    # Format history for Model A
    formatted_weak = [{"role": "system", "content": request.system_prompt}]
    for turn in request.history_weak:
        formatted_weak.append({ "role": "user", "content": turn["user_prompt"] })
        formatted_weak.append({ "role": "assistant", "content": turn["model_response"] })

    # Format history for Model B
    formatted_strong = [{"role": "system", "content": request.system_prompt}]
    for turn in request.history_strong:
        formatted_strong.append({ "role": "user", "content": turn["user_prompt"] })
        formatted_strong.append({ "role": "assistant", "content": turn["model_response"] })

    # Add current user prompt
    formatted_weak.append({ "role": "user", "content": request.user_prompt })
    formatted_strong.append({ "role": "user", "content": request.user_prompt })

    # Generate responses
    response_weak = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=formatted_weak
    )

    response_strong = client.chat.completions.create(
        model="gpt-4",
        messages=formatted_strong
    )

    return {
        "weak": response_weak.choices[0].message.content,
        "strong": response_strong.choices[0].message.content
    }

@app.post("/nudge")
def generate_nudge(request: RequestData):
    """
    Handle nudge (feedback) requests for Model B (strong model).
    """
    # Prepare conversation history for Model B
    formatted_strong = [{"role": "system", "content": request.system_prompt}]
    for turn in request.history_strong:
        formatted_strong.append({"role": "user", "content": turn["user_prompt"]})
        formatted_strong.append({"role": "assistant", "content": turn["model_response"]})

    # Add the nudge as the new user input
    formatted_strong.append({"role": "user", "content": request.user_prompt})

    # Generate response using GPT-4 (Model B)
    response = client.chat.completions.create(
        model="gpt-4",
        messages=formatted_strong
    )

    return {
        "nudge_response": response.choices[0].message.content
    }

# -------------------------------
# 🟢 Save conversation endpoint
# -------------------------------
@app.post("/save_conversation")
async def save_conversation(request: Request):
    """
    Save the full conversation and evaluation summary to a CSV file with a unique conversation ID,
    including ratings for both Model A and Model B from the evaluation form.
    """
    data = await request.json()

    conv_id = str(uuid.uuid4())  # This is your 'task_id'
    timestamp = datetime.utcnow().isoformat()

    # --- Extract all data from the request ---
    system_prompt = data.get("system_prompt", "")
    history_weak = data.get("history_weak", [])
    history_strong = data.get("history_strong", [])
    evaluations = data.get("evaluations", [])
    
    # New fields from frontend
    failure_mode = data.get("failure_mode", "")    # 'failure_type'
    intent = data.get("intent", "")                # 'category'
    sub_category = data.get("sub_category", "")    # 'sub_category'
    overall_failure = data.get("overall_failure", "") # 'failure_rate'


    # --- Process evaluations to find failure turns and comments ---
    failure_comments_list = []
    failure_turns_list = []

    for i, eval_turn in enumerate(evaluations):
        turn_num = i + 1
        failures = eval_turn.get("failures", {})
        has_failure = failures.get("A", False) or failures.get("B", False)
        
        if has_failure:
            failure_turns_list.append(str(turn_num))
            comment = eval_turn.get("comment", "")
            if comment:
                # Add comment with turn number for clarity
                failure_comments_list.append(f"Turn {turn_num}: {comment}")
    
    # Join lists into single strings for the CSV
    failure_comments_str = "; ".join(failure_comments_list) if failure_comments_list else "N/A"
    failure_turns_str = ", ".join(failure_turns_list) if failure_turns_list else "N/A"


    # --- Build the "whole_conversation" string (Improved Logic) ---
    conversation_summary = []
    # Use all lists to find the max number of turns
    total_turns = max(len(history_weak), len(history_strong), len(evaluations))

    for i in range(total_turns):
        conversation_summary.append(f"--- Turn {i+1} ---")
        
        # Get user prompt (prefer weak, fallback to strong)
        user_prompt = "N/A"
        if i < len(history_weak) and history_weak[i].get('user_prompt'):
            user_prompt = history_weak[i].get('user_prompt')
        elif i < len(history_strong) and history_strong[i].get('user_prompt'):
            user_prompt = history_strong[i].get('user_prompt')
        
        conversation_summary.append(f"User: {user_prompt}")

        # Get Model A
        if i < len(history_weak):
            conversation_summary.append(f"Model A (weak): {history_weak[i].get('model_response', 'N/A')}")
        else:
            conversation_summary.append("Model A (weak): N/A")

        # Get Model B
        if i < len(history_strong):
            conversation_summary.append(f"Model B (strong): {history_strong[i].get('model_response', 'N/A')}")
        else:
            conversation_summary.append("Model B (strong): N/A")

        # Add evaluation info if exists
        if i < len(evaluations):
            eval_turn = evaluations[i]
            ratings = eval_turn.get('ratings', {})
            conversation_summary.append(f"[Evaluation for Turn {i+1}]")
            conversation_summary.append(f"  Selected Model: {eval_turn.get('selectedModel','N/A')}")
            conversation_summary.append(f"  Model A Rating: {ratings.get('A', 'N/A')}")
            conversation_summary.append(f"  Model B Rating: {ratings.get('B', 'N/A')}")
            conversation_summary.append(f"  Model A Failed: {eval_turn.get('failures', {}).get('A', False)}")
            conversation_summary.append(f"  Model B Failed: {eval_turn.get('failures', {}).get('B', False)}")
            conversation_summary.append(f"  Failure Comment: {eval_turn.get('comment','N/A')}")
            conversation_summary.append(f"  Better Response A: {eval_turn.get('betterResponses', {}).get('A','N/A')}")
            conversation_summary.append(f"  Better Response B: {eval_turn.get('betterResponses', {}).get('B','N/A')}")
        else:
            # This case handles if evaluations list is shorter than history
            conversation_summary.append(f"[Evaluation for Turn {i+1}: N/A]")
            
        conversation_summary.append("\n") # Add a newline for spacing

    conversation_text = "\n".join(conversation_summary)


    # --- Write to CSV ---
    csv_path = "conversations_log.csv"
    
    # Check if file exists to write header
    file_exists = os.path.isfile(csv_path)

    # Define your new header
    header = [
        "task_id",
        "failure_type",
        "category",
        "sub_category",
        "system_prompt",
        "failure_rate",
        "failure_comments",
        "failure_turns",
        "whole_conversation",
        "timestamp"
    ]
    
    # Define the data for the new row
    row = [
        conv_id,
        failure_mode,
        intent,
        sub_category,
        system_prompt,
        overall_failure,
        failure_comments_str,
        failure_turns_str,
        conversation_text,
        timestamp
    ]

    # Write CSV
    with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        if not file_exists:
            writer.writerow(header) # Write header only if file is new
        writer.writerow(row)

    return {
        "conversation_id": conv_id,
        "message": "Conversation saved successfully ✅"
    }

# --- End of File ---
