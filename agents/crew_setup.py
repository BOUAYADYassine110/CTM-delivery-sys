from crewai import Crew, Process
from order_agent import create_order_agent, create_order_task
from warehouse_agent import create_warehouse_agent, create_warehouse_task
from route_optimizer import create_route_optimizer_agent, create_route_task

def process_order_with_crew(order_data):
    """Process a single order through the agent crew"""
    
    # Create agents
    order_agent = create_order_agent()
    warehouse_agent = create_warehouse_agent()
    route_agent = create_route_optimizer_agent()
    
    # Create tasks
    order_task = create_order_task(order_data)
    warehouse_task = create_warehouse_task(order_data)
    route_task = create_route_task([order_data])
    
    # Assign agents to tasks
    order_task.agent = order_agent
    warehouse_task.agent = warehouse_agent
    route_task.agent = route_agent
    
    # Create crew
    crew = Crew(
        agents=[order_agent, warehouse_agent, route_agent],
        tasks=[order_task, warehouse_task, route_task],
        process=Process.sequential,
        verbose=True
    )
    
    # Execute
    result = crew.kickoff()
    return result

def optimize_routes_with_crew(orders_data):
    """Optimize routes for multiple orders"""
    
    route_agent = create_route_optimizer_agent()
    route_task = create_route_task(orders_data)
    route_task.agent = route_agent
    
    crew = Crew(
        agents=[route_agent],
        tasks=[route_task],
        process=Process.sequential,
        verbose=True
    )
    
    result = crew.kickoff()
    return result
