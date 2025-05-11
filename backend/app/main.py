import sys
import os
from typing import List, Dict, Any
from dotenv import load_dotenv
import logging
import json
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# Revert back to relative import
from .api.websocket import get_websocket_router

# Import langchain components for Groq
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Kisanly AI Agent Backend")

# Configure CORS (adjust origins as needed for development/production)
origins = [os.getenv("FRONTEND_URL", "*")]
if origins == ["*"]:
    origins = ["*"]  # Allow all origins if not specifically set

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

websocket_router = get_websocket_router() # Get the router

# Define the request model for health check
class HealthCheckRequest(BaseModel):
    diseases: List[str]
    products: List[Dict[str, Any]]  # Product objects with at least id and name

# Define the response model item
class HealthCheckResponseItem(BaseModel):
    productId: str
    flag: str  # 'pass' or 'fail'
    comments: str

@app.post("/health-check", response_model=List[HealthCheckResponseItem])
async def health_check(request: HealthCheckRequest):
    try:
        # Initialize Groq client
        # You need to set GROQ_API_KEY in your environment
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY environment variable not set")
        
        llm = ChatGroq(api_key=api_key, model_name="qwen-qwq-32b")
        
        results = []
        
        # Process each product
        for product in request.products:
            # Create a prompt for the LLM
            product_name = product.get('name', 'Unknown product')
            prompt = f"""Evaluate if the product '{product_name}' is safe and beneficial for a person with the following health conditions: {', '.join(request.diseases)}.

            Respond with:
            1. A determination of 'pass' if the product is generally safe and potentially beneficial, or 'fail' if it could be detrimental.
            2. A brief explanation of why the product is beneficial or potentially harmful given these health conditions.
            
            Format your response as a JSON object with two fields: 'flag' (either 'pass' or 'fail') and 'comments' (explanation).
            
            Be sensitive, even if moderation is required give the flag as fail and mention the reason in comments.

            Example response format:
            {{
                "flag": "pass",
                "comments": "This product is safe and may be beneficial because..."
            }}
            
            Only provide the JSON object, no other text not even the <think> tags.
            """
            
            # Call the LLM
            response = llm.invoke([HumanMessage(content=prompt)])
            
            # Parse the response - we expect a JSON string
            try:
                response_content = response.content
                
                # Check if the response contains a valid JSON object
                if not (response_content.strip().startswith('{') and response_content.strip().endswith('}')):
                    
                    # First, remove any thinking tags if present
                    cleaned_response = re.sub(r'<think>.*?</think>', '', response_content, flags=re.DOTALL)
                    
                    # Find JSON object in the cleaned response
                    json_match = re.search(r'({.*})', cleaned_response, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(1)
                        assessment = json.loads(json_str)
                    else:
                        assessment = {
                            "flag": "fail",
                            "comments": f"Could not properly analyze {product_name}. Please consult with your healthcare provider."
                        }
                    logger.info(f"No JSON object found in the response for {cleaned_response}")
                else:                    
                    # First, remove any thinking tags if present
                    cleaned_response = re.sub(r'<think>.*?</think>', '', response_content, flags=re.DOTALL)
                    
                    # Find JSON object in the cleaned response
                    json_match = re.search(r'({.*})', cleaned_response, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(1)
                        assessment = json.loads(json_str)
                    else:
                        assessment = {
                            "flag": "fail",
                            "comments": f"Could not properly analyze {product_name}. Please consult with your healthcare provider."
                        }
                
                # Ensure we have the correct keys
                if "flag" not in assessment or "comments" not in assessment:
                    assessment = {
                        "flag": "fail",
                        "comments": f"Analysis incomplete for {product_name}. Please consult with your healthcare provider."
                    }
                
                # Ensure flag is either 'pass' or 'fail'
                if assessment["flag"].lower() not in ["pass", "fail"]:
                    assessment["flag"] = "pass"
                
            except Exception as e:
                print(f"Error processing LLM response: {e}")
                assessment = {
                    "flag": "pass",
                    "comments": f"Error analyzing {product_name}. Please consult with your healthcare provider."
                }
            logger.info(f"Assessment for {product.get('id', '')}: {assessment['flag'].lower()}")
            # Add to results
            results.append(HealthCheckResponseItem(
                productId=product.get('id', ''),
                flag=assessment["flag"].lower(),
                comments=assessment["comments"]
            ))
        
        return results
    
    except Exception as e:
        print(f"Error in health check: {e}")
        raise HTTPException(status_code=500, detail=f"Error performing health check: {str(e)}")

@app.get("/")
async def read_root():
    return {"message": "AI Agent Backend is running"}

# Include WebSocket router
app.include_router(websocket_router) # Use the instance here

print("AI Agent Backend with WebSocket endpoint and health check endpoint is configured.") 