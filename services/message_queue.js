var amqp = require("amqplib/callback_api");

var amqpConn = null;
var queue = "Store";
const user = "freshshop";
const pass = "udpt17";
const host = "localhost";
const port = "5672";
// const url =
//   "amqps://ozhdnxuq:gBX-R3l9VhWzxyvVrqpoZ1jJiUh1WKMG@gerbil.rmq.cloudamqp.com/ozhdnxuq";
var pubChannel = null;
var offlinePubQueue = [];

exports.start = function start() {
  amqp.connect(
    `amqp://${user}:${pass}@${host}:${port}/` + "?heartbeat=60",
    function (err, conn) {
      if (err) {
        console.error("[AMQP]", err.message);
        return setTimeout(start, 100);
      }

      conn.on("error", function (err) {
        if (err.message !== "Connection closing") {
          console.error("[AMQP] con err", err.stackAtStateChange);
        }
      });

      conn.on("close", function () {
        console.error("[AMQP] reconnecting");
      });

      console.log("[AMQP] connected");
      amqpConn = conn;
      whenConnected();
    }
  );
};

function whenConnected() {
  startPublisher();
  startSubscriber();
}

function startPublisher() {
  amqpConn.createConfirmChannel(function (err, channel) {
    if (closeOnErr(err)) return;

    channel.on("error", function (err) {
      console.log("[AMQP] channel error", err.message);
    });

    channel.on("close", function () {
      console.log("[AMQP] channel close");
    });

    pubChannel = channel;
    while (true) {
      var m = offlinePubQueue.shift();
      if (!m) break;

      publish(m[0], m[1], m[2]);
    }
  });
}

function publish(exchange, routingKey, content) {
  try {
    pubChannel.publish(
      exchange,
      routingKey,
      content,
      { persistent: true },
      function (err, ok) {
        if (err) {
          console.error("[AMQP] pushlish", err);
          offlinePubQueue.push([exchange, routingKey, content]);
          pubChannel.connect.close();
        }
      }
    );
  } catch (e) {
    console.error("[AMQP] publish", e.message);
    offlinePubQueue.push([exchange, routingKey, content]);
  }
}

function startSubscriber() {
  var ch;
  amqpConn.createChannel(function (err, channel) {
    if (closeOnErr(err)) return;
    channel.on("error", function (err) {
      console.error("[AMQP] channel eror", err.message);
    });

    channel.on("close", function () {
      console.error("[AMQP] channel closed");
    });

    ch = channel;
    channel.prefetch(10);
    channel.assertQueue(queue, { durable: true }, function (err, _ok) {
      if (closeOnErr(err)) return;
      channel.consume(
        queue,
        function (msg) {
          work(msg, function (ok) {
            try {
              if (ok) {
                channel.ack(msg);
              } else channel.reject(msg, true);
            } catch (e) {
              closeOnErr(e);
            }
          });
        },
        { noAck: false }
      );

      console.log("Subscriber is started");
    });
  });
}

function work(msg, cb) {
  console.log("Got msg", msg.content.toString());
  cb(true);
}

function closeOnErr(err) {
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
}

// setInterval(function () {
//   publish("", queue, Buffer.from("gay"));
// }, 5000);
