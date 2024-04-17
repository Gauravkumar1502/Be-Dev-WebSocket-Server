// const io = require('socket.io')(3000, {
//     cors: {
//         origin: '*',
//     }
// });
// // define a object type
// question = {
//     id : 0,
//     title : '',
//     difficulty : '',
//     tags : '',
//     companies : '',
//     description : '',
//     constraints : '',
//     javaBoilerplateCode : '',
//     c11BoilerplateCode : '',
//     cppBoilerplateCode : '',
//     pythonBoilerplateCode : '',
//     defaultInputs : '',
//     javaCode : '',
//     createdAt : '',
//     updatedAt : '',
//     extraInfo : '',
//     hints : [],
//     examples : []
// };

// console.log('Server is up and running on port 3000');

// // create a set of available users
// const availableUsers = new Set();

// // create a map to store the roomID mapped to class Game
// const games = new Map();

// io.on('connection', socket => {
//     // console.log('New user with id: ' + socket.id);
//     availableUsers.add(socket);
//     console.log('Available users: ' + availableUsers.size);
    
//     if (availableUsers.size >= 2) {
//         // create a new room for the current user and the first available user
//         // and remove them from the available users set
//         const currentUser = socket;
//         console.log('Current user: ' + currentUser.id);
//         availableUsers.delete(currentUser);
//         console.log('Available users after removing current user: ' + availableUsers.size);
//         const firstAvailableUser = availableUsers.values().next().value;
//         console.log('First available user: ' + firstAvailableUser.id);
//         availableUsers.delete(firstAvailableUser);
//         console.log('Available users after removing first available user: ' + availableUsers.size);
//         const room = currentUser.id + '_' + firstAvailableUser.id;
//         console.log('Room: ' + room);
//         socket.join(room);
//         firstAvailableUser.join(room);
//         const question = getRandomQuestion();
//         const answer = eval(question);
//         console.log('Question: ' + question);
//         console.log('Answer: ' + answer);
//         io.to(room).emit('start-game', question, room);
//         // store the question and the answer for the current room
//         const game = new Game(currentUser.id, firstAvailableUser.id, question, answer);
//         games.set(room, game);
//     }else{
//         socket.emit('wait-for-user', 'Waiting for another user to join...');
//     }


//     socket.on('send-message', message => {
//         console.log(message);
//         socket.broadcast.emit('broadcast-message', message);
//     });

//     socket.on('send-answer', (answer, room) => {
//         console.log('User with id: ' + socket.id + ' sent answer: ' + answer + ' for room: ' + room);
//         const game = games.get(room);
//         console.log('Game: ' + game.toString());
//         if (answer == game.answer) {
//             console.log('Correct answer');
//             sendMessageToUser(socket.id, 'Correct answer - You won');
//             if (socket.id == game.socket1ID) {
//                 console.log('Inside if');
//                 sendMessageToUser(game.socket2ID, 'Opponent won');
//             }else{
//                 console.log('Inside else');
//                 sendMessageToUser(game.socket1ID, 'Opponent won');
//             }
            
//         }else{
//             console.log('Wrong answer');
//             sendMessageToUser(socket.id, 'Wrong answer');
//         }
//     });

//     socket.on('disconnect', () => {
//         console.log('User with id: ' + socket.id + ' disconnected');
//         availableUsers.delete(socket);
//         console.log('Available users after dlt: ' + availableUsers.size);
//     });
// });

// // function to snd message to specific user
// function sendMessageToUser(socketID, message) {
//     io.to(socketID).emit('private-message', message);
// }

// function getRandomQuestion() {
//     const firstNumber = Math.floor(Math.random() * 10);
//     const secondNumber = Math.floor(Math.random() * 10);
//     const operator = ['+', '-', '*', '/', '%'][Math.floor(Math.random() * 5)]
//     return `${firstNumber} ${operator} ${secondNumber}`;
// }

// // create a class to store list of 2 sockets and the question and the answer
// class Game {
//     constructor(socket1ID, socket2ID, question, answer) {
//         this.socket1ID = socket1ID;
//         this.socket2ID = socket2ID;
//         this.question = question;
//         this.answer = answer;
//     }
//     toString() {
//         return `socket1ID: ${this.socket1ID}, socket2ID: ${this.socket2ID}, question: ${this.question}, answer: ${this.answer}`;
//     }
// }


const io = require('socket.io')(3000, {
    cors: {
        origin: '*',
    }
});
console.log('Server is up and running on port 3000');

const availableUsers = new Set();
// map of user socket id to
const MAX_QUESTIONS = 2;

io.on('connection', socket => {
    console.log('New user with id: ' + socket.id);
    // Add the user to the set of available users
    availableUsers.add(socket);
    console.log('Available users after adding: ' + availableUsersToString());

    if (availableUsers.size >= 2) {
        // Create a new room for the current user and the first available user
        // and remove them from the available users set
        const currentUser = socket;
        console.log('Current user: ' + currentUser.id);
        availableUsers.delete(currentUser);
        console.log('Available users after removing current user: ' + availableUsersToString());
        const firstAvailableUser = availableUsers.values().next().value;
        console.log('First available user: ' + firstAvailableUser.id);
        availableUsers.delete(firstAvailableUser);
        console.log('Available users after removing first available user: ' + availableUsersToString());
        const room = currentUser.id + '_' + firstAvailableUser.id;
        console.log('Room: ' + room);
        socket.join(room);
        firstAvailableUser.join(room);
        // random value can not be zero
        sendMessageToRoom("assign-question-id",room, Math.floor(Math.random() * MAX_QUESTIONS + 1));
    }
    // Handle messages from clients
    socket.on('message', message => {
        console.log('Message: ' + message);
        socket.broadcast.emit('broadcast-message', message);
    });
    
    // Handle disconnection of clients
    socket.on('disconnect', () => {
        console.log('User with id: ' + socket.id + ' disconnected');
        // Remove the user from the set of available users
        availableUsers.delete(socket);
        console.log('Available users after dlt: ' + availableUsersToString());
    });
});

// function to send message to specific user
function sendMessageToUser(event, socketID, message) {
    io.to(socketID).emit(event, message);
}

// function to send message to a room
function sendMessageToRoom(event, room, message) {
    io.to(room).emit(event, message);
}
// function to send message to a room except the sender also takes the event name
function sendMessageToRoomExceptSender(event, room, message) {
    socket.to(room).emit(event, message);
}


// function to convert the set of available users to string
function availableUsersToString(){
    let str = '';
    availableUsers.forEach(user => str += user.id + ', ');
    return str;
} 