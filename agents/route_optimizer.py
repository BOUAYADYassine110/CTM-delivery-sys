from crewai import Agent, Task

def create_route_optimizer_agent():
    return Agent(
        role='Route Optimization Agent',
        goal='Optimize delivery routes for efficiency and speed',
        backstory="""You are a logistics expert specializing in route optimization
        for CTM Messagerie across Moroccan cities. You use advanced algorithms to
        minimize delivery time and fuel costs while ensuring timely deliveries.""",
        verbose=True,
        allow_delegation=False
    )

def create_route_task(orders_data):
    cities = [order['recipient']['city'] for order in orders_data]
    return Task(
        description=f"""Optimize delivery route for {len(orders_data)} orders:
        Destinations: {', '.join(set(cities))}
        
        Consider:
        - Distance between cities
        - Traffic patterns in Morocco
        - Urgency levels
        - Vehicle capacity
        
        Provide optimal route sequence and estimated delivery times.""",
        expected_output='Optimized route with sequence and time estimates'
    )
