from flask import Blueprint, request, jsonify
from agents.delivery_crew import process_order_with_agents
from utils.auth import role_required
from models.user import User

crew_bp = Blueprint('crew', __name__)

@crew_bp.route('/crew/process-order', methods=['POST'])
@role_required(User.ROLE_ADMIN, User.ROLE_EMPLOYEE)
def process_with_crew(current_user):
    """Process order using CrewAI agents"""
    try:
        data = request.json
        result = process_order_with_agents(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
