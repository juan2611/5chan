import * as mui from '@mui/material';
import './User_profile.css';
import default_pfp from "./default-pfp.jpeg";
import logo from "./logo.png";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom"
import config from "./config.json"
import { diffieHellman } from './Login';
import { useCookies } from "react-cookie";

function User_profile() {
  const token = document.cookie;
  let user_ID = token.split("/")[0].replace("token=", "");
  const [user, setUser] = useState("")
  const [postData, setPostData] = useState([])
  const [login, setLogin] = useState(true)
  const [edit, setEdit] = useState(false)
  const [userN, setUserN] = useState("")
  const [name, setName] = useState("")
  const navigate = useNavigate()
  const [cookies, setCookie] = useCookies(["user_session","post_session", "comment_session", "media_session", "token"])

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
    try {
      fetch(`${config.user_host}/users/` + user_ID, {
        method: 'GET',
      }).then(res => res.json()).then(data => { setUser(data) })
    } catch (e) {
      alert(e);
    }
    try {
      fetch(`${config.post_host}/posts/user-posts/` + user_ID, {
        method: 'GET',
      }).then(res => res.json()).then(data => { setPostData(data) })
    } catch (e) {
      alert(e);
    }
  }, [])

  const loadPosts = () => {
    let returnPosts = []
    if (postData.length == 0) {
      return "no posts yet!"
    }
    for (let i = 0; i < postData.length; i++) {
      returnPosts.push(<div key={postData[i].post_id}><mui.Button
        id={postData[i].post_id}
        href={"../post/" + postData[i].post_id}
        sx={{
          width: '40%',
          bgcolor: '#dddddd',
          color: '#000000',
          border: 2,
          overflow: 'auto'
        }}>{postData[i].description}</mui.Button><br></br><br></br></div>)
    }
    return returnPosts;
  }

  const editUser = () => {
    try {
      if (userN != "" && name != "") {
        fetch(`${config.user_host}/users/` + user_ID, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "user_id": user_ID,
            "username": userN,
            "first_name": name.split(" ")[0],
            "last_name": name.split(" ")[1],
            "post_ids": user.post_ids,
            "comment_ids": user.comment_ids,
            "user_group": user.user_group
          }),
        })
      }
      else if (userN != "") {
        fetch(`${config.user_host}/users/` + user_ID, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "user_id": user_ID,
            "username": userN,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "post_ids": user.post_ids,
            "comment_ids": user.comment_ids,
            "user_group": user.user_group
          }),
        })
      }
      else if (name != "") {
        fetch(`${config.user_host}/users/` + user_ID, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "user_id": user_ID,
            "username": user.username,
            "first_name": name.split(" ")[0],
            "last_name": name.split(" ")[1],
            "post_ids": user.post_ids,
            "comment_ids": user.comment_ids,
            "user_group": user.user_group
          }),
        })
      }
      navigate(0)
    } catch(e) {
      alert(e);
    }
  }

  const deletePosts = () => {
    let postIds = user.post_ids.replaceAll("\"", "").replaceAll("\\", "").replaceAll("[", "")
    .replaceAll("]", "").split(", ")
    for (let i = 0; i < postIds.length; i++) {
      try {
        fetch(`${config.post_host}/posts/` + postIds[i], {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "post_id": postIds[i],
          }),
        })
      }
      catch (e) {
        alert(e);
      }
    }
   setEdit(false);
   navigate(0);
  }

  const deleteComments = () => {
    let commentIds = user.comment_ids.replaceAll("\"", "").replaceAll("\\", "").replaceAll("[", "")
    .replaceAll("]", "").split(", ")
    for (let i = 0; i < commentIds.length; i++) {
      try {
        fetch(`${config.comment_host}/comments/` + commentIds[i], {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "comment_id": commentIds[i],
          }),
        })
      }
      catch (e) {
        alert(e);
      }
    }
   setEdit(false);
   navigate(0);
  }

  const deleteUser = () => {
    try {
      deletePosts()
      deleteComments()
      fetch(`${config.user_host}/users/` + user_ID, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "user_id": user_ID,
        }),
      })
    }
    catch (e) {
      alert(e);
    }
   setEdit(false);
   logout();
  }

  const logout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setLogin(false)
  }
  if (edit && login) {
    return (
    <div className="App">
        <a href="./dashboard">
          <input type="image" className="logo" src={logo} height={75} width={75} />
        </a>
        <mui.Box
        sx={{
          width: 700,
          height: 600,
          bgcolor: '#dddddd',
          borderColor: '#000000',
          border: 2,
          borderRadius: 2,
          position: 'absolute',
          top: 100,
          left: '25%'
        }}>
          <img className="default_pfp" src={default_pfp} height={200} width={200} />
          <mui.Button variant='contained'
          style={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
          position: 'absolute', top:220, left: 50}} onClick={() => {editUser(); setEdit(false)}}>Save Edits</mui.Button>
          <mui.Button variant='contained'
          sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
          position: 'absolute', top:260, left: 40}} onClick={() => {setEdit(false )}}>Cancel Edits</mui.Button>
          <mui.Box
          textAlign="left"
          sx={{
            width: "40%",
            height: "15%",
            bgcolor: '#dddddd',
            borderColor: '#000000',
            position: 'absolute',
            left: "40%",
            top: "10%"
          }}>
            Username: 
            <textarea defaultValue={user.username}
            onChange={(userN) => setUserN(userN.target.value)}
            style={{resize: "none", height: "20%", width: "59.6%", position: "absolute", top: "-4%", left: "30%",
            border: "1px solid black"}}></textarea>
            <br></br>
            Name: 
            <textarea defaultValue={user.first_name + " " + user.last_name} 
            onChange={(name) => setName(name.target.value)}
            style={{resize: "none", height: "20%", width: "59.6%", position: "absolute", top: "22.4%", left: "20%",
            border: "1px solid black"}}></textarea>
            <br></br><br></br>
            Total Posts: {postData && (postData.result != 'FAILED') ? postData.length : 0}
            <br></br>
            Total Comments: {(user.comment_ids && user.comment_ids != "[]") ? (user.comment_ids).split(",").length : 0}
            <br></br>
            User Group: {user.user_group}

            <mui.Button variant='contained'
            sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
            position: 'absolute', top:120, left: 0}} onClick={() => {deletePosts()}}>Delete all posts</mui.Button>
            <mui.Button variant='contained'
            sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
            position: 'absolute', top:160, left: 0}} onClick={() => {deleteComments()}}>Delete all comments</mui.Button>
            <mui.Button variant='contained'
            sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', width: "50%",
            position: 'absolute', top:120, left: 250}} onClick={() => {deleteUser()}}>Delete user</mui.Button>
          </mui.Box>
          <mui.Box
          sx={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            overflowY: "scroll",
            width: "100%",
            height: "40%",
            bgcolor: '#dddddd',
            borderColor: '#000000',
            borderTop: 2,
            position: 'absolute',
            top: '50%'
          }}>
            Posts <br></br><br></br>{loadPosts()}
          </mui.Box>
        </mui.Box>
      </div>
    );
  }
  else if (login) {
    return (
    <div className="App">
        <a href="./dashboard">
          <input type="image" className="logo" src={logo} height={75} width={75} />
        </a>
        <mui.Box
        sx={{
          width: 700,
          height: 600,
          bgcolor: '#dddddd',
          borderColor: '#000000',
          border: 2,
          borderRadius: 2,
          position: 'absolute',
          top: 100,
          left: '25%'
        }}>
          <img className="default_pfp" src={default_pfp} height={200} width={200} />
          <mui.Button variant='contained'
          style={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
          position: 'absolute', top:220, left: 15}} onClick={() => {setEdit(true)}}>Edit</mui.Button>
          <mui.Button variant='contained'
          sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
          position: 'absolute', top:220, left: 105}} onClick={() => {logout()}}>Sign out</mui.Button>
          <mui.Box
          textAlign="left"
          sx={{
            width: "40%",
            height: "15%",
            bgcolor: '#dddddd',
            borderColor: '#000000',
            position: 'absolute',
            left: "40%",
            top: "10%"
          }}>
            Username: {user.username}
            <br></br>
            Name: {user.first_name + " " + user.last_name}
            <br></br><br></br>
            Total Posts: {postData && (postData.result != 'FAILED') ? postData.length : 0}
            <br></br>
            Total Comments: {(user.comment_ids && user.comment_ids != "[]") ? (user.comment_ids).split(",").length : 0}
            <br></br>
            User Group: {user.user_group}
          </mui.Box>
          <mui.Box
            sx={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              overflowY: "scroll",
              width: "100%",
              height: "40%",
              bgcolor: '#dddddd',
              borderColor: '#000000',
              borderTop: 2,
              position: 'absolute',
              top: '50%'
            }}>
            Posts <br></br><br></br>{loadPosts()}
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

export default User_profile;
