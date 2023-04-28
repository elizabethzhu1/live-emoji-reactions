// Importing relevant Firebase properties
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js'
import { getDatabase, ref, set, child, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js'

// My web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPNNWA6u30Cak1OTRVIjne9mfqm6s-AFE",
  authDomain: "livereactions-d3293.firebaseapp.com",
  databaseURL: "https://livereactions-d3293-default-rtdb.firebaseio.com",
  projectId: "livereactions-d3293",
  storageBucket: "livereactions-d3293.appspot.com",
  messagingSenderId: "418822606236",
  appId: "1:418822606236:web:f5b3711d4669d8e030cc59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase();

// my code starts here!
// -----------------------

// get user's inputted name + store it in a variable
let username = "user";
const form = document.querySelector("form");

form.addEventListener('submit', () => {
  username = document.getElementById("username").value;
  console.log(username);
})

// get html canvas element + access 2D drawing API
const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');

// listen for relevant events
canvas.addEventListener("mousedown", mousedownHandler);
canvas.addEventListener("mouseup", mouseupHandler);
canvas.addEventListener("mousemove", handleMouseMove);

let isMouseDown = false;
let intervalID;
let animationFrameId;

// function: call generateEmojis with a random emoji on mousedown
function mousedownHandler(event) {
  isMouseDown = true;
  emoji = randomEmoji();
  generateEmojis(event, emoji, 1);
}

// function: halts generateEmojis on mouseup
function mouseupHandler() {
  isMouseDown = false;
  clearInterval(intervalID);
}

// initialize object that maps a user to a random color
let userToColor = {};

// function: generate a random user ID
function generateUserID() {
  var randomID = Math.floor(Math.random() * 100000);
  var userIDString = randomID.toString();
  // assigns the user a random cursor color!
  userToColor[userIDString] = generateRandomCursorColor();
  return userIDString;
}

// generate random userID for current user
let userID = generateUserID();

// function: generate a random color for the cursor
function generateRandomCursorColor() {
  const colors = ["blue", "purple", "green", "red", "orange"];
  var randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

// initialize children in Firebase
let emojisRef = ref(database,'emojis');
let userReactRef = child(emojisRef, userID);  

// function: pick a random emoji from an array
function randomEmoji() {
  const emojis = ["😜", "😂", "😍", "🙂", "🫡", "🤩", "🤗", "🤑", "😇", "😀", "🫣", "😪", "😎", "🥳", "🤠"]
  let randomIndex = Math.floor(Math.random() * emojis.length);
  let emoji = emojis[randomIndex];
  return emoji;
}

// function: generate a burst of emojis
function generateEmojis(event, emoji, opacity) {
  // generates an emoji every 100ms while mouse is down + clear every 300ms
  if (isMouseDown) {
    setTimeout(() => {
      generateEmojis(event, emoji, opacity);
    }, 100)
    setTimeout(() => {
      context.clearRect(0, 0, canvas.clientWidth, canvas.height)}, 300);
  }

  const x = event.clientX - canvas.offsetLeft;      
  const y = event.clientY - canvas.offsetTop;     

  let randomNoise = Math.floor(Math.random() * 60)
  let newX = x - randomNoise;
  let newY = y - randomNoise;

  animate(newX, newY, emoji, opacity);
}

// function: animate each emoji to float up and fade away
function animate(x, y, emoji, opacity) {
  
  let vy = -1;
  opacity -= 0.05;
  y += vy;

  context.globalAlpha = opacity;
  context.font = "30px serif";
  context.fillText(emoji, x, y);

  animationFrameId = requestAnimationFrame(() => animate(x, y, emoji, opacity));

  if (opacity <= 0) {
    cancelAnimationFrame(animationFrameId);
  }

  // update emoji location in database, emoji type, and opacity
  set(userReactRef, {
    emoji: emoji,
    x: x,
    y: y,
    opacity: opacity
  });
}

// listen for changes in children data -> draw the emoji on canvas
if (emojisRef) {
  onValue(emojisRef, (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      var emoji = childSnapshot.val().emoji;
      var emojiX = childSnapshot.val().x;
      var emojiY = childSnapshot.val().y;
      var opacity = childSnapshot.val().opacity;
      
      if (opacity > 0) {
        context.globalAlpha = opacity;
        context.font = "30px serif";
        context.fillText(emoji, emojiX, emojiY);
      }

    });
  });
}

// initialize relevant nodes in Firebase
let userCursorRef = ref(database,'cursors');
let childNodeRef = child(userCursorRef, userID);  

// function: updates the data when the mouse moves
function handleMouseMove(event) {
  const x = event.clientX - canvas.offsetLeft;
  const y = event.clientY - canvas.offsetTop;

  // store cursor location, color, and username under a userID in Firebase
  set(childNodeRef, {
    x: x,
    y: y,
    color: userToColor[userID],
    name: username
  });

}

// listen + activate when any user cursor position changes
if (userCursorRef) {
  onValue(userCursorRef, (snapshot) => {

    context.clearRect(0, 0, canvas.clientWidth, canvas.height);

    snapshot.forEach((childSnapshot) => {
      let cursorX = childSnapshot.val().x;
      let cursorY = childSnapshot.val().y;
      let cursorColor = childSnapshot.val().color;
      let cursorName = childSnapshot.val().name;

      // draws a live triangular cursor for each user
      context.globalAlpha = 1;
      context.beginPath();
      context.moveTo(cursorX, cursorY + 15);
      context.lineTo(cursorX - 10, cursorY - 20);
      context.lineTo(cursorX + 20, cursorY); 
      
      // determine line color - access the color a specific user has
      context.strokeStyle = cursorColor;
      context.stroke();
      
      // determine fill color
      context.fillStyle = cursorColor;
      context.fill();
      
      // add user's name next to cursor!
      context.font = "14px Arial";
      context.fillText(cursorName, cursorX + 20, cursorY + 20);
    });
  });
}

// removes no longer in use nodes once the page exits or reloads
window.addEventListener("beforeunload", () => {
  remove(childNodeRef);
  remove(userReactRef);
});