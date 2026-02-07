# backend/app/agents/llm_client.py
from app.core.agents.agent_manager import build_workflow
import os
from typing import Literal


class LLMClient:
    def __init__(self,model: Literal["gemini-pro", "gpt-4o", "deep-seek"]):
        self.workflow = build_workflow()
        self.model= model
        #从系统文件.env按模型名读取
        if model == "gemini-pro":
            os.environ["GOOGLE_API_KEY"] = "AIzaSyD_aXyoQqyoD_-zxeJprBG2NRrnc0UfjvE"
            import vertexai

            # 确保先初始化 Vertex AI
            vertexai.init(project="meow-mory")
        elif model == "gpt-4o":
            os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")  
        elif model == "deep-seek":  
            os.environ["DEEPSEEK_API_KEY"] = os.getenv("DEEPSEEK_API_KEY")

    def generate_story(
        self,
        lang: str,
        words: list[str],
        difficulty: str,
        style: str,
        starter: str = "",
    ):
        config = {
            "lang":lang,
            "words": words,
            "difficulty": difficulty,
            "style": style,
            "starter": starter,
            "model": self.model,
        }
        '''
        state = self.workflow.invoke(
            {"feedback": "123","generator_input": config}
        )
        

        return {
            "story": state["story"],
            "status": state["pass_or_not"],
            "feedback": state.get("feedback", ""),
        }'''
        #返回一个示例
        return {
            "story": "det finns en gang en katt som het Mjau. Mjau elsket å utforske verden rundt seg og dra på eventyr hver dag.",
            "status": "pass",
            "feedback": "Great story!",}
