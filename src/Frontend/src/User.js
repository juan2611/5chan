import * as mui from '@mui/material';
import './User_profile.css';
import default_pfp from "./default-pfp.jpeg";
import logo from "./logo.png";
import { useEffect, useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import config from "./config.json"
import { diffieHellman } from './Login';
import { useCookies } from "react-cookie";

function User() {
  const token = document.cookie;
  let user_visiting = token.split("/")[0].replace("token=","");
  let readAccess = token.split("/")[3];
  let user_ID = useParams().id;
  const [user, setUser] = useState("")
  const [postData, setPostData] = useState([])
  const [login, setLogin] = useState(true)
  const [visiting, setVisiting] = useState("")
  const [deletedUser, setDeletedUser] = useState("")
  const [readState, setReadState] = useState(true)
  const [postState, setPostState] = useState(true)
  const [commentState, setCommentState] = useState(true)
  const [mediaState, setMediaState] = useState(true)
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
      }).then(res => res.json()).then(data => {setUser(data)})
    } catch(e) {
      alert(e);
    }
    try {
      fetch(`${config.user_host}/users/` + user_visiting, {
        method: 'GET',
      }).then(res => res.json()).then(data => {setVisiting(data)})
    } catch(e) {
      alert(e);
    }
    try {
      fetch(`${config.post_host}/posts/user-posts/` + user_ID, {
        method: 'GET',
      }).then(res => res.json()).then(data => {setPostData(data)})
    } catch(e) {
      alert(e);
    }
    setReadState(user.read_access)
    setCommentState(user.comment_access)
    setPostState(user.post_access)
    setMediaState(user.media_access)
  }, [])

  const editAccess = () => {
    try {
      fetch(`${config.user_host}/users/` + user_ID, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "user_id": user_ID,
          "username": user.username,
          "first_name": user.first_name,
          "last_name":user.last_name,
          "post_ids": user.post_ids,
          "comment_ids": user.comment_ids,
          "user_group": user.user_group,
          "read_access": readState,
          "comment_access": commentState,
          "post_access": postState,
          "media_access": mediaState
        }),
      })
    }
    catch (e) {
      alert(e)
    }
    navigate(0)
  }

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
  }

  const deleteUser = () => {
    deleteComments()
    deletePosts()
    try {
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
    setDeletedUser(true)
  }

  const promoteDemote = (promoteOrDemote) => {
    if (promoteOrDemote) {
      try {
        fetch(`${config.user_host}/users/` + user_ID, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "user_id": user_ID,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "post_ids": user.post_ids,
            "comment_ids": user.comment_ids,
            "user_group": "mod"
          }),
        })
      }
      catch (e) {
        alert(e)
      }
    }
    else {
      try {
        fetch(`${config.user_host}/users/` + user_ID, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "user_id": user_ID,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "post_ids": user.post_ids,
            "comment_ids": user.comment_ids,
            "user_group": "normal"
          }),
        })
      }
      catch (e) {
        alert(e)
      }
    }
    navigate(0)
  }

  const promotCheck = (userType) => {
    if (userType == "admin" && user.user_group != "admin") {
      if (user.user_group == "normal") {
        return (
        <mui.Button variant='contained'
              sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
              position: 'absolute', top:"40%", left: "38%"}} onClick={() => {promoteDemote(true)}}>Promote user</mui.Button>);
      }
      else if (user.user_group == "mod") {
        return (
        <mui.Button variant='contained'
              sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
              position: 'absolute', top:"40%", left: "38%"}} onClick={() => {promoteDemote(false)}}>Demote user</mui.Button>);
      }
    }
    return null
  }

  const deleteCheck = () => {
    if ((visiting.user_group == "mod" && user.user_group == "normal") || (visiting.user_group == "admin" && user.user_group != "admin")) {
      return(
      <mui.Button variant='contained'
            sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
            position: 'absolute', top:"40%", left: "5%"}} onClick={() => {deleteUser()}}>Delete user</mui.Button>);
      }
    return null;
  }

  const accessCheck = () => {
    if ((visiting.user_group == "mod" || visiting.user_group == "admin") && user.user_group == "normal") {
      return(
        <mui.Box
        textAlign="center"
        sx={{
          width: "25%",
          height: "15%",
          bgcolor: '#dddddd',
          borderColor: '#000000',
          position: 'absolute',
          left: "70%",
          top: "10%"
        }}>
          User Permissions
          <br></br><br></br>
          Read access: {user.read_access ? "Yes" : "No"}
          <br></br>
          Post access: {user.post_access ? "Yes" : "No"}
          <br></br>
          Comment access: {user.comment_access ? "Yes" : "No"}
          <br></br>
          Media access: {user.media_access ? "Yes" : "No"}
        
          <input type="checkbox" style={{position:"absolute", top: "42%", left: "100%"}} onClick={() => {setReadState(!readState)}}/>
          <input type="checkbox" style={{position:"absolute", top: "64%", left: "100%"}} onClick={() => {setPostState(!postState)}}/>
          <input type="checkbox" style={{position:"absolute", top: "85%", left: "100%"}} onClick={() => {setCommentState(!commentState)}}/>
          <input type="checkbox" style={{position:"absolute", top: "106%", left: "100%"}} onClick={() => {setMediaState(!mediaState)}}/>

          <mui.Button variant='contained'
            sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
            position: 'absolute', top: "200%", left: "15%"}} onClick={() => {editAccess()}}>Edit access</mui.Button>
        </mui.Box>
      );
    }
    return null;
  }

  const logout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setLogin(false)
    navigate(0)
  }

  if (deletedUser) {
    return <Navigate replace to="../dashboard"/>
  }
  else if (visiting.user_group == "mod" || visiting.user_group == "admin") { //Seperate when promotion aspect is enabled
    return (
      <div className="App">
        <a href="../dashboard">
          <input type="image" className="logo" src={logo} height={75} width={75} />
        </a>
        <mui.Button variant='contained'
          sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
          position: 'absolute', top:20, left: 1260}} onClick={() => {logout()}}>Sign out</mui.Button>
        <a href="../profile">
          <input type="image" className="default-pfp" src={default_pfp} height={75} width={75} />
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
            Total Posts: {postData ? postData.length : 0}
            <br></br>
            Total Comments: {(user.comment_ids && user.comment_ids != "[]") ? (user.comment_ids).split(",").length : 0}
            <br></br>
            User Group: {user.user_group}
          </mui.Box>
          {deleteCheck()}
          {promotCheck(visiting.user_group)}
          {accessCheck()}
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
  else if (user_ID == user_visiting) {
    return <Navigate replace to="../profile"/>
  }
  else if (login && readAccess == "read") {
    return (
      <div className="App">
        <a href="../dashboard">
          <input type="image" className="logo" src={logo} height={75} width={75} />
        </a>
        <mui.Button variant='contained'
          sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
          position: 'absolute', top:20, left: 1260}} onClick={() => {logout()}}>Sign out</mui.Button>
        <a href="../profile">
          <input type="image" className="default-pfp" src={default_pfp} height={75} width={75} />
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
            Total Posts: {postData ? postData.length : 0}
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
  else if (readAccess != "user") {
    return(
      <div className="App">
        <a href="../dashboard">
          <input type="image" className="logo" src={logo} height={75} width={75} />
        </a>
        <mui.Button variant='contained'
          sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
          position: 'absolute', top:20, left: 1260}} onClick={() => {logout()}}>Sign out</mui.Button>
        <a href="../profile">
          <input type="image" className="default-pfp" src={default_pfp} height={75} width={75} />
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
          You're not allowed to see profiles!
        </mui.Box>
      </div>);
  }
  else {
    navigate(0)
    return <Navigate replace to="/login"/>
  }
}

export default User;
