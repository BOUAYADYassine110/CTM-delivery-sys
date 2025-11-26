from crewai import Agent, Task

def create_order_agent():
    return Agent(
        role='Order Processing Agent',
        goal='Validate and process incoming delivery orders efficiently',
        backstory="""You are an expert order processor for CTM Messagerie.
        You validate order details, check for completeness, and ensure all
        information is accurate before passing to the warehouse team.""",
        verbose=True,
        allow_delegation=True
    )

def create_order_task(order_data):
    return Task(
        description=f"""Process the following order:
        Sender: {order_data['sender']['name']} from {order_data['sender']['city']}
        Recipient: {order_data['recipient']['name']} in {order_data['recipient']['city']}
        Package: {order_data['package']['weight']}kg, Type: {order_data['package']['type']}
        Urgency: {order_data['package']['urgency']}
        
        Validate all details and confirm the order is ready for warehouse processing.""",
        expected_output='Order validation status and any issues found'
    )
