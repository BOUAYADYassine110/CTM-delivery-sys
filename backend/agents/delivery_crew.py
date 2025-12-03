"""
Simplified CrewAI integration for CTM Delivery System
"""
from crewai import Agent, Task, Crew, Process
import os

def create_delivery_crew():
    """Create the delivery management crew with 3 agents"""
    
    # Agent 1: Order Processor
    order_agent = Agent(
        role='Order Processing Specialist',
        goal='Validate and process incoming delivery orders efficiently',
        backstory='Expert in order validation with 10 years experience in logistics',
        verbose=True,
        allow_delegation=False,
        llm='groq/llama-3.3-70b-versatile'
    )
    
    # Agent 2: Route Optimizer
    route_agent = Agent(
        role='Route Optimization Expert',
        goal='Calculate optimal delivery routes considering traffic and weather',
        backstory='AI specialist in route optimization and logistics planning',
        verbose=True,
        allow_delegation=False,
        llm='groq/llama-3.3-70b-versatile'
    )
    
    # Agent 3: Driver Coordinator
    driver_agent = Agent(
        role='Driver Coordination Manager',
        goal='Assign best available drivers to delivery orders',
        backstory='Experienced in driver management and resource allocation',
        verbose=True,
        allow_delegation=False,
        llm='groq/llama-3.3-70b-versatile'
    )
    
    return {
        'order_agent': order_agent,
        'route_agent': route_agent,
        'driver_agent': driver_agent
    }

def process_order_with_agents(order_data):
    """Process order through agent crew"""
    
    # Check if Groq key exists
    groq_key = os.getenv('GROQ_API_KEY', '').strip()
    if not groq_key:
        return {
            'success': True,
            'result': 'Order validated (Mock mode - Add GROQ_API_KEY to .env for AI analysis)',
            'order_id': order_data.get('_id')
        }
    
    agents = create_delivery_crew()
    
    validate_task = Task(
        description=f"""
        Validate delivery order:
        - From: {order_data.get('sender', {}).get('city')}
        - To: {order_data.get('recipient', {}).get('city')}
        - Weight: {order_data.get('package', {}).get('weight')} kg
        
        Return: VALID or INVALID with reason
        """,
        agent=agents['order_agent'],
        expected_output="Order validation status"
    )
    
    crew = Crew(
        agents=[agents['order_agent']],
        tasks=[validate_task],
        process=Process.sequential,
        verbose=True,
        memory=True,
        embedder={
            "provider": "groq",
            "config": {"model": "llama-3.3-70b-versatile"}
        }
    )
    
    try:
        result = crew.kickoff()
        return {'success': True, 'result': str(result)}
    except Exception as e:
        return {'success': False, 'error': str(e)}
