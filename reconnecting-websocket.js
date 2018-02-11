var ReconnectingWebSocket = (function () {
    function ReconnectingWebSocket(url, protocols) {
        if (typeof protocols === "undefined") { protocols = []; }
        this.debug = false;
        this.reconnectInterval = 1000;
        this.timeoutInterval = 2000;
        this.forcedClose = false;
        this.timedOut = false;
        this.protocols = [];
        this.onopen = function (event) {
        };
        this.onclose = function (event) {
        };
        this.onconnecting = function () {
        };
        this.onmessage = function (event) {
        };
        this.onerror = function (event) {
        };
        this.url = url;
        this.protocols = protocols;
        this.readyState = WebSocket.CONNECTING;
        this.connect(false);
    }
    ReconnectingWebSocket.prototype.connect = function (reconnectAttempt) {
        var _this = this;
        this.ws = new WebSocket(this.url, this.protocols);

        this.onconnecting();
        this.log('ReconnectingWebSocket', 'attempt-connect', this.url);

        var localWs = this.ws;
        var timeout = setTimeout(function () {
            _this.log('ReconnectingWebSocket', 'connection-timeout', _this.url);
            _this.timedOut = true;
            localWs.close();
            _this.timedOut = false;
        }, this.timeoutInterval);

        this.ws.onopen = function (event) {
            clearTimeout(timeout);
            _this.log('ReconnectingWebSocket', 'onopen', _this.url);
            _this.readyState = WebSocket.OPEN;
            reconnectAttempt = false;
            _this.onopen(event);
        };

        this.ws.onclose = function (event) {
            clearTimeout(timeout);
            _this.ws = null;
            if (_this.forcedClose) {
                _this.readyState = WebSocket.CLOSED;
                _this.onclose(event);
            } else {
                _this.readyState = WebSocket.CONNECTING;
                _this.onconnecting();
                if (!reconnectAttempt && !_this.timedOut) {
                    _this.log('ReconnectingWebSocket', 'onclose', _this.url);
                    _this.onclose(event);
                }
                setTimeout(function () {
                    _this.connect(true);
                }, _this.reconnectInterval);
            }
        };
        this.ws.onmessage = function (event) {
            _this.log('ReconnectingWebSocket', 'onmessage', _this.url, event.data);
            _this.onmessage(event);
        };
        this.ws.onerror = function (event) {
            _this.log('ReconnectingWebSocket', 'onerror', _this.url, event);
            _this.onerror(event);
        };
    };

    ReconnectingWebSocket.prototype.send = function (data) {
        if (this.ws) {
            this.log('ReconnectingWebSocket', 'send', this.url, data);
            return this.ws.send(data);
        } else {
            throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
        }
    };

    ReconnectingWebSocket.prototype.close = function () {
        if (this.ws) {
            this.forcedClose = true;
            this.ws.close();
            return true;
        }
        return false;
    };

    ReconnectingWebSocket.prototype.refresh = function () {
        if (this.ws) {
            this.ws.close();
            return true;
        }
        return false;
    };

    ReconnectingWebSocket.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
        if (this.debug || ReconnectingWebSocket.debugAll) {
            console.debug.apply(console, args);
        }
    };
    ReconnectingWebSocket.debugAll = false;
    return ReconnectingWebSocket;
})();

module.exports = ReconnectingWebSocket;
//# sourceMappingURL=reconnecting-websocket.js.map
