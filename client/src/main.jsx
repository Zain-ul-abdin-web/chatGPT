import bot from "../assets/bot.svg";
import user from "../assets/user.svg"

let form = document.querySelector("form")
let chatContainer = document.querySelector("#chat_container");
let loadInterval;
function loader(elm){
  elm.textContent = "";
  loadInterval = setInterval(()=>{
    elm.textContent += ".";
    if(elm.textContent.length == 4){
      elm.textContent = ""
    }
  },300)
};
function typeText(elm,text){
  let index = 0;
  let interval = setInterval(()=>{
    console.log(text)
    if(index < text.length){
      elm.innerHTML += text.charAt(index)
      index++;
    }else{
      clearInterval(interval);
    }
  },20)
}
function generateUniqueId(){
  const id = Date.now()
  const random = Math.random();
  const hexaDecimal = random.toString(16)
  return `id-${id}-${hexaDecimal}`
}
function chatStrip(isAi,value,id){
  return (
    `
      <div class="wrapper ${isAi && "ai"} ">
        <div class="chat">
          <div class="profile">
            <img src="${isAi?bot:user}" 
              alt="${isAi?'bot':'user'}" />
          </div>
          <div class="message" id="${id}">${value}</div>
        </div>
      </div>
    `
  )
}
const handleSubmit = async(e)=>{
  e.preventDefault();
  const data = new FormData(form);
  // users chatstripe
  chatContainer.innerHTML += chatStrip(false,data.get("prompt"),generateUniqueId());
  form.reset();
  // bot chatstrip
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStrip(true,"",uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);
  // fetch data from server
  let responce = await fetch("http://localhost:5000",{
    method: "POST",
    headers:{
      "Content-Type": "application/json"
    },
    body:JSON.stringify({
      prompt: data.get("prompt")
    })
  })
  clearInterval(loadInterval);
  messageDiv.innerHTML = "";
  if(responce.ok){
    const data = await responce.json();
    const parseData = data.bot.trim();
    typeText(messageDiv,parseData)
  }else{
    const err = await responce.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err)
  }
}
form.addEventListener("submit",handleSubmit)
form.addEventListener("keyup",(e)=>{
  if(e.keyCode === 13){
    handleSubmit(e)
  }
})