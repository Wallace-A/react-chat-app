import React, { useRef, useState} from "react";
import './App.css';

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

if(!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyAYOUsJlbmALpS5CevzlcgOTSyggo5xtM0",
    authDomain: "react-chat-app-2c67a.firebaseapp.com",
    projectId: "react-chat-app-2c67a",
    storageBucket: "react-chat-app-2c67a.appspot.com",
    messagingSenderId: "293411865288",
    appId: "1:293411865288:web:75fdaabb4e4bb8143f5bfd",
    measurementId: "G-KBRBQB70C6"
  })
}


const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      <section >
        {user ? <ChatRoom /> : <SignIn/>}
      </section>
    </div>
  );
}
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <>
      <button onClick={signInWithGoogle}>Sign in with google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
      </>
  )

  
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query, {idField:"id"});

  const [formValue, setFormValue] = useState("");

  const sendMessage = async(e) => {
    //stop page reloading
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    //reset to empty string
    setFormValue("");
    dummy.current.scrollIntoView({ behaviour: "smooth"});
  }
  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} 
        onChange={(e) => setFormValue(e.target.value)}/>
        <button type="submit">Submit</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "recieved";
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL|| 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="" />
      <p>{text}</p>
    </div>
  )
}
export default App;
