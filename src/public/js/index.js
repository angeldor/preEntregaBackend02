const socket = io()
let user
let chatBox = document.getElementById('chatBox')

//mensajes
Swal.fire({
    title:'Escribe un nombre de usuario',
    input: 'text',
    text: 'Ingresa tu usuario para identificarte en el chat',
    inputValidator: (value) =>{
        return !value && 'Necesitas escribir un nombre de ususario para continuar'
    },
    allowOutsideClick: false
}).then(result =>{
    user = result.value
    console.log(user)
    socket.emit('login', user)
})

chatBox.addEventListener('keyup', evento =>{
    if(evento.key === 'Enter') {
        if(chatBox.value.trim().length > 0) {
            socket.emit('message', {user, message: chatBox.value})
            chatBox.value = ''
        }
    }
})

socket.on('messageLogs', data =>{
    let log = document.getElementById('messageLogs')
    let messages = ''
    data.forEach(message =>{
        messages = messages + `${message.user} dice: ${message.message} <br>`
    })
    log.innerHTML = messages
})

socket.on('register', data =>{
    console.log(data)
    Swal.fire({
        title: 'Se registro un nuevo usuario',
        text: `El nombre del usuario es ${data}`,
        icon: 'success',
        toast: true
    })
})

//
