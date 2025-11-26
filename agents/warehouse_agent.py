from crewai import Agent, Task

def create_warehouse_agent():
    return Agent(
        role='Warehouse Manager Agent',
        goal='Manage package sorting and prepare orders for delivery',
        backstory="""You are a warehouse operations expert at CTM Messagerie.
        You handle package sorting, storage allocation, and coordinate with
        delivery agents to ensure smooth operations.""",
        verbose=True,
        allow_delegation=True
    )

def create_warehouse_task(order_data):
    return Task(
        description=f"""Prepare package for delivery:
        Tracking: {order_data.get('tracking_number', 'N/A')}
        Destination: {order_data['recipient']['city']}
        Package Type: {order_data['package']['type']}
        Weight: {order_data['package']['weight']}kg
        
        Assign appropriate storage and prepare for route optimization.""",
        expected_output='Warehouse preparation status and storage location'
    )
