/* global BigInt */
import * as mui from '@mui/material';
import './Login.css';
import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import config from "./config.json"
import {encryptStringAES, hashPassword, decryptStringAES} from "./utils"
import { useCookies } from "react-cookie";

import * as CryptoJS from 'crypto-js';
// import s_pk from "./RSPK.json"

export async function diffieHellman(url, g, p) {
    let dh_error=false
    //Have to establish a secure connection with DH first
    //Generates a random 512 bit number
    const randomBytes = Array(64)
      .fill()
      .map(() => Math.round(Math.random() * 0xFF));
    const c = randomBytes
      .reduce((n, c, i) => n | BigInt(c) << BigInt(i) * 8n, 0n);
    const A = (g ^ c) % p;
    let B;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "A":A.toString(16) })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log(response.toString())
      const data = await response.json();
      B = BigInt(data.B);
    } catch (e) {
      dh_error = true
      alert("key exchange failed!")
    }
    // const B=1
    if (!dh_error) {
      const secret = ((B ^ c) % p).toString(16);
      console.log(secret)
      return generateKey(secret)
    } else {
      return null
    }
}

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

function Login() {
  const [userValue, setUserValue] = useState("")
  const [logs, setLogs] = useState(false)
  const [password, setPassword] = useState("")
  const [cookies, setCookie] = useCookies(["auth_session", "user_session", "token"])
  const [dh_error, setDHError] = useState(false)
  const navigate = useNavigate()

    const auth_g = 5n
    //4096 bit prime generated by 2ton.com.au/safeprimes/
    const auth_p = 577891979226697945570213780521809426563365791435615832711012378975984090706711917615938495479321251358605416479067241081499497036839950356312625597915929364713575346541675959839159009416370898443127459344409878709845697518679122868962118907715571007000916180621970149148136229013170679223203460365617450421691941273835363116508991034178359390084708401581953959008754168771552735521904480713439940947226031866986121762340975621049253684451435399030266860183064954357336799400350480461284469165141631413805707145204708837559352239067360772939965058210616259303108609951008480806667347855751672593239289058012594718617219786601449982343198203231748683266822819073665711182271257734849627858310345536879821077935399795186538030449767160405711762844960031523239541898481869878913445358646928023166940768223088754414136964463018749469689652124543359528248272704783756259254408405133060554006685687358333240561439885337656631093448524482764852413691768290115225854434316473796757712296260976691154626491990747850785649812567977965618087169928752768736500994467612790526523884398574478437931941918120157206366766875928558302834507669957053069399504813957691091119203137043900000222354063927513406469713721166441337402223171582540462531999967n;

  // intended for RS, do not use
  // async function Kex() {
  //   try {
  //     let resp;
  //     resp = await fetch(`${config.login_host}/key_exchange`, {
  //       method: 'GET',
  //     });
  //     const server_key = resp.json().server_pub
  //     const key_hash = sha256(server_key)
  //     setKeyError(true)
  //     // key check and store
  //     if (key_hash!==cookies.auth_pub) {
  //       setKeyError(true)
  //       for (const hash of servers.servers) {
  //         if (key_hash===hash) {
  //           setCookie("auth_pub", hash, {path:"/"})
  //           setKeyError(false)
  //         }
  //       }
  //     }
  //     // generate AES
  //     if (!key_error) {
  //       const key = generateKey('ppkjj');
  //       setCookie("auth_key", key, {path:"/"});
  //       const body = JSON.stringify({
  //         "key": key
  //       })
  //       const encrypt = new JSEncrypt()
  //       encrypt.setPublicKey(server_key)
  //       const encrypted = encrypt.encrypt(body)
  //       resp = await fetch(`${config.login_host}/key-exchange`, {
  //         method: 'POST',
  //         headers: {
  //           'Accept': 'application/json',
  //           'Content-Type': 'application/json'
  //         },
  //         body: encrypted
  //       });
  //       if (resp.status!==200) {
  //         setKeyError(true)
  //       }
  //     }
  //     if (key_error) {
  //       alert("key exchange error!")
  //     }
  //   } catch (e) {
  //     setKeyError(true)
  //     alert("key exchange error!")
  //   }
  // }

  async function postAuth(user, key) {
    console.log("In login js")
    let resp;
    const hashpwd  = await hashPassword(password);
    const jsonObject = {
      username: user,
      password: hashpwd,
      time: Math.floor(Date.now() / 1000),
    };
  //   let secretKey = ""
  // console.log("secret key : ", secretKey)
    const [encrypteddata, iv] = await encryptStringAES(jsonObject, key)
    console.log("iv: ", iv)
    console.log("ec: ", encrypteddata)
    try {
      resp = await fetch(`${config.login_host}/auth`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'

        },
        body: JSON.stringify({
          "iv": iv,
          "encrypted_data": encrypteddata,
        }),
      });

      if (resp.status === 200) {
        const data = await resp.json();
        const decryptedToken = await decryptStringAES(data.token, data.iv, key);
        console.log("Decrypted Token: ", decryptedToken);
        const parts = decryptedToken.split('|');
        let timestamp = parts[5]
        timestamp += 2* 60 * 60 * 1000;
        let exp = new Date();
        exp.setTime(timestamp);
        setCookie("token", decryptedToken, {expires:exp})
        
      }else if (resp.status === 401) {
        resp.json().then(function (result) {
          alert(result.message)
        })
      }
    } catch (e) { }
    return resp;
  }

  const post = () => {
    (async () => {
      let key = await cookies.auth_session
      if (key===undefined) {
        key = await diffieHellman(`${config.login_host}/key-exchange`, auth_g, auth_p)
        setCookie("auth_session", key, { maxAge:720, path:"/" })
      }
      if (key!==undefined && key!==null){
        postAuth(userValue, key).then(res => {
          if (res.status !== 401) {
            res.json().then(function (result) {
              try {
                fetch(`${config.user_host}/users/` + result.token.user_id, {
                  method: 'GET',
                }).then(res => res.json()).then(data => {
                  console.log("Key is : ", key)
                  // let rA = CryptoJS.AES.decrypt(data.read_access, key) ? "read/" : ""
                  // let pA = CryptoJS.AES.decrypt(data.post_access, key) ? "post/" : ""
                  // let cA = CryptoJS.AES.decrypt(data.comment_access, key) ? "comment/" : ""
                  // let mA = CryptoJS.AES.decrypt(data.media_access, key) ? "media" : ""
                //let exp = new Date();
                //let time = exp.getTime();
                //time += 2* 60 * 60 * 1000; //Sets token to expire after 2 hours

                  //let exp = new Date();
                  //let time = exp.getTime();
                  //time += 2* 60 * 60 * 1000; //Sets token to expire after 2 hours
                  //exp.setTime(time);
                  // let tokenString = result.token.user_id + "/" + rA + pA + cA + mA
                  // document.cookie = 'token=' + tokenString + "; " +
                    //'expires=' + exp.toUTCString() + "; "
                   // '; path=/';
                  setLogs(true)
                })
              } catch (e) { alert(e) }
            })
          }
        })
        // } catch (error) {
        //   console.error('Error during key exchange:', error);
        // }

        //Communicate A to server and get B from server, then compute the DH key
        //const B = {fetch B from server while sending A}
      } else {
        setDHError(true)
      }
    })();
  }

  // useEffect(() => {
  //   const encrypted_key = encryptRSA(key, pub_key);
  //   console.log("Encrypted RSA : ", encrypted_key);
  
  //   fetch(`${config.login_host}/resource-key-exchange`, {
  //     method: 'POST',
  //     headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       "encrypted_key": encrypted_key,
  //     })
  //   })
  //   .then(resp => {
  //     if (!resp.ok) {
  //       throw new Error(`HTTP error! status: ${resp.status}`);
  //     }
  //     return resp.json(); 
  //   })
  //   .then(data => {
  //     console.log(data);
  //     setResourcekey(encrypted_key)
  //   })
  //   .catch(error => {
  //     alert(error);
  //   });
  
  // }, [rspk]);

  // useEffect(() => {
  //   const encrypted_token = encryptRSA(key, pub_key);
  //   console.log("Encrypted RSA : ", encrypted_key);
  
  //   fetch(`${config.login_host}/authenticate-token`, {
  //     method: 'POST',
  //     headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       "encrypted_token": encrypted_token,
  //     })
  //   })
  //   .then(resp => {
  //     if (!resp.ok) {
  //       throw new Error(`HTTP error! status: ${resp.status}`);
  //     }
  //     return resp.json(); 
  //   })
  //   .then(data => {
  //     console.log(data);
  //     setResourcekey(encrypted_key)
  //   })
  //   .catch(error => {
  //     alert(error);
  //   });
  
  // }, [resourceKey]);

  if (logs) {
    navigate(0)
    return <Navigate replace to="/dashboard" />;
  } else {
    // T3.2
    // if (key_error) {
    //   return (
    //     <div className='App'>
    //       <mui.Box
    //         sx={{
    //           width: 400,
    //           height: 400,
    //           color: 'text.main',
    //           borderColor: 'primary.main',
    //           border: 2,
    //           borderRadius: 2,
    //           position: 'absolute',
    //           top: 160,
    //           left: '35%'
    //         }}>

    //         <div className="Title">
    //           Warning
    //         </div>

    //         <div className='Info'>
    //           <p>Stored hash does not match the receiving one, or this is the first time you are connecting.<br></br><br></br>
    //             Refresh the page after changing the hash value.</p>
    //         </div>

    //       </mui.Box>
    //     </div>
    //   );
    // }

    if (dh_error) {
      return (
        <div className='App'>
          <mui.Box
            sx={{
              width: 400,
              height: 400,
              color: 'text.main',
              borderColor: 'primary.main',
              border: 2,
              borderRadius: 2,
              position: 'absolute',
              top: 160,
              left: '35%'
            }}>

            <div className="Title">
              Warning
            </div>

            <div className='Info'>
              <p>Key exchange have failed.<br></br><br></br>
                Please clear cookies and refresh the page.</p>
            </div>

          </mui.Box>
        </div>
      );
    }
    return (
      <div className="App">
        <mui.Box
          sx={{
            width: 400,
            height: 400,
            color: 'text.main',
            borderColor: 'primary.main',
            border: 2,
            borderRadius: 2,
            position: 'absolute',
            top: 160,
            left: '35%'
          }}>

          <div className="Title">
            Login
          </div>

          <div className="Username-label">
            <mui.TextField
              label="Username"
              id="username"
              placeholder='Type your username'
              variant="filled"
              size="small"
              style={{ maxWidth: '300px', maxHeight: '50px', minWidth: '300px', minHeight: '50px' }}
              onChange={(userValue) => setUserValue(userValue.target.value)}
            />
          </div>

          <div className="Password-label">
            <mui.TextField
              label="Password"
              id="password"
              placeholder="Type your password"
              variant="filled"
              size="small"
              style={{ maxWidth: '300px', maxHeight: '60px', minWidth: '300px', minHeight: '60px' }}
              onChange={(password) => setPassword(password.target.value)}
            />
          </div>

          <div className="Submit">
            <mui.Button variant="contained" onClick={() => { post() }}
              style={{
                maxWidth: '300px', maxHeight: '30px', minWidth: '300px', minHeight: '30px',
                background: 'linear-gradient(to right bottom, #aa00aa, #3333aa)'
              }}>
              Login
            </mui.Button>
          </div>

          <div className="Link-out">
            <mui.Link href='/register'>Register</mui.Link>
          </div>

        </mui.Box>
      </div>
    );
  }
}



export default Login;
