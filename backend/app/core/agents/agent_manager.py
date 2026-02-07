# backend/app/agents/agent_manager.py
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END

from .agent import create_generator_agent, create_examiner_agent


# ---------- Graph State ----------

class State(TypedDict):
    story: str
    feedback: str
    pass_or_not: str
    generator_input:dict


# ---------- Nodes ----------

def generator_node(state: State):
    config= state["generator_input"]
    agent = create_generator_agent(config["model"],config["lang"])

    result = agent.invoke(
        {
            "words_list": config["words"],
            "difficulty": config["difficulty"],
            "style": config["style"],
            "starter": config["starter"],
            "feedback": state.get("feedback", ""),
        }
    )

    return {
        "story": result.content,
        "use_all_words": result.use_all_words,
    }


def examiner_node(state: State):
    config = state["generator_input"]
    agent = create_examiner_agent(config["model"],config["lang"])

    result = agent.invoke(
        {
            "story": state["story"],
            "difficulty": config["difficulty"],
            "style": config["style"],
            "starter": config["starter"],
        }
    )

    return {
        "pass_or_not": result.pass_or_not,
        "feedback": result.feedback,
    }


# ---------- Routing ----------

def route(state: State):
    if state["pass_or_not"] == "pass":
        return END
    return "generator"


# ---------- Workflow ----------

def build_workflow():
    graph = StateGraph(State)

    graph.add_node("generator", generator_node)
    graph.add_node("examiner", examiner_node)

    graph.add_edge(START, "generator")
    graph.add_edge("generator", "examiner")
    graph.add_conditional_edges("examiner", route)

    return graph.compile()
