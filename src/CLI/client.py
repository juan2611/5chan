import requests
import json
from config import *
import time
import random
import uuid

# https://youtu.be/tb8gHvYlCFs?si=Brw-UOxaXDYiDy8d
# https://youtu.be/qriL9Qe8pJc?si=h5euaUR_BBSrYiMd

DEBUG = False

USERNAME = None
TOKEN = None
ACCESS = None


def clear_creds():
    global USERNAME, TOKEN, ACCESS  # Python piece of shit
    USERNAME = None
    TOKEN = None
    ACCESS = None


def register(username, first_name, last_name):
    TOKEN = uuid.uuid4()
    if DEBUG:
        print(TOKEN)

    # Create user (in authentication server)
    payload = {
        "user_id": str(TOKEN),
        "username": username,
    }
    r = requests.post('http://' + hostname + ':' +
                      str(login_port) + '/login', json=payload)
    if DEBUG:
        print('User Registration (in authentication server):', r.status_code)

    if r.ok == True:
        print('User ID: ' + payload["user_id"])
        print('Username: ' + payload["username"])
    else:
        print(r.json()["message"])
        clear_creds()
        return

    # Create user
    payload = {
        "user_id": str(TOKEN),
        "username": username,
        "post_ids": [],
        "comment_ids": [],
    }
    r = requests.post('http://' + hostname + ':' +
                      str(user_port) + '/users', json=payload)
    if DEBUG:
        print('User Registration:', r.status_code)

    reply = r.json()
    if r.ok == True:
        print(reply["message"])
    else:
        print(reply["result"], reply["message"])
    print()

    # Make user's life easier
    # login(username)


def login(username):
    payload = {
        "username": username
    }
    r = requests.post('http://' + hostname + ':' +
                      str(login_port) + '/auth', json=payload)
    if DEBUG:
        print('Authentication:', r.status_code)

    reply = r.json()
    if r.ok == True:
        print('Login successful!')
        print(reply['token'])
        global USERNAME, TOKEN, ACCESS
        USERNAME = username
        TOKEN = reply['token']['user_id']
        ACCESS = reply['token']['access']
        if DEBUG:
            print(USERNAME)
            print(TOKEN)
            print(ACCESS)
    else:
        print(reply['messsage'])
    print()


def logout():
    if TOKEN == None:
        print('You are not logged in yet!')
        return

    clear_creds()
    print('Logged out...')


def profile():
    if TOKEN == None:
        print('You are not logged in yet!')
        return

    # Get posts
    print('User', USERNAME)
    r = requests.get('http://' + hostname + ':' +
                     str(post_port) + '/posts/user-posts/' + str(TOKEN))
    if DEBUG:
        print('User posts status:', r.status_code)

    reply = r.json()
    if r.ok == True:
        print('List of posts & comments by user with ID:', TOKEN)
        for stuff in reply:
            postID = stuff['post_id']
            print('\t', postID)

            r = requests.get('http://' + hostname + ':' +
                             str(comment_port) + '/comments/post-comments/' + postID)
            reply = r.json()
            if r.ok == True:
                for things in reply:
                    print('\t\t', things['comment_id'])

    else:
        print(reply['result'], reply['message'])
    print()


def make_post(description):
    if TOKEN == None:
        print('You are not logged in yet!')
        return

    postID = uuid.uuid4()
    if DEBUG:
        print(postID)

    payload = {
        "post_id": str(postID),
        "user_id": str(TOKEN),
        "comment_ids": [],
    }
    r = requests.post('http://' + hostname + ':' +
                      str(post_port) + '/posts', json=payload)

    if r.ok == True:
        print('Posted!')
        print('Post ID:', postID)
    else:
        reply = r.json()
        print(reply['result'], reply['message'])
    print()


def update_post(postID):
    """
    Deprecated
    """
    if TOKEN == None:
        print('You are not logged in yet!')
        return

    new_postID = uuid.uuid4()
    if DEBUG:
        print(new_postID)

    payload = {
        "post_id": str(new_postID),
        "user_id": str(TOKEN),
    }
    r = requests.put('http://' + hostname + ':' +
                     str(post_port) + '/posts/' + postID, json=payload)

    if r.ok == True:
        print('Post updated!')
        print('New post ID:', new_postID)
    else:
        reply = r.json()
        print(reply['result'], reply['message'])
    print()


def delete_post(postID):
    """
    Deprecated
    """
    if TOKEN == None:
        print('You are not logged in yet!')
        return

    r = requests.delete('http://' + hostname + ':' +
                        str(post_port) + '/posts/' + postID)

    if r.ok == True:
        print('Post Deleted!')
    else:
        print(reply['result'], reply['message'])
    print()


def make_comment(postID):
    if TOKEN == None:
        print('You are not logged in yet!')
        return

    commentID = uuid.uuid4()
    if DEBUG:
        print(commentID)

    payload = {
        "comment_id": str(commentID),
        "post_id": postID,
        "user_id": str(TOKEN),
    }
    r = requests.post('http://' + hostname + ':' +
                      str(comment_port) + '/comments', json=payload)

    if r.ok == True:
        print('Commented!')
        print('Comment ID:', commentID)
    else:
        reply = r.json()
        print(reply['result'], reply['message'])
    print()


def update_comment(commentID):
    """
    Deprecated
    """
    if TOKEN == None:
        print('You are not logged in yet!')
        return

    new_commentID = uuid.uuid4()
    if DEBUG:
        print(new_commentID)

    payload = {
        "post_id": str(new_commentID),
    }
    r = requests.put('http://' + hostname + ':' +
                     str(comment_port) + '/comments/' + commentID, json=payload)

    if r.ok == True:
        print('Comment updated!')
        print('New comment ID:', new_commentID)
    else:
        reply = r.json()
        print(reply['result'], reply['message'])
    print()


def delete_comment(commentID):
    if TOKEN == None:
        print('You are not logged in yet!')
        return

    r = requests.delete('http://' + hostname + ':' +
                        str(comment_port) + '/comments/' + commentID)

    if r.ok == True:
        print('Comment Deleted!')
    else:
        print(reply['result']), reply['message']
    print()


# Test
# register("cliClient9", "Hello9", "World9")
login('cliClient9')
# make_post()
# make_comment('8683ad0e-a67b-4b64-aa85-238f2e934cc5')
# logout()
profile()
update_post('8683ad0e-a67b-4b64-aa85-238f2e934cc5')
# update_comment('917b971b-e9f1-4611-8290-15df9f9bde1f')
# delete_post('b0e08a31-5f54-437a-8b8b-79c0a31d21c7')
# delete_comment('917b971b-e9f1-4611-8290-15df9f9bde1f')
# profile()
