# backend/app/agents/agent.py
from typing import Literal, List
from pydantic import BaseModel, Field

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain.agents.structured_output import ToolStrategy


from . import prompts
from .tools import word_count_checker


# ---------- Schemas ----------

class StoryOutput(BaseModel):
    content: str = Field(description="Generated story")
    use_all_words: bool = Field(description="Whether all words are used")


class ExaminerOutput(BaseModel):
    pass_or_not: Literal["pass", "not pass"]
    feedback: str


# ---------- Agent factory ----------

def create_generator_agent(model_name: str, lang: str):
    llm = init_chat_model(
        model_name,
        temperature=0.5,
        max_retries=3
    )

    return create_agent(
        model=llm,
        system_prompt=prompts.AGENT_GENERATOR_SYSTEM_PROMPT.format(lang=lang),
        tools=[word_count_checker],
        response_format=ToolStrategy(schema=StoryOutput),
    )


def create_examiner_agent(model_name: str, lang: str):
    llm = init_chat_model(
        model_name,
        temperature=0.0,
        max_retries=3
    )

    return create_agent(
        model=llm,
        system_prompt=prompts.AGENT_EXAMINER_SYSTEM_PROMPT.format(lang=lang),
        response_format=ToolStrategy(schema=ExaminerOutput),
    )
