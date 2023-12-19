from flask import Flask, make_response, jsonify, request
import dataset
import json
import sys
import time
from config import comment_port
from flask_cors import CORS
from Crypto.Random.random import getrandbits
from datetime import datetime, timedelta
from Crypto.Hash import SHA256

app = Flask(__name__)
CORS(app, supports_credentials=True)
post_db = dataset.connect('sqlite:///post.db')
user_resource_db = dataset.connect('sqlite:///user.db')
comment_db = dataset.connect('sqlite:///comment.db')

post_table = post_db['posts']
user_table = user_resource_db['users']
comment_table = comment_db['comments']

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
        expire[request.remote_addr] = datetime.now() + timedelta(hours=2)
        return make_response(jsonify({'B': f'0x0{g ^ s % p:0x}'}), 200)

#this api creates a comment and adds it to the list of corresponding user and posts comment list
@app.route('/comments', methods=['POST'])
def create_comment_api():
    if request.method == "POST":
        content = request.json
        content['timestamp'] = time.time()
        comment_id = content["comment_id"]
        comment_table.insert(content)
        print("COMMENT: ", comment_id)

        post_id = content["post_id"]
        my_post = post_table.find_one(post_id=post_id)
        comment_list = json.loads(my_post['comment_ids'])
        comment_list.append(comment_id)
        my_post['comment_ids'] = json.dumps(comment_list)
        post_table.update(my_post, ['post_id'])

        user_id = content['user_id']
        my_user = user_table.find_one(user_id=user_id)
        comment_list_user = json.loads(my_user['comment_ids'])
        comment_list_user.append(comment_id)
        my_user['comment_ids'] = json.dumps(comment_list_user)
        user_table.update(my_user, ['user_id'])

        comment = comment_table.find_one(comment_id=comment_id)

        if comment:
            return make_response(jsonify({"message":"Comment created successfully","result":"SUCCESS"}), 201)
        else:
            return make_response(jsonify({"message":"Could not create comment","result":"FAILED"}), 404)

#this api gets the list of comments for a particular post. use it to display the comments for every post
@app.route('/comments/post-comments/<post_id>', methods=['GET'])
def get_post_comments_api(post_id):
    if request.method == "GET":
        post_comments = []
        my_post = post_table.find_one(post_id=post_id)
        comment_ids = json.loads(my_post['comment_ids'])
        for comment_id in comment_ids:
            post_comments.append(comment_table.find_one(comment_id=comment_id))
        post_comments = sorted(post_comments, key=lambda x: x["timestamp"], reverse=True)
        if post_comments:
            return make_response(jsonify(post_comments), 200)
        else:
            return make_response(jsonify(post_comments), 404)

#this api gets the comment by comment id
@app.route('/comments/<comment_id>', methods=['GET'])
def get_comment_api(comment_id):
    if request.method == "GET":
        comment = comment_table.find_one(comment_id=comment_id)
        if comment:
            return make_response(jsonify(comment), 200)
        else:
            return make_response(jsonify({"message":"Could not get comment","result":"FAILED"}), 404)

#this api gets the list of comments made by a particular user. use it to display the users comments in the profile page
@app.route('/comments/user-comments/<user_id>', methods=['GET'])
def get_user_comments_api(user_id):
    if request.method == "GET":
        user_comments = []
        my_user = user_table.find_one(user_id=user_id)
        comment_ids = json.loads(my_user['comment_ids'])
        for comment_id in comment_ids:
            user_comments.append(comment_table.find_one(comment_id=comment_id))
        user_comments = sorted(user_comments, key=lambda x: x["timestamp"], reverse=True)
        if user_comments:
            return make_response(jsonify(user_comments), 200)
        else:
            return make_response(jsonify({"message":"Could not get the user's comments","result":"FAILED"}), 404)

#this api is to edit a comment.
@app.route('/comments/<comment_id>', methods=['PUT'])
def update_comment_api(comment_id):
    if request.method == "PUT":
        content = request.json
        comment_table.update(content, ['comment_id'])
        comment = comment_table.find_one(comment_id=comment_id)
        if comment:
            return make_response(jsonify(comment), 200)
        else:
            return make_response(jsonify({"message":"Could not edit the user's comments","result":"FAILED"}), 404)

#this api is to delete the comment. It will also get deleted from both the user's and post's list of comments
@app.route('/comments/<comment_id>', methods=['DELETE'])
def delete_comment_api(comment_id):
    if request.method == "DELETE":
        comment = comment_table.find_one(comment_id=comment_id)
        user_id = comment['user_id']
        post_id = comment['post_id']

        my_user = user_table.find_one(user_id=user_id)
        user_comment_ids = json.loads(my_user['comment_ids'])
        user_comment_ids.remove(comment_id)
        my_user['comment_ids'] = json.dumps(user_comment_ids)
        user_table.update(my_user, ['user_id'])

        my_post = post_table.find_one(post_id=post_id)
        post_comment_ids = json.loads(my_post['comment_ids'])
        post_comment_ids.remove(comment_id)
        my_post['comment_ids'] = json.dumps(post_comment_ids)
        post_table.update(my_post, ['post_id'])

        comment_table.delete(comment_id=comment_id)

        check_comment = comment_table.find_one(comment_id=comment_id)
        if check_comment:
            return make_response(jsonify({"message":"Comment deletion failed","result":"FAILED"}), 404)
        return make_response(jsonify({"message":"Comment deleted successfully!","result":"SUCCESS"}), 200)

if __name__ == '__main__':
    app.run(port=comment_port)
