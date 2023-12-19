import * as mui from '@mui/material';
import './Dashboard.css';
import default_pfp from "./default-pfp.jpeg";
import logo from "./logo.png";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom"
import config from "./config.json"
import {decryptStringAES, encryptStringAES, hashPassword} from "./utils"
import servers from "./servers.json"
import JSEncrypt from 'jsencrypt'
import { diffieHellman } from './Login';
import { useCookies } from "react-cookie";

import * as CryptoJS from 'crypto-js';

export function generateKey(p){
  return sha256(p);
}

export async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);
  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string                  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function Kex(url, pub_key) {
  let key_error = false
  let server_pub = undefined
  try {
    let resp;
    resp = await fetch(url, {
      method: 'GET',
    });
    server_pub = resp.json().server_pub
    const key_hash = sha256(server_pub)
    key_error = true
    // key check and store
    if (key_hash!==pub_key) {
      key_error = true
      for (const hash of servers.servers) {
        if (key_hash===hash) {
          key_error = false
          break;
        }
      }
    }
    // generate AES
    if (!key_error) {
      var key;
      const randomBytes = Array(16)
        .fill()
        .map(() => Math.round(Math.random() * 0xFF));
      key = generateKey(new TextDecoder("utf-8").decode(randomBytes));
      const body = JSON.stringify({
        "key": key
      })
      const encrypt = new JSEncrypt()
      encrypt.setPublicKey(server_pub)
      const encrypted = encrypt.encrypt(body)
      resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: encrypted
      });
      if (resp.status!==200) {
        key_error = true
      }
    }
    if (key_error) {
      alert("key exchange error!")
    } else {
      return key;
    }
  } catch (e) {
    key_error = true
    alert("key exchange error!")
  }
}

function Dashboard() {
  const [postContent, setPostContent] = useState("")
  const [postData, setPostData] = useState("")
  const [login, setLogin] = useState(true)
  const [media, setMedia] = useState("")
  const [cookies, setCookie] = useCookies([
    "user_session",
    "post_session",
    "comment_session",
    "media_session",
    "token"])
  const navigate = useNavigate()

  const user_g = 5n
  //4096 bit prime generated by 2ton.com.au/safeprimes/
  const user_p = 577891979226697945570213780521809426563365791435615832711012378975984090706711917615938495479321251358605416479067241081499497036839950356312625597915929364713575346541675959839159009416370898443127459344409878709845697518679122868962118907715571007000916180621970149148136229013170679223203460365617450421691941273835363116508991034178359390084708401581953959008754168771552735521904480713439940947226031866986121762340975621049253684451435399030266860183064954357336799400350480461284469165141631413805707145204708837559352239067360772939965058210616259303108609951008480806667347855751672593239289058012594718617219786601449982343198203231748683266822819073665711182271257734849627858310345536879821077935399795186538030449767160405711762844960031523239541898481869878913445358646928023166940768223088754414136964463018749469689652124543359528248272704783756259254408405133060554006685687358333240561439885337656631093448524482764852413691768290115225854434316473796757712296260976691154626491990747850785649812567977965618087169928752768736500994467612790526523884398574478437931941918120157206366766875928558302834507669957053069399504813957691091119203137043900000222354063927513406469713721166441337402223171582540462531999967n;
  const post_g = 5n
  //4096 bit prime generated by 2ton.com.au/safeprimes/
  const post_p = 577891979226697945570213780521809426563365791435615832711012378975984090706711917615938495479321251358605416479067241081499497036839950356312625597915929364713575346541675959839159009416370898443127459344409878709845697518679122868962118907715571007000916180621970149148136229013170679223203460365617450421691941273835363116508991034178359390084708401581953959008754168771552735521904480713439940947226031866986121762340975621049253684451435399030266860183064954357336799400350480461284469165141631413805707145204708837559352239067360772939965058210616259303108609951008480806667347855751672593239289058012594718617219786601449982343198203231748683266822819073665711182271257734849627858310345536879821077935399795186538030449767160405711762844960031523239541898481869878913445358646928023166940768223088754414136964463018749469689652124543359528248272704783756259254408405133060554006685687358333240561439885337656631093448524482764852413691768290115225854434316473796757712296260976691154626491990747850785649812567977965618087169928752768736500994467612790526523884398574478437931941918120157206366766875928558302834507669957053069399504813957691091119203137043900000222354063927513406469713721166441337402223171582540462531999967n;

  //Token functionality (
  //strings containing non-hex values can't exist in guid (id), so can just use .include() instead of stripping token across delimiter)
  let canPost;
  let canView;
  const token = document.cookie;
  let user_ID = token.split("/")[0].replace("token=", "");
  token.includes("post") ? canPost = true : canPost = false
  token.includes("read") ? canView = true : canView = false
  console.log(token)

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
    try {
      fetch(`${config.post_host}/posts`, {
        method: 'GET',
      }).then(res => res.json()).then(data => { setPostData(data) })
    } catch (e) {
      alert(e);
    }
  }, [])

  const loadPosts = () => {
    let returnPosts = []
    if (postData.length == 0) {
      return <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
        No posts to see yet! Be the first one, or visit this cool video to kill some time until someone posts :)</a>
    }
    for (let i = 0; i < postData.length; i++) {
      returnPosts.push(<div key={postData[i].post_id}><mui.Button
        id={postData[i].post_id}
        href={"../post/" + postData[i].post_id}
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: '#dddddd',
          color: '#000000',
          border: 2,
          position: 'absolute',
          overflow: 'auto'
        }}>{postData[i].description}</mui.Button><br></br><br></br></div>)
    }
    return returnPosts;
  }

  const handleChange = (event) => {
    setMedia(event.target.files[0])
  }

  async function postAuth (postId) {
    let jsonObject = {
      post_id: postId,
      user_id: user_ID,
      user_list: ["temp1", "temp2"]
    }
    const [encrypteddata, iv] = await encryptStringAES(jsonObject, "secretKey")
    try {
      await fetch(`${config.post_host}/post`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "iv": iv,
          "encrypted_data": encrypteddata
        }),
      });
    } catch(e) {
      alert(e);
    }
  }
  async function getAuth (postId) {
    try {
      const resp_auth = await fetch(`${config.post_host}/post-key/${postId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      const  resp_rsrc = await fetch(`${config.post_host}/post`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      if (resp_auth.status == 200 && resp_rsrc.status ==200) { 
        const data_auth = await resp_auth.json()
        const data_rsrc = await resp_rsrc.json()
        const decrypt = await decryptStringAES(data_rsrc.encrypted_data,data_auth.iv, data_auth.key)
      }
    } catch(e) {
      alert(e);
    }
  }

  async function postRsrc (postId) {
    let jsonObject = {
      post_id: postId,
      user_id: user_ID,
    }
    const [encrypteddata, iv] = await encryptStringAES(jsonObject, "secretKey")
    try {
      await fetch(`${config.post_host}/post`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "iv": iv,
          "encrypted_data": encrypteddata
        }),
      });
    } catch(e) {
      alert(e);
    }
  }

  async function postRequest (postId) {
    try {
      let post_key = await cookies.auth_session
      if (post_key===undefined) {
        post_key = await diffieHellman()
        setCookie("post_session", post_key, { maxAge:720, path:"/" })
      }
      if (post_key!==undefined && post_key!==null){
        await fetch(`${config.post_host}/posts`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "post_id": postId,
            "user_id": user_ID,
            "description": postContent,
            "comment_ids": []
          }),
        });
      }
    } catch(e) {
      alert(e);
    }
  }

  const postThing = (file) => {
    let guid = generate_guid()
    postMedia(guid, file).then(postRequest(guid)).then(navigate(0));
  }

  async function postMedia (postId, file) {
    try {
      const formData = new FormData();

      formData.append('file', file)
      formData.append("post_id", postId)
      formData.append("user_id", user_ID)

      await fetch(`${config.media_host}/media/upload_photo`, {
        method: 'POST',
        body: formData
      });
    } catch(e) {
      alert(e);
    }
  }

  const postAbility = () => {
    if (canPost) {
      return (<mui.Box
        sx={{
          width: '40%',
          height: '100%',
          bgcolor: '#dddddd',
          borderColor: '#000000',
          border: 2,
          position: 'absolute',
          left: '60%'
        }}>
        <mui.TextField
          label="New post"
          multiline
          id="post"
          defaultValue="Write a post!"
          variant="filled"
          size="small"
          overflow="auto"
          style={{ maxWidth: '100%', maxHeight: '70%', minWidth: '100%', minHeight: '70%' }}
          onChange={(postContent) => setPostContent(postContent.target.value)}>
        </mui.TextField>

        <p style={{position:"absolute", top:"70%", left: "35%"}}>Upload a file with post below:</p>
        <form action="/action_page.php" style={{position:"absolute", top:"77%", left: "35%"}}>
            <input type="file" id="myFile" name="filename" onChange={ handleChange }/>
        </form>

        <div className="SubmitPost">
          <mui.Button variant="contained" onClick={() => { 
            postThing(media) }}
            style={{
              maxWidth: '200px', maxHeight: '30px', minWidth: '200px', minHeight: '30px',
              background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)'
            }}>
            Post
          </mui.Button>
        </div>
      </mui.Box>)
    }
    else {
      return (<mui.Box
        sx={{
          width: '40%',
          height: '100%',
          bgcolor: '#dddddd',
          borderColor: '#000000',
          border: 2,
          position: 'absolute',
          left: '60%'
        }}>
        Sorry, but you can't post!
      </mui.Box>)
    }
  }

  const logout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setLogin(false);
    navigate(0)
  }

  if (login && canView) {
    return (
      <div className="App">
        <img className="logo" src={logo} height={75} width={75} />

        <mui.Button variant='contained'
          sx={{
            color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)',
            position: 'absolute', top: 20, left: 1260
          }} onClick={() => { logout() }}>Sign out</mui.Button>
        <a href="./profile">
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
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              overflowY: "scroll",
              width: '60%',
              height: '100%',
              bgcolor: '#dddddd',
              borderColor: '#000000',
              border: 2,
              position: 'absolute'
            }}><div className="postData">{canView ? loadPosts() : "You can't view posts!"}</div></mui.Box>
          {postAbility()}
        </mui.Box>
      </div>
    );
  }
  else if (!canView) {
    return (
    <div className="App">
      <img className="logo" src={logo} height={75} width={75} />

      <mui.Button variant='contained'
        sx={{color: '#ffffff', background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)', 
        position: 'absolute', top:20, left: 1260}} onClick={() => {logout()}}>Sign out</mui.Button>
      <a href="./profile">
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
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            overflowY: "scroll",
            width: '60%',
            height: '100%',
            bgcolor: '#dddddd',
            borderColor: '#000000',
            border: 2,
            position: 'absolute'
          }}><div className="postData">{canView ? loadPosts() : "You can't view posts!"}</div></mui.Box>
          {postAbility()}
      </mui.Box>
    </div>);
  }
  else {
    navigate(0)
    return <Navigate replace to="/login" />
  }
}

export default Dashboard;
