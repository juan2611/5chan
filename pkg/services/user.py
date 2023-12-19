from flask import Flask, make_response, jsonify, request
import dataset
import json
import time
from config import user_port
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)
db = dataset.connect('sqlite:///user.db')

user_table = db['users']


@app.route('/users', methods=['POST'])
def create_user_api():
    if request.method == "POST":
        content = request.json
        content['timestamp'] = time.time()
        content['post_ids'] = json.dumps(content['post_ids'])
        content['comment_ids'] = json.dumps(content['comment_ids'])
        content['post_access'] = True
        content['comment_access'] = True
        content['read_access'] = True
        content['media_access'] = True
        user_id = content['user_id']

        username = content['username']
        for test_user in user_table:
            if test_user['username'] == username:
                return make_response(jsonify({"message": "Username already exists", "result": "FAILED"}), 409)

        user_table.insert(content)
        user = user_table.find_one(user_id=user_id)
        if user:
            return make_response(jsonify({"message": "Registration Successful!", "result": "SUCCESS"}), 201)
        else:
            return make_response(jsonify({"message": "Registration Failed!", "result": "FAILED"}), 404)


@app.route('/users', methods=['GET'])
def get_users_api():
    if request.method == "GET":
        users = []
        for user in user_table:
            users.append(user)
        return make_response(jsonify(users), 200)


@app.route('/users/<user_id>', methods=['GET'])
def get_user_api(user_id):
    if request.method == "GET":
        user = user_table.find_one(user_id=user_id)
        if user:
            return make_response(jsonify(user), 200)
        else:
            return make_response(jsonify(user), 404)


@app.route('/users/<user_id>', methods=['DELETE'])
def delete_user_api(user_id):
    if request.method == "DELETE":
        user_table.delete(user_id=user_id)
        user = user_table.find_one(user_id=user_id)
        if user:
            return make_response(jsonify({"message": "User not deleted", "result": "FAILED"}), 404)
        else:
            return make_response(jsonify({"message": "Deletion Successful!", "result": "SUCCESS"}), 200)


@app.route('/users/<user_id>', methods=['PUT'])
def update_user_api(user_id):
    if request.method == "PUT":
        content = request.json
        user_table.update(content, ['user_id'])
        user = user_table.find_one(user_id=user_id)
        if user:
            return make_response(jsonify({"message": "User details edited", "result": "SUCCESS"}), 200)
        else:
            return make_response(jsonify({"message": "User details could not be changed", "result": "FAILED"}), 404)


if __name__ == '__main__':
    app.run(port=user_port)
