from flask import Flask, make_response, jsonify, request
import dataset
import json
import sys
import time
from config import post_port
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)
post_db = dataset.connect('sqlite:///post.db')
user_resource_db = dataset.connect('sqlite:///user.db')

post_table = post_db['posts']
user_table = user_resource_db['users']

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
