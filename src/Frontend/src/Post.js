import { useEffect, useState } from "react";
import * as mui from '@mui/material';
import default_pfp from "./default-pfp.jpeg";
import logo from "./logo.png";
import "./Dashboard.css";
import { Navigate, useParams, useNavigate } from "react-router-dom"
import config from "./config.json"
import { diffieHellman } from './Login';
import { useCookies } from "react-cookie";

function Post() {
  const postId = useParams();
  const [postData, setPostData] = useState("");
  const [commentData, setCommentData] = useState("");
  const [commentGet, setCommentGet] = useState("");
  const [user, setUser] = useState("")
  const [login, setLogin] = useState(true)
  const [edit, setEdit] = useState(false)
  const [postDeleted, setPostDeleted] = useState(false)
  const [newPost, setNewPost] = useState("")
  const [visiting, setVisiting] = useState("")
  const [media, setMedia] = useState("")
  const [cookies, setCookie] = useCookies(["user_session","post_session", "comment_session", "media_session", "token"])
  const navigate = useNavigate()

  const user_g = 5n
  //4096 bit prime generated by 2ton.com.au/safeprimes/
  const user_p = 577891979226697945570213780521809426563365791435615832711012378975984090706711917615938495479321251358605416479067241081499497036839950356312625597915929364713575346541675959839159009416370898443127459344409878709845697518679122868962118907715571007000916180621970149148136229013170679223203460365617450421691941273835363116508991034178359390084708401581953959008754168771552735521904480713439940947226031866986121762340975621049253684451435399030266860183064954357336799400350480461284469165141631413805707145204708837559352239067360772939965058210616259303108609951008480806667347855751672593239289058012594718617219786601449982343198203231748683266822819073665711182271257734849627858310345536879821077935399795186538030449767160405711762844960031523239541898481869878913445358646928023166940768223088754414136964463018749469689652124543359528248272704783756259254408405133060554006685687358333240561439885337656631093448524482764852413691768290115225854434316473796757712296260976691154626491990747850785649812567977965618087169928752768736500994467612790526523884398574478437931941918120157206366766875928558302834507669957053069399504813957691091119203137043900000222354063927513406469713721166441337402223171582540462531999967n;
  const post_g = 5n
  //4096 bit prime generated by 2ton.com.au/safeprimes/
  const post_p = 577891979226697945570213780521809426563365791435615832711012378975984090706711917615938495479321251358605416479067241081499497036839950356312625597915929364713575346541675959839159009416370898443127459344409878709845697518679122868962118907715571007000916180621970149148136229013170679223203460365617450421691941273835363116508991034178359390084708401581953959008754168771552735521904480713439940947226031866986121762340975621049253684451435399030266860183064954357336799400350480461284469165141631413805707145204708837559352239067360772939965058210616259303108609951008480806667347855751672593239289058012594718617219786601449982343198203231748683266822819073665711182271257734849627858310345536879821077935399795186538030449767160405711762844960031523239541898481869878913445358646928023166940768223088754414136964463018749469689652124543359528248272704783756259254408405133060554006685687358333240561439885337656631093448524482764852413691768290115225854434316473796757712296260976691154626491990747850785649812567977965618087169928752768736500994467612790526523884398574478437931941918120157206366766875928558302834507669957053069399504813957691091119203137043900000222354063927513406469713721166441337402223171582540462531999967n;
  const com_g = 5n
  //4096 bit prime generated by 2ton.com.au/safeprimes/
  const com_p = 577891979226697945570213780521809426563365791435615832711012378975984090706711917615938495479321251358605416479067241081499497036839950356312625597915929364713575346541675959839159009416370898443127459344409878709845697518679122868962118907715571007000916180621970149148136229013170679223203460365617450421691941273835363116508991034178359390084708401581953959008754168771552735521904480713439940947226031866986121762340975621049253684451435399030266860183064954357336799400350480461284469165141631413805707145204708837559352239067360772939965058210616259303108609951008480806667347855751672593239289058012594718617219786601449982343198203231748683266822819073665711182271257734849627858310345536879821077935399795186538030449767160405711762844960031523239541898481869878913445358646928023166940768223088754414136964463018749469689652124543359528248272704783756259254408405133060554006685687358333240561439885337656631093448524482764852413691768290115225854434316473796757712296260976691154626491990747850785649812567977965618087169928752768736500994467612790526523884398574478437931941918120157206366766875928558302834507669957053069399504813957691091119203137043900000222354063927513406469713721166441337402223171582540462531999967n;
  const med_g = 5n
  //4096 bit prime generated by 2ton.com.au/safeprimes/
  const med_p = 577891979226697945570213780521809426563365791435615832711012378975984090706711917615938495479321251358605416479067241081499497036839950356312625597915929364713575346541675959839159009416370898443127459344409878709845697518679122868962118907715571007000916180621970149148136229013170679223203460365617450421691941273835363116508991034178359390084708401581953959008754168771552735521904480713439940947226031866986121762340975621049253684451435399030266860183064954357336799400350480461284469165141631413805707145204708837559352239067360772939965058210616259303108609951008480806667347855751672593239289058012594718617219786601449982343198203231748683266822819073665711182271257734849627858310345536879821077935399795186538030449767160405711762844960031523239541898481869878913445358646928023166940768223088754414136964463018749469689652124543359528248272704783756259254408405133060554006685687358333240561439885337656631093448524482764852413691768290115225854434316473796757712296260976691154626491990747850785649812567977965618087169928752768736500994467612790526523884398574478437931941918120157206366766875928558302834507669957053069399504813957691091119203137043900000222354063927513406469713721166441337402223171582540462531999967n;

  function generate_guid() {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
      function (c) {
        var rnd = Math.random() * 16;
        rnd = (dt + rnd) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? rnd : (rnd & 0x3 | 0x8)).toString(16);
      });
  }

  useEffect(() => {
      let key = cookies.post_session
      if (key===undefined) {
        key = diffieHellman(`${config.post_host}/key-exchange`, post_g, post_p)
        setCookie("post_session", key, { maxAge:720, path:"/" })
      }
      key = cookies.user_session
      if (key===undefined) {
        key = diffieHellman(`${config.user_host}/key-exchange`, user_g, user_p)
        setCookie("user_session", key, { maxAge:720, path:"/" })
      }
      key = cookies.comment_session
      if (key===undefined) {
        key = diffieHellman(`${config.comment_host}/key-exchange`, com_g, com_p)
        setCookie("comment_session", key, { maxAge:720, path:"/" })
      }
      key = cookies.media_session
      if (key===undefined) {
        key = diffieHellman(`${config.media_host}/key-exchange`, med_g, med_p)
        setCookie("media_session", key, { maxAge:720, path:"/" })
      }
    (async () => {
      try {
        fetch(`${config.post_host}/posts/` + postId.id, {
          method: 'GET',
        }).then(res => res.json()).then(data => {
          setPostData(data);
          fetch(`${config.user_host}/users/` + data.user_id, {
            method: 'GET',
          }).then(res => res.json()).then(data => { setUser(data.username) })
        })
      } catch (e) {
        alert(e);
      }
      try {
        fetch(`${config.comment_host}/comments/post-comments/` + postId.id, {
          method: 'GET',
        }).then(res => res.json()).then(data => { setCommentGet(data) })
      } catch (e) {
        alert(e);
      }
      try {
        fetch(`${config.user_host}/users/` + user_ID, {
          method: 'GET',
        }).then(res => res.json()).then(data => { setVisiting(data) })
      } catch (e) {
        alert(e);
      }
      try {
        fetch(`${config.media_host}/media/get_photo_by_post`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "post_id": postData.post_id
          }),
        }).then(res => res.json()).then(data => { setMedia(data.url) })
      } catch (e) {
        alert(e);
      }
    })();
  }, [])

  let canComment;
  let canView;
  let canPost;
  const token = document.cookie;
  let user_ID = token.split("/")[0].replace("token=", "");
  token.includes("comment") ? canComment = true : canComment = false
  token.includes("read") ? canView = true : canView = false
  token.includes("post") ? canPost = true : canPost = false

  const postComment = () => {
    (async () => {
      try {
        await fetch(`${config.comment_host}/comments`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "post_id": postData.post_id,
            "user_id": user_ID,
            "comment_id": generate_guid(),
            "description": commentData
          }),
        });
        navigate(0);
      } catch (e) {
        alert(e);
      }
    })();
  }

  const deletePost = () => {
    try {
      fetch(`${config.post_host}/posts/` + postData.post_id, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "post_id": postData.post_id,
        }),
      })
    }
    catch (e) {
      alert(e);
    }
    setPostDeleted(true)
  }

  const editAccessCheck = () => {
    if (user_ID == postData.user_id && canPost) {
      return (
        <div>
          <mui.Button variant='contained'
            style={{
              color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)',
              position: 'absolute', top: "-1.5%", left: "15%"
            }} onClick={() => { setEdit(true) }}>Edit</mui.Button>
          <mui.Button variant='contained'
            style={{
              color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)',
              position: 'absolute', top: "-1.5%", left: "25%"
            }} onClick={() => { deletePost() }}>Delete</mui.Button>
          <img src={media} style={{ width: 100, height: 70, position: "absolute", top: "-4%", left: "50%" }} />
        </div>);
    }
    else if (visiting.user_group == "mod" || visiting.user_group == "admin") {
      return (
        <mui.Button variant='contained'
          style={{
            color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)',
            position: 'absolute', top: "-1.5%", left: "25%"
          }} onClick={() => { deletePost() }}>Delete</mui.Button>)
    }
  }

  const commentAdd = () => {
    if (canComment) {
      return (<div><mui.TextField
        label="New comment"
        multiline
        id="post"
        defaultValue="Write a comment!"
        variant="filled"
        size="small"
        style={{ maxWidth: '100%', maxHeight: '70%', minWidth: '100%', minHeight: '70%' }}
        onChange={(commentData) => setCommentData(commentData.target.value)}>
      </mui.TextField>

        <div className="SubmitPost">
          <mui.Button variant="contained" onClick={() => { postComment() }}
            style={{
              maxWidth: '200px', maxHeight: '30px', minWidth: '200px', minHeight: '30px',
              background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)'
            }}>
            Post
          </mui.Button>
        </div></div>)
    }
    else {
      return "Sorry, you're not allowed to comment!"
    }
  }

  const updatePost = () => {
    try {
      fetch(`${config.post_host}/posts/` + postData.post_id, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "post_id": postData.post_id,
          "user_id": user_ID,
          "description": newPost,
          "comment_ids": postData.comment_ids
        }),
      })
      navigate(0)
    }
    catch (e) {
      alert(e);
    }
  }

  const deleteComment = (commentId) => {
    try {
      fetch(`${config.comment_host}/comments/` + commentId, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "comment_id": commentId,
        }),
      })
    }
    catch (e) {
      alert(e);
    }
    navigate(0)
  }

  const deleteOption = (commentUser, commentId) => {
    if (visiting.user_group == "mod" || visiting.user_group == "admin" || (user_ID == commentUser && canComment)) {
      return (<mui.Button
        onClick={() => { deleteComment(commentId) }}
        sx={{
          color: '#ffffff',
          background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)',
          width: '11.5%',
          height: '6.5%',
          bgcolor: '#dddddd',
          border: 1,
          borderRadius: 0,
          borderColor: '#000000',
          position: 'absolute',
          overflow: 'auto',
          left: "88.5%"
        }}>
        delete
      </mui.Button>)
    }
    return (null)
  }

  const loadComments = () => {
    let returnComments = []
    if (commentGet.length == 0) {
      return <a href="https://www.youtube.com/watch?v=9yV3R0fj988">
        No comments to see yet! Be the first one, or visit this cool video to kill some time until someone comments :)</a>
    }
    for (let i = 0; i < commentGet.length; i++) {
      returnComments.push(
        <div key={commentGet[i].comment_id}>
          <mui.Button
            id={commentGet[i].comment_id}
            href={"../user/" + commentGet[i].user_id}
            sx={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              overflowY: "scroll",
              width: '100%',
              height: '6.5%',
              bgcolor: '#dddddd',
              color: '#000000',
              border: 1,
              borderRadius: 0,
              position: 'absolute',
              overflow: 'auto',
              left: "0%"
            }}>{commentGet[i].description}</mui.Button>

          {deleteOption(commentGet.user_id, commentGet[i].comment_id)}
          <br></br><br></br></div>)
    }
    return returnComments;
  }

  const logout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setLogin(false)
  }

  if (postDeleted) {
    return <Navigate replace to="/dashboard" />
  }
  else if (login && edit) {
    return (
      <div className="App">
        <a href="../dashboard">
          <input type="image" className="logo" src={logo} height={75} width={75} />
        </a>

        <mui.Button variant='contained'
          style={{
            color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)',
            position: 'absolute', top: 20, left: 1260
          }} onClick={() => { logout() }}>Sign out</mui.Button>
        <a href="../profile">
          <input type="image" className="default-pfp" src={default_pfp} height={75} width={75} />
        </a>
        <mui.Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: '#dddddd',
            position: 'absolute',
            top: 75
          }}>
          <mui.Box
            sx={{
              width: '60%',
              height: '80%',
              bgcolor: '#dddddd',
              borderColor: '#ffffff',
              border: 2
            }}>
            <a href={"../user/" + postData.user_id}>
              <input type="image" style={{ position: "absolute", left: "0%" }} src={default_pfp} height={75} width={75} />
            </a>
            <mui.Box
              textAlign="left"
              sx={{
                width: '80%',
                height: '80%',
                bgcolor: '#dddddd',
                position: "absolute",
                top: "4%",
                left: "7%"
              }}>
              {"Posted by: " + user}
              <mui.Button variant='contained'
                style={{
                  color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)',
                  position: 'absolute', top: "-1.5%", left: "15%"
                }} onClick={() => { updatePost() }}>Save changes</mui.Button>
              <mui.Button variant='contained'
                style={{
                  color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)',
                  position: 'absolute', top: "-1.5%", left: "30%"
                }} onClick={() => { setEdit(false) }}>Cancel changes</mui.Button>
              <img src={media} style={{ width: 100, height: 70, position: "absolute", top: "-4%", left: "50%" }} />
            </mui.Box>
            <textarea
              defaultValue={postData.description}
              onChange={(newPost) => setNewPost(newPost.target.value)}
              style={{
                resize: "none", height: "70%", width: "59.6%", position: "absolute", top: "9.5%", left: "0.1%",
                border: "1px solid black"
              }}></textarea>
          </mui.Box>
          <mui.Box
            sx={{
              width: '40%',
              height: '80%',
              bgcolor: '#dddddd',
              borderColor: '#ffffff',
              border: 2,
              position: 'absolute',
              top: '0%',
              left: '60%'
            }}>
            Comments Section
            <mui.Box
              sx={{
                width: '100%',
                height: '94%',
                bgcolor: '#dddddd',
                borderColor: '#ffffff',
                borderTop: 2,
                position: 'absolute',
                top: '5%'
              }}>
              {canView ? loadComments() : "Sorry, you're not allowed to see this!"}
            </mui.Box>
          </mui.Box>
          <mui.Box
            sx={{
              width: '100%',
              height: '20%',
              bgcolor: '#dddddd',
              borderColor: '#ffffff',
              borderTop: 2,
              position: 'absolute',
              top: '80%'
            }}>
            {commentAdd()}
          </mui.Box>
        </mui.Box>
      </div>
    );
  }
  else if (login) {
    return (
      <div className="App">
        <a href="../dashboard">
          <input type="image" className="logo" src={logo} height={75} width={75} />
        </a>

        <mui.Button variant='contained'
          style={{
            color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)',
            position: 'absolute', top: 20, left: 1260
          }} onClick={() => { logout() }}>Sign out</mui.Button>
        <a href="../profile">
          <input type="image" className="default-pfp" src={default_pfp} height={75} width={75} />
        </a>
        <mui.Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: '#dddddd',
            position: 'absolute',
            top: 75
          }}>
          <mui.Box
            sx={{
              width: '60%',
              height: '80%',
              bgcolor: '#dddddd',
              borderColor: '#ffffff',
              border: 2
            }}>
            <a href={"../user/" + postData.user_id}>
              <input type="image" style={{ position: "absolute", left: "0%" }} src={default_pfp} height={75} width={75} />
            </a>
            <mui.Box
              textAlign="left"
              sx={{
                width: '80%',
                height: '80%',
                bgcolor: '#dddddd',
                position: "absolute",
                top: "4%",
                left: "7%"
              }}>
              {"Posted by: " + user}
              {editAccessCheck()}
            </mui.Box>
            <textarea
              defaultValue={canView ? postData.description : "Sorry, you're not allowed to see this!"}
              readOnly style={{
                resize: "none", height: "70%", width: "59.6%", position: "absolute", top: "9.5%", left: "0.1%",
                border: "1px solid black"
              }}></textarea>
          </mui.Box>
          <mui.Box
            sx={{
              width: '40%',
              height: '80%',
              bgcolor: '#dddddd',
              borderColor: '#ffffff',
              border: 2,
              position: 'absolute',
              top: '0%',
              left: '60%'
            }}>
            Comments Section
            <mui.Box
              sx={{
                width: '100%',
                height: '94%',
                bgcolor: '#dddddd',
                borderColor: '#ffffff',
                borderTop: 2,
                position: 'absolute',
                top: '5%'
              }}>
              {canView ? loadComments() : "Sorry, you're not allowed to see this!"}
            </mui.Box>
          </mui.Box>
          <mui.Box
            sx={{
              width: '100%',
              height: '20%',
              bgcolor: '#dddddd',
              borderColor: '#ffffff',
              borderTop: 2,
              position: 'absolute',
              top: '80%'
            }}>
            {commentAdd()}
            {console.log(media)}
          </mui.Box>
        </mui.Box>
      </div>
    );
  }
  else {
    navigate(0)
    return <Navigate replace to="/login" />
  }
}

export default Post;
