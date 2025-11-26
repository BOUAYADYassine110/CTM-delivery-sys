from flask import Blueprint, jsonify
from utils.db import get_db
from models.agent import Agent

agents_bp = Blueprint('agents', __name__)

@agents_bp.route('/agents/status', methods=['GET'])
def get_agents_status():
    try:
        db = get_db()
        agents = list(db.agents.find())
        
        # If no agents exist, create default ones
        if not agents:
            default_agents = Agent.get_default_agents()
            db.agents.insert_many(default_agents)
            agents = default_agents
        
        return jsonify({
            'success': True,
            'agents': [serialize_agent(agent) for agent in agents]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@agents_bp.route('/agents/<agent_id>', methods=['GET'])
def get_agent(agent_id):
    try:
        db = get_db()
        agent = db.agents.find_one({'agent_id': agent_id})
        if not agent:
            return jsonify({'success': False, 'error': 'Agent not found'}), 404
        return jsonify({'success': True, 'agent': serialize_agent(agent)})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def serialize_agent(agent):
    if '_id' in agent:
        agent['_id'] = str(agent['_id'])
    return agent
