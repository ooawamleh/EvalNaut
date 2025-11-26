# EvalNaut Backend API

This is the FastAPI backend service for the Ounnaut application. It handles interactions with OpenAI (GPT-3.5 and GPT-4), manages conversation state, and logs evaluation data to CSV.

## Features
- **Dual Model Generation:** Generates responses from both a "Weak" (GPT-3.5) and "Strong" (GPT-4) model.
- **Nudge System:** Allows users to provide feedback to the strong model to correct its course.
- **Data Logging:** Saves full conversation history, user evaluations, and failure analysis to CSV.

## Prerequisites
- Python 3.9+
- OpenAI API Key

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend