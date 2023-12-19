## INSTALLATIONS:

### Create a virtual venv:
python3 -m venv venv  
source env/bin/activate  
pip3 install flask  
pip3 install dataset  
pip3 install PyJWT  

<!-- <h2>User</h2>
	<b>Create: </b><br>
	<code>curl -X POST http://127.0.0.1:5002/users -d '{"user_id":"randval1","username":"temp23123","first_name":"Hello","last_name":"World", "post_ids": [], "comment_ids": []}' -H "Content-Type: application/json"</code><br>
	<b>Delete: </b><br>
	<code>curl http://127.0.0.1:5002/users/&lt;user_id&gt;</code><br>

	<h2>Post</h2>
	<b>Create: </b><br>
	<code>curl -X POST http://127.0.0.1:5001/posts -d '{"post_id":"id1","user_id":"randval1","description":"hello this is another trial for new post", "comment_ids": []}' -H "Content-Type: application/json"</code><br>
	<b>Get: </b><br>
	<code>curl http://127.0.0.1:5001/posts</code><br>
	<code>curl http://127.0.0.1:5001/posts/&lt;post_id&gt;</code><br>
	<code>curl http://127.0.0.1:5001/user-posts/&lt;user_id&gt;</code><br>
	<b>Delete: </b><br>
	<code>curl -X DELETE http://127.0.0.1:5001/posts/id1</code><br>

	<h2>Comment</h2>
	<b>Create: </b><br>
	<code>curl -X POST http://127.0.0.1:5003/comments -d '{"comment_id":"comm2","description":"Hi, this is my second comment on the post","post_id":"id1","user_id":"randval1"}' -H "Content-Type: application/json"</code><br>
	<b>Get: </b><br>
	<code>curl http://127.0.0.1:5003/comments/&lt;comment_id&gt;</code><br>
	<code>curl http://127.0.0.1:5003/comments/&lt;post_id&gt;</code><br>
	<code>curl http://127.0.0.1:5003/user-comments/&lt;user_id&gt;</code><br>
	<b>Delete: </b><br>
	<code>curl -X DELETE http://127.0.0.1:5003/comments/comm1</code><br>

	<h2>Login & Authorization</h2>
	<b>Login</b><br>
	<code>curl -X POST -H "Content-Type: application/json" -d '{"user_id":"randval1","password":"example_password"}' http://localhost:5000/login</code><br>
	<b>Authorization</b><br>
	<code>curl -X POST -H "Content-Type: application/json" -d '{"user_id":"randval1","password":"example_password"}' http://localhost:5000/auth</code><br> -->