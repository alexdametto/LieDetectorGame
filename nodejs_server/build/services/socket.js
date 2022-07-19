"use strict";
var socket;
var SocketService = /** @class */ (function () {
    function SocketService(io) {
        this.io = io;
        this.sockets = {};
    }
    SocketService.setSocket = function (socket_) {
        socket = socket_;
    };
    SocketService.getSockets = function () {
        return socket;
    };
    SocketService.prototype.createSocket = function (userID, socket) {
        this.sockets[userID] = socket;
    };
    SocketService.prototype.deleteSocket = function (userID, socketID) {
        if (this.sockets[userID] && this.sockets[userID].id === socketID) {
            delete this.sockets[userID];
        }
    };
    SocketService.prototype.checkIfExist = function (userID) {
        return this.getSocket(userID) !== undefined;
    };
    SocketService.prototype.getSocket = function (userID) {
        return this.sockets[userID];
    };
    Object.defineProperty(SocketService.prototype, "USER_OFFLINE", {
        // sendBroadcast(event, data) {
        //     this.io.emit(event, data);
        // }
        // sendTo(userID, event, data){
        //     // console.log("UserId:", userID, "event:", event,"data", data);
        //     if(this.checkIfExist(userID)){
        //         this.getSocket(userID).emit(event, data);
        //     }
        // }
        // async disconnect(userID: string){
        //     try{
        //         const room_ = await room.getModel().findOneAndDelete({host_id: userID});
        //         if (room_) {
        //             this.sendBroadcast(this.ROOM_DELETE, {
        //                 _id: room_._id,
        //                 host_id: userID
        //             });
        //         }
        //         else{
        //             const game_ = await game.getModel().findOne({ $or: [{ 'player1_id': userID }, { 'player2_id': userID}]}).exec();
        //             if(game_){
        //                 let player1= game_.isPlayerOne(userID);
        //                 game_.surrend(player1?1:2);
        //                 this.sendTo(player1?game_.player2_id:game_.player1_id, this.GAME_SURRENDER, { });
        //             }
        //         }   
        //     }catch(e){
        //     }         
        // }
        get: function () { return 'user-offline'; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SocketService.prototype, "USER_ONLINE", {
        get: function () { return 'user-online'; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SocketService.prototype, "USER_DELETE", {
        get: function () { return 'user-delete'; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SocketService.prototype, "ROOM", {
        get: function () { return 'room'; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SocketService.prototype, "ROOM_DELETE", {
        get: function () { return 'delete-room'; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SocketService.prototype, "GAME", {
        get: function () { return 'game'; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SocketService.prototype, "GAME_START", {
        get: function () { return 'start-game'; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SocketService.prototype, "GAME_MOVE", {
        get: function () { return 'game-move'; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SocketService.prototype, "GAME_SURRENDER", {
        get: function () { return 'surrend'; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SocketService.prototype, "MESSAGE", {
        get: function () { return 'message'; },
        enumerable: false,
        configurable: true
    });
    return SocketService;
}());
module.exports = SocketService;
