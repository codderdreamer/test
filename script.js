const { ipcRenderer } = require('electron');

let CPID = null
let MODEL = null
let WIFIMAC = null
let ETHMAC = null
let G4IMEI = null

class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.websocket = null;
        this.connect();
    }

    connect() {
        this.websocket = new WebSocket(this.url);

        this.websocket.onopen = (event) => {
            console.log("WebSocket bağlantısı kuruldu.");
            document.getElementsByClassName('connect').item(0).innerText = "Bağlı"
            document.getElementsByClassName('connect')[0].style.color = '#71ff54';
        };

        this.websocket.onmessage = (event) => {
            const message = JSON.parse(event.data); 
            const command = message.Command;
            const data = message.Data;
            console.log("Mesaj alındı:", message);
            if (command === "Model") {
                if (data == false){
                    ipcRenderer.send('show-alert', 'Model Bulunamadı!');
                }
                else{
                    document.getElementById("send").remove()
                    addDivContent("Model Bulundu. Cihaza kayıt ediliyor...",true)
                    CPID = document.getElementById('chargePointIdInput').value
                    MODEL = document.getElementById('modelInput').value
                }
            }
            else if(command == "ModelReturn"){
                if (data == false){
                    ipcRenderer.send('show-alert', 'Bir sorun oluştu!');
                }
                else{
                    addDivContent("Model cihaza kayıt edildi.",true)
                    addDivContent("Charge point id cihaza kayıt edildi.",true)
                    const message = {
                        "Command" : "WifiMacReq",
                        "Data" : {}
                    }
                    wsClient.sendMessage(message)
                }
                
            }
            else if(command == "WifiMacResult"){
                if (data == ""){
                    addDivContent("Wifi mac adresi alınamadı bir sorun oluştu!",false)
                }
                else{
                    addDivContent("Wifi mac adresi alındı: " + data, true)
                    WIFIMAC = data
                    const message = {
                        "Command" : "EthMacReq",
                        "Data" : {}
                    }
                    wsClient.sendMessage(message)
                }
            }
            else if(command == "EthMacResult"){
                if (data == ""){
                    addDivContent("Eth mac adresi alınamadı bir sorun oluştu!",false)
                }
                else{
                    addDivContent("Eth mac adresi alındı: " + data, true)
                    ETHMAC = data
                    const message = {
                        "Command" : "Reset",
                        "Data" : {}
                    }
                    wsClient.sendMessage(message)
                    addDivContent("Sistem yeniden başlatılıyor. Bluetooth adresi charge point id ile kayıt olacak", true)
                    addBluetoothControl()
                }
            }
            else if(command == "4gImeiResult"){
                if(data==""){
                    addDivContent("4g imei adresi alınamadı bir sorun oluştu!", false)
                }
                else if(data=="Not"){
                    addDivContent("4g modulsüz cihaz olduğu için imei adresi alınmayacak.", true)
                }
                else{
                    addDivContent("4g imei adresi alındı: " + data, true)
                }
            }
        };

        this.websocket.onclose = (event) => {
            console.log("WebSocket bağlantısı kapatıldı. Yeniden bağlanıyor...");
            document.getElementsByClassName('connect').item(0).innerText = "Bağlı değil"
            document.getElementsByClassName('connect')[0].style.color = 'red';
            setTimeout(() => {
                this.connect();
            }, 1000); // 1 saniye bekleyerek yeniden bağlanmayı dener
        };

        this.websocket.onerror = (event) => {
            console.error("WebSocket hatası:", event);
            this.websocket.close(); // Bağlantıyı kapatır ve onclose olayını tetikler
        };
    }

    sendMessage(message) {
        if (this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
            console.log("Mesaj gönderildi:", message);
        } else {
            console.log("Bağlantı açık değil. Mesaj gönderilemedi.");
        }
    }
}

function addHeader(){
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('headerDiv');

    const header = document.createElement('div');
    header.classList.add('header');
    header.innerText = "Hera Charge Test Uygulması"

    const connect = document.createElement('div')
    connect.classList.add('connect');
    connect.innerText = "Bağlı değil!"

    headerDiv.appendChild(header)
    headerDiv.appendChild(connect)

    document.getElementById('content').appendChild(headerDiv)
}


function addModel(){
    const model = document.createElement('div');
    model.classList.add('model')
    const modelText = document.createElement('div');
    modelText.classList.add('modelText')
    modelText.innerText = "Lütfen cihaz için model barkodunu okutunuz :"
    model.appendChild(modelText);
    const modelInput = document.createElement('input');
    modelInput.classList.add("modelInput")
    modelInput.id = "modelInput"
    model.appendChild(modelInput)
    document.getElementById('content').appendChild(model)
}

function addChargePointId(){
    const chargePointId = document.createElement('div');
    chargePointId.classList.add('model')
    const modelText = document.createElement('div');
    modelText.classList.add('modelText')
    modelText.innerText = "Lütfen cihaz için Charge Point Id barkodunu okutunuz :"
    chargePointId.appendChild(modelText);
    const modelInput = document.createElement('input');
    modelInput.classList.add("modelInput")
    modelInput.id = "chargePointIdInput"
    chargePointId.appendChild(modelInput)
    document.getElementById('content').appendChild(chargePointId)
}

function addBluetoothControl(){
    const div = document.createElement('div');
    div.classList.add('divContent')
    div.innerText = "Cihaz bağlanana kadar bekleyiniz..."
    document.getElementById('content').appendChild(div)
    const div1 = document.createElement('div');
    div1.classList.add('divContent')
    div1.innerText = "Telefonda cihazın bluetooth adı gözüküyor mu? Eski ismi ile gözükür. Bağlandıktan sonra yeni ismi gözükür."
    document.getElementById('content').appendChild(div1)
    const send = document.createElement('button');
    send.classList.add('sendButton')
    send.id = "send"
    send.innerText = "Onayla"
    
    send.addEventListener('click', () => {
        const message = {
            "Command" : "RelayOn",
            "Data" : {}
        }
        wsClient.sendMessage(message)
        send.remove()
    });
    document.getElementById('content').appendChild(send)
    
    
    
}

function send(){
    const send = document.createElement('button');
    send.classList.add('sendButton')
    send.id = "send"
    send.innerText = "Gönder"
    
    send.addEventListener('click', () => {
        const modelInput = document.getElementById('modelInput')
        const chargePointIdInput = document.getElementById('chargePointIdInput')
        console.log(modelInput.value)
        if (modelInput.value == "" || chargePointIdInput.value == ""){
            ipcRenderer.send('show-alert', 'Lütfen boş bırakmayınız!');
        }
        else{
            const message = {
                "Command" : "Barkod",
                "Data" : {
                    "model" : modelInput.value,
                    "chargePointId" : chargePointIdInput.value
                }
    
            }
            wsClient.sendMessage(message)
        }
    });
    document.getElementById('content').appendChild(send)
}

function addDivContent(content,value){
    const div = document.createElement('div');
    div.classList.add('divContent')
    const divText = document.createElement('div');
    divText.classList.add('divText')
    divText.innerText = content
    div.appendChild(divText)
    if (value == true){
        const image = document.createElement('img');
        image.src = "true.png"
        image.width = 40; // Genişlik (isteğe bağlı)
        image.height = 40; // Yükseklik (isteğe bağlı)
        image.classList.add('slide-in');
        div.appendChild(image)
    }
    else{
        const image = document.createElement('img');
        image.src = "red.png"
        image.width = 40; // Genişlik (isteğe bağlı)
        image.height = 40; // Yükseklik (isteğe bağlı)
        image.classList.add('slide-in');
        div.appendChild(image)
    }
    
    document.getElementById('content').appendChild(div)
}

const wsClient = new WebSocketClient('ws://192.168.1.201:9000');

addHeader()
addModel()
addChargePointId()
send()