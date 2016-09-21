/////////////////////////////////////////////////////////////////////
var util         = require('util');
var net          = require('net');
var tls          = require('tls');
var EventEmitter = require('eventemitter3');
var stream       = require('stream');

var Duplex       = stream.Duplex;
module.exports   = TcpProxy;
util.inherits(TcpProxy, EventEmitter);

/////////////////////////////////////////////////////////////////////
function TcpProxy (options) 
{
    EventEmitter.call(this);
    if (!(this instanceof TcpProxy)) { 
        return new TcpProxy(options) 
    }
    this.options = options;
};

TcpProxy.prototype.proxy = function (socket, options ) 
{
    this.socket = socket;

    if( options ){
        options.target = options.target || this.options.target;
    }
    else{
        var options = this.options;
    }

    this.proxySock = options.ssl ? 
                  tls.connect(options.ssl, options.target): net.connect(options.target);
                  
    console.log('client cennented,ip: ',socket.remoteAddress + ':' + socket.remotePort);
    if( options.timeout ){
        socket.setTimeout(options.timeout);
    }
    else{
        socket.setTimeout(240000);  
    }
        
    this.proxySock.on('error', this.emit.bind(this, 'error'));
    this.socket.on('error', this.emit.bind(this, 'error'));
    this.socket.on('timeout', this.emit.bind(this, 'timeout'));
    this.socket.on('timeout',function(){
        socket.end();
    });
    this.socket.on('close',function(){
        console.log('client discennent,ip: ',socket.remoteAddress + ':' + socket.remotePort);
        socket.end();
    });
    
    this.proxySock.pipe(this.socket).pipe(this.proxySock);
};
