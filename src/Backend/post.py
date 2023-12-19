from flask import Flask, make_response, jsonify, request
import dataset
import json
import sys
import time
from config import post_port
from flask_cors import CORS
import base64
from util import *
from Crypto.Random.random import getrandbits
from datetime import datetime, timedelta
from Crypto.Hash import SHA256

app = Flask(__name__)
CORS(app, supports_credentials=True)
post_db = dataset.connect('sqlite:///post.db')
user_resource_db = dataset.connect('sqlite:///user.db')

post_table = post_db['posts']
user_table = user_resource_db['users']
key_file = "resource_key.pub"

keys = {}
expire = {}
def valid_key(addr):
    if addr not in keys:
        return False
    else:
        if datetime.now() > expire[addr]:
            del expire[addr]
            del keys[addr]
            return False
    return True

auth_timeout = 720
p = 577891979226697945570213780521809426563365791435615832711012378975984090706711917615938495479321251358605416479067241081499497036839950356312625597915929364713575346541675959839159009416370898443127459344409878709845697518679122868962118907715571007000916180621970149148136229013170679223203460365617450421691941273835363116508991034178359390084708401581953959008754168771552735521904480713439940947226031866986121762340975621049253684451435399030266860183064954357336799400350480461284469165141631413805707145204708837559352239067360772939965058210616259303108609951008480806667347855751672593239289058012594718617219786601449982343198203231748683266822819073665711182271257734849627858310345536879821077935399795186538030449767160405711762844960031523239541898481869878913445358646928023166940768223088754414136964463018749469689652124543359528248272704783756259254408405133060554006685687358333240561439885337656631093448524482764852413691768290115225854434316473796757712296260976691154626491990747850785649812567977965618087169928752768736500994467612790526523884398574478437931941918120157206366766875928558302834507669957053069399504813957691091119203137043900000222354063927513406469713721166441337402223171582540462531999967
g = 5

def hash_string_sha256_new(input_string):
    return SHA256.new(input_string.encode()).digest()

@app.route('/key-exchange', methods=['POST'])
def diffie_hellman():
    global keys
    if request.method == "POST":
        obj = request.json
        A = int('0x0' + obj['A'], 16)
        s = getrandbits(512)
        keys[request.remote_addr] =  hash_string_sha256_new(f'{A ^ s % p:0x}')
        # print(hash_string_sha256_debug(f'{A ^ s % p:0x}'))
        expire[request.remote_addr] = datetime.now() + timedelta(hours=2)
        return make_response(jsonify({'B': f'0x0{g ^ s % p:0x}'}), 200)

#this api is to get the list of all posts. For the main page
@app.route('/posts', methods=['GET'])
def get_all_posts_api():
    if request.method == "GET":
        posts = []
        for post in post_table:
            posts.append(post)
        posts = sorted(posts, key=lambda x: x["timestamp"], reverse=True)
        return make_response(jsonify(posts), 200)

#this api is to get all the post made by the particular user. For the profile page
@app.route('/posts/user-posts/<user_id>', methods=['GET'])
def get_posts_by_user_api(user_id):
    if request.method == "GET":
        user_posts = []
        my_user = user_table.find_one(user_id=user_id)
        post_id_list = json.loads(my_user['post_ids'])
        for post_id in post_id_list:
            user_posts.append(post_table.find_one(post_id=post_id))
        user_posts = sorted(user_posts, key=lambda x: x["timestamp"], reverse=True)
        if user_posts:
            return make_response(jsonify(user_posts), 200)
        else:
            return make_response(jsonify({"message":"Could not get posts","result":"FAILED"}), 404)

#this is the encrypted, p4 version of creating a post
@app.route('/posts-new', methods=['POST'])
def create_posts_new():
    if request.method == "POST":
        reply = request.json
        encrypted_data = base64.b64decode(reply['encrypted_data'])
        iv = base64.b64decode(reply['iv'])
        content = decrypt_aes_new(encrypted_data, iv, keys[request.remote_addr])
        content = json.loads(content)
        user_id = content['user_id']
        post_table.insert(content)
        post_id = content['post_id']
        my_user = user_table.find_one(user_id=user_id)
        user_post_ids = json.loads(my_user['post_ids'])
        user_post_ids.append(post_id)
        my_user['post_ids'] = json.dumps(user_post_ids)
        user_table.update(my_user, ['user_id'])
        post = post_table.find_one(post_id=post_id)
        if post:
            return make_response(jsonify({"message":"Post created successfully","result":"SUCCESS"}), 201)
        else:
            return make_response(jsonify({"message":"Post could not be created","result":"FAILED"}), 404)

#this api is to create a post
@app.route('/posts', methods=['POST'])
def create_post_api():
    if request.method == "POST":
        content = request.json
        content['timestamp'] = time.time()
        content['comment_ids'] = json.dumps(content['comment_ids'])
        post_table.insert(content)
        post_id = content["post_id"]
        user_id = content["user_id"]

        #update the users table to add this post in its list
        my_user = user_table.find_one(user_id=user_id)
        user_post_ids = json.loads(my_user['post_ids'])
        user_post_ids.append(post_id)
        my_user['post_ids'] = json.dumps(user_post_ids)
        user_table.update(my_user, ['user_id'])

        post = post_table.find_one(post_id=post_id)
        if post:
            return make_response(jsonify({"message":"Post created successfully","result":"SUCCESS"}), 201)
        else:
            return make_response(jsonify({"message":"Post could not be created","result":"FAILED"}), 404)

#this api is to get a post by post id
@app.route('/posts/<post_id>', methods=['GET'])
def get_post_api(post_id):
    if request.method == "GET":
        post = post_table.find_one(post_id=post_id)
        if post:
            return make_response(jsonify(post), 200)
        else:
            return make_response(jsonify({"message":"Post not found","result":"FAILED"}), 404)

#this api is to edit a post
@app.route('/posts/<post_id>', methods=['PUT'])
def update_post_api(post_id):
    if request.method == "PUT":
        content = request.json
        post_table.update(content, ['post_id'])
        post = post_table.find_one(post_id=post_id)
        if post:
            return make_response(jsonify(post), 200)
        else:
            return make_response(jsonify({"message":"Post could not be edited","result":"FAILED"}), 404)

#this api is to delete a post. the post will get deleted from the user's post list as well.
@app.route('/posts/<post_id>', methods=['DELETE'])
def delete_post_api(post_id):
    if request.method == "DELETE":
        my_post = post_table.find_one(post_id=post_id)
        user_id = my_post['user_id']

        #deletes the post from the users list in the user database
        my_user = user_table.find_one(user_id=user_id)
        user_post_ids = json.loads(my_user['post_ids'])
        user_post_ids.remove(post_id)
        my_user['post_ids'] = json.dumps(user_post_ids)
        user_table.update(my_user, ['user_id'])
        if post_id in user_post_ids:
            return make_response(jsonify({"message":"Post not deleted from User","result":"FAILED"}), 404)

        post_table.delete(post_id=post_id)
        return make_response(jsonify({"message":"Post deleted successfully","result":"SUCCESS"}), 200)


if __name__ == '__main__':
    app.run(port=post_port)
