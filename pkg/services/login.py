from flask import Flask, make_response, jsonify, request, g
import dataset
import jwt
import json
from config import login_port
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)
#db_users = dataset.connect('sqlite:///user.db')
db_users_auth = dataset.connect('sqlite:///users_auth.db')

#users_table = db_users['users']
users_auth_table = db_users_auth['UsersAuth']

#For Front-end
@app.route('/login', methods=['GET'])
def authGet():
    if request.method == "GET":
        users = []
        for user in users_auth_table:
            users.append(user)
        return make_response(jsonify(users), 200)

@app.route('/login', methods=['POST'])
def auth():
    if request.method == "POST":
        content = request.json
        user_id = content['user_id']
        username = content['username']
        #password = content['password']

        user = users_auth_table.find_one(username=username)

        if not user:
            # Create a new user in the users_auth database with the password
            user_auth = {
                'user_id': user_id,
                'username': username,
                'post_access': True,
                'comment_access': True,
                'read_access': True,
                'media_access': True
                #'password': password
            }
            users_auth_table.insert(user_auth)

            return make_response(jsonify({'message': 'User added to users_auth'}), 200)
        else:
            return make_response(jsonify({'message': 'User already exists'}), 404)

@app.route('/auth', methods=['POST'])
def login():
    if request.method == "POST":
        content = request.json
        username = content['username']
        #password = content['password']

        #user_access = users_table.find_one(user_id=user_id)
        user = users_auth_table.find_one(username=username)
                                         #, password=password)

        if user:
            payload = {'user_id': user['user_id'], 'access':[]}
            if user['post_access']:
                payload['access'].append('post')
            if user['comment_access']:
                payload['access'].append('comment')
            if user['read_access']:
                payload['access'].append('read')
            if user['media_access']:
                payload['access'].append('media')

            token = payload
            # token = jwt.encode(payload, 'secret_key', algorithm='HS256')
            # decode = jwt.decode(token, "secret_key", algorithms=["HS256"])
            # print(decode)

            return make_response(jsonify({'token': token}), 200)
        else:
            return make_response(jsonify({'message': 'Invalid credentials'}), 401)

if __name__ == '__main__':
    app.run(port=login_port)
