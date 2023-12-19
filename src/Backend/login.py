from flask import Flask, make_response, jsonify, request
import dataset
import random
# import jwt
import json
from config import login_port
from flask_cors import CORS
from Crypto.Cipher import AES
# from Crypto.Random import get_random_bytes
from Crypto.Random.random import getrandbits
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Util.Padding import pad, unpad

import codecs
import base64
from datetime import datetime, timedelta
import time
from util import *

def load_private_key(filename):
    with open(filename, 'r') as key_file:
        private_key = RSA.import_key(key_file.read())
    return private_key

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

server_priv_key = load_private_key("./keys/private_key.pem")

# key_file = "shared_key.pub"
# with open(key_file, 'r') as file:
#     key = file.read()
 

app = Flask(__name__)
CORS(app, supports_credentials=True)
#db_users = dataset.connect('sqlite:///user.db')
db_users_auth = dataset.connect('sqlite:///users_auth.db')
db_post_keys = dataset.connect('sqlite:///post_keys.db')

#users_table = db_users['users']
users_auth_table = db_users_auth['UsersAuth']
post_keys_table = db_post_keys['posts']

def hash_string_sha256_one(input_string):
    sha256_hash = SHA256.new()
    sha256_hash.update(input_string.encode('utf-8'))
    hashed_string = sha256_hash.hexdigest()
    return hashed_string

def hash_string_sha256(input_string):
    # Create a new hash object
    hasher = SHA256.new()
    # Update the hash object with the input string
    hasher.update(input_string.encode('utf-8'))
    return hasher

def hash_string_sha256_new(input_string):
    return SHA256.new(input_string.encode()).digest()

# readable format
def hash_string_sha256_debug(input_string):
    return SHA256.new(input_string.encode()).hexdigest()

def encrypt_aes(text, iv, key):
    message = bytes(text, 'utf-8')
    cipher = AES.new(key, AES.MODE_CBC)
    message = message + b"\0" * (16 - len(message) % 16)
    cipher_text = cipher.encrypt(message)
    return cipher_text

def encrypt_aes_new(data, iv, key):
    # Ensure the secret key is the correct length (32 bytes for AES-256)
    # and the data is padded according to AES block size (16 bytes)
    data = bytes(data, 'utf-8')
    cipher = AES.new(key, AES.MODE_CBC, iv)
    padded_data = pad(data, AES.block_size)
    encrypted = cipher.encrypt(padded_data)
    return encrypted

# def unpad(s):
#     """Remove PKCS#7 padding"""
#     print(s[-1])
#     return s[:-(s[-1]+3)]
def login_unpad(s):
    """Remove PKCS#7 padding"""
    print(s[-1])
    return s[16:-(s[-1])]

def decrypt_aes(encrypted_data, iv, key):
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted = cipher.decrypt(encrypted_data)
    print(decrypted)
    # Strip padding if necessary
    unpadded = unpad(decrypted, 16)
    print(unpadded)
    return unpadded

#For Front-end
@app.route('/login', methods=['GET'])
def authGet():
    if request.method == "GET":
        users = []
        for user in users_auth_table:
            users.append(user)
        return make_response(jsonify(users), 200)

@app.route('/key-exchange', methods=['POST'])
def diffie_hellman():
    global keys
    if request.method == "POST":
        obj = request.json
        A = int('0x0' + obj['A'], 16)
        s = getrandbits(512)
        keys[request.remote_addr] =  hash_string_sha256_new(f'{A ^ s % p:0x}')
        print(hash_string_sha256_debug(f'{A ^ s % p:0x}'))
        expire[request.remote_addr] = datetime.now() + timedelta(hours=2)
        return make_response(jsonify({'B': f'0x0{g ^ s % p:0x}'}), 200)

@app.route('/post', methods=['POST'])
def create_post():
    global username
    if request.method == "POST":
        if valid_key(request.remote_addr):
            reply = request.json
            encrypted_data = base64.b64decode(reply['encrypted_data'])
            print(encrypted_data)
            iv = base64.b64decode(reply['iv'])
            # with open("keys/"+username+"_"+key_file, 'r') as file:
            #     key = file.read()
            # key = bytes.fromhex(key)
            content = decrypt_aes(encrypted_data, iv, keys[request.remote_addr])
            content = json.loads(content)
            print(content)
            post_keys_table.insert(content)
            make_response(jsonify({"message": "Post key has been stored successfully", "status": "SUCCESS"}), 202)
        return make_response(jsonify({"message": "You don't have permissions to access this post", "status": "FAILED"}), 401)

#api for getting a post key
@app.route('/post-key/<post_id>', methods=['GET'])
def get_post_key(post_id):
    global username
    if request.method == "GET":
        if valid_key(request.remote_addr):
            post = post_keys_table.find_one(post_id=post_id)
            user = users_auth_table.find_one(username=username)
            if not post:
                return make_response(jsonify({"message": "post not found"}), 404)
            users_list = post['user_list'].split(',')
            user_id = user['user_id']
            if user_id in users_list:
                # with open("keys/"+username+"_"+key_file, 'r') as file:
                #     key = file.read()
                # key = bytes.fromhex(key)
                key_iv_pair = json.loads(jsonify({"key":post['key'],"iv":post['iv']}))
                encrypted_data = encrypt_aes_new(key_iv_pair, iv, keys[request.remote_addr])
                encrypted_data = base64.b64encode(encrypted_data).decode('utf-8')
                iv = base64.b64encode(iv).decode('utf-8')
                return make_response(jsonify({"encrypted_data": encrypted_data, "iv": iv}), 200)
        return make_response(jsonify({"message": "You don't have permissions to access this post", "status": "FAILED"}), 401)

#api to change user's list
@app.route('/post/<post_id>', methods=['POST'])
def update_user_list(post_id):
    global username
    if request.method == "POST":
        if valid_key(request.remote_addr):
            reply = request.json
            encrypted_data = base64.b64decode(reply['encrypted_data'])
            print(encrypted_data)
            iv = base64.b64decode(reply['iv'])
            # with open("keys/"+username+"_"+key_file, 'r') as file:
            #     key = file.read()
            # key = bytes.fromhex(key)
            content = decrypt_aes(encrypted_data, iv, keys[request.remote_addr])
            content = json.loads(content)
            print(content)
            post_keys_table.update(content, ['post_id'])
            return make_response(jsonify({"message": "Post details updated successfully", "status": "SUCCESS"}), 202)
        return make_response(jsonify({"message": "You don't have permissions to access this post", "status": "FAILED"}), 401)

@app.route('/login', methods=['POST'])
def auth():
    global username
    if request.method == "POST":
        if valid_key(request.remote_addr):
            username="abc"
            reply = request.json
            encrypted_data = base64.b64decode(reply['encrypted_data'])
            print(encrypted_data)
            iv = base64.b64decode(reply['iv'])
            print(iv)
            # key = hash_string_sha256_new("secretKey")
            # with open("keys/"+username+"_"+key_file, 'r') as file:
            #     key = file.read()
            # key = bytes.fromhex(key)
            # print(key)
            content = decrypt_aes(encrypted_data, iv, keys[request.remote_addr])
            print(content)
            content = json.loads(content)
            print(content)
            user_id = content['user_id']
            username = content['username']
            password = content['password']
            user = users_auth_table.find_one(username=username)

            if not user:
                # Create a new user in the users_auth database with the password
                user_auth = {
                    'user_id': user_id,
                    'username': username,
                    'post_access': True,
                    'comment_access': True,
                    'read_access': True,
                    'media_access': True,
                    'password': password
                }
                users_auth_table.insert(user_auth)

                return make_response(jsonify({'message': 'User added to users_auth'}), 200)
            else:
                return make_response(jsonify({'message': 'User already exists'}), 404)
        return make_response(jsonify({"message": "You don't have permissions to access this post", "status": "FAILED"}), 401)

@app.route('/auth', methods=['POST'])
def login():
    if request.method == "POST":
        if valid_key(request.remote_addr):
            reply = request.json
            encrypted_data = base64.b64decode(reply['encrypted_data'])
            iv = base64.b64decode(reply['iv'])
            # key = hash_string_sha256_new("secretKey")
            content = decrypt_aes(encrypted_data, iv, keys[request.remote_addr])
            print(content)
            content = json.loads(content)
            username = content['username']
            password = content['password']
            timestamp = content['time']
            #user_access = users_table.find_one(user_id=user_id)
            user = users_auth_table.find_one(username=username)
                                             #, password=password)
            if user:
                if datetime.fromtimestamp(timestamp) + timedelta(seconds=auth_timeout) < datetime.now():
                    return make_response(jsonify({'message': 'Authentication session time expired'}), 401)
                if user['password'] != password:
                    return make_response(jsonify({'message': 'Invalid password'}), 401)
                payload = {'user_id': user['user_id'], 'access':[]}
                if user['post_access']:
                    payload['access'].append('post')    
                if user['comment_access']:
                    payload['access'].append('comment')
                if user['read_access']:
                    payload['access'].append('read')
                if user['media_access']:
                    payload['access'].append('media')
                token_string = f"{user['user_id']}|{user['post_access']}|{user['comment_access']}|{user['read_access']}|{user['media_access']}|{time.time()}"
                print("Token sting : ", token_string)
                signature = pkcs1_15.new(server_priv_key).sign(SHA256.new(token_string.encode()))
                signature_string = base64.b64encode(signature).decode('utf-8')
                token = token_string + "|" + signature_string
                print("token : ", token)
                encrypted_token = encrypt_aes_new(token, iv, keys[request.remote_addr])
                encrypted_token = base64.b64encode(encrypted_token).decode('utf-8')
                iv = base64.b64encode(iv).decode('utf-8')
                # token = jwt.encode(payload, 'secret_key', algorithm='HS256')
                # decode = jwt.decode(token, "secret_key", algorithms=["HS256"])
                # print(decode)
                print("Encrypted token : ", encrypted_token)
                print("IV : ", iv)
                return make_response(jsonify({'token': encrypted_token, 'iv': iv}), 200)
            else:
                return make_response(jsonify({'message': 'Invalid credentials'}), 401)
        return make_response(jsonify({'message': 'Invalid credentials'}), 401)

if __name__ == '__main__':
    app.run(port=login_port)
