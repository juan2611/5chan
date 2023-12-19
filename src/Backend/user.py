from flask import Flask, make_response, jsonify, request
import dataset
import json
import time
from config import user_port
from flask_cors import CORS
from util import *
import base64
from datetime import datetime, timedelta
import time
from Crypto.Random.random import getrandbits
from datetime import datetime, timedelta
from Crypto.Hash import SHA256

from Crypto import Random
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

app = Flask(__name__)
CORS(app, supports_credentials=True)
db = dataset.connect('sqlite:///user.db')
key_file = "resource_key.pub"
resource_priv_key = "keys/resource_priv.pem"
resource_pub_key = "keys/resource_pub.pem"
key = ""
iv = ""
auth_timeout = 3600
user_id = ""

user_table = db['users']

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

@app.route('/authenticate-token', methods=['POST'])
def authenticate_token():
    global user_id
    if request.method == "POST":
        if valid_key(keys[request.remote_addr]):
            reply = request.json
            encrypted_token = base64.b64encode(reply['encrypted_token'])
            iv = base64.b64decode(reply['iv'])
            token = decrypt_aes_new(encrypted_token, iv, keys[request.remote_addr])
            split_token = token.split('|')
            user_id = split_token[0]
            user = user_table.find_one(user_id=user_id)
            if not check_token(token):
                return make_response(jsonify({"message": "Unauthorized Token", "result": "FAILED"}), 401)
            else:
                user['timestamp'] = time.time()
                user_table.update(user, ['user_id'])
                return make_response(jsonify({"message": "Valid token", "RESULT": "SUCCESS"}), 200)

@app.route('/resource-key-exchange', methods=['POST'])
def exchange_resource_key():
    if request.method == "POST":
        if valid_key(keys[request.remote_addr]):
            reply = request.json
            encrypted_key = reply['encrypted_key']
            shared_key = decrypt_rsa(encrypted_key, resource_priv_key)
            update_key(shared_key, f"keys/{user_id}_{key_file}")
            return make_response(jsonify({"message": "Key exchange done"}), 200)

@app.route('/users', methods=['POST'])
def create_user_api():
    global user_id
    if request.method == "POST":
        if valid_key(keys[request.remote_addr]):
            reply = request.json
            encrypted_data = base64.b64decode(reply['encrypted_data'])
            iv = base64.b64decode(reply['iv'])
            content = decrypt_aes_new(encrypted_data, iv, keys[request.remote_addr])
            content = json.loads(content)
            print(content)
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


@app.route('/publickey', methods=['GET'])
def get_rs_pk():
    if request.method == 'GET':
        return make_response(jsonify({"message": publickey.decode('ascii')}), 200)


if __name__ == '__main__':
    # T3.1: generating 4096-bit RSA public key
    global publickey, hashed_publickey
    with open(resource_pub_key, 'rb') as f:
            key = RSA.import_key(f.read())
    publickey = key.publickey().export_key()
    print(publickey.decode('ascii'), '\n')
    # hash
    sha256_hash = SHA256.new()

    # Update the hash object with the public key bytes
    sha256_hash.update(publickey)

    # Get the hexadecimal digest of the hash
    hashed_publickey = sha256_hash.hexdigest()
    print(hashed_publickey)

    app.run(port=user_port)
