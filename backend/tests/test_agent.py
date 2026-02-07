from app.core.llm_client import LLMClient
def test_generate_story():
    client = LLMClient(model="gemini-pro")
    result = client.generate_story(
        lang="swedish",
        words=["katt", "äventyr", "vänskap"],
        difficulty="A2",
        style="fantasy",
        starter="Det var en gång en liten katt som drömde om äventyr."
    )
    #逐步检查大模型返回结果 的结构和内容
    assert "story" in result
    assert "status" in result
    assert "feedback" in result
    print("Generated Story:", result["story"])
    print("Status:", result["status"])
    print("Feedback:", result["feedback"])
    
if __name__ == "__main__":
    test_generate_story()