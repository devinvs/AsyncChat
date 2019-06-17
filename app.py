import asyncio
import tornado.escape
import tornado.ioloop
import tornado.locks
import tornado.web
import tornado.httpserver
import tornado.websocket
import os.path
import uuid
import json
import random
import string

class Application(tornado.web.Application):

    def __init__(self):
        handlers = [
            (r'/', MainHandler),
            (r'/chatsocket', ChatSocketHandler)
        ]
        settings = dict(
            cookie_secret="TODO_GENERATE_COOKIE_SECRET",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=True,
            default_handler_class=NotFoundHandler
        )
        super(Application, self).__init__(handlers, **settings)

class ChatRoom():
    def __init__(self, id):
        self.id = id
        self.host_id = 0
        self.cache = []
        self.users = {}
        self.listeners = set()
        self.locked=False

    def addUser(self, listener):
        self.addMessage("sys", "", "{} Joined the Chat".format(listener.user_name))
        self.listeners.add(listener)
        self.users[listener.user_id] = listener.user_name

    def delUser(self, listener):
        self.listeners.remove(listener)
        self.users.pop(listener.user_id)

    def addMessage(self, msgClass, sender, message):
        self.cache.append((msgClass, sender, message))
        message = json.dumps([[msgClass, sender, message]])
        for listener in self.listeners:
            listener.write_message(message)

    def lock(self, user_id):
        if user_id == self.host_id and not self.locked:
            self.locked = True
            self.addMessage("sys", "", "Chat Locked")

    def unlock(self, user_id):
        if user_id == self.host_id and self.locked:
            self.locked = False
            self.addMessage("sys", "", "Chat Unlocked")

chats = {}

def newChatString():
    letters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(letters) for i in range(4))


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        if not self.get_secure_cookie("user_id"):
            self.set_secure_cookie("user_id", str(uuid.uuid4()))
        self.render("index.html", error='')

    def post(self):
        name = self.get_body_argument("name")
        self.set_secure_cookie("user_name", str(name))
        print(name, "logged on")

        if len(self.get_body_argument("chat_id")) != 4:
            chat_id = newChatString()
        else:
            chat_id = self.get_body_argument("chat_id").upper()

        if chat_id in chats.keys() and chats[chat_id].locked:
            self.render('index.html', error="The chat you tried to access was locked")
        else:
            self.set_secure_cookie("chat_id", chat_id)
            self.render("chat.html", chat_id=chat_id, is_host=self.get_body_argument("newChat"))


class NotFoundHandler(tornado.web.RequestHandler):
    def get(self):
        self.redirect('/')

class ChatSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        self.chat_id = self.get_secure_cookie("chat_id").decode('utf-8')
        self.user_id = self.get_secure_cookie("user_id")
        self.user_name = self.get_secure_cookie("user_name").decode('utf-8')

        if self.chat_id not in chats:
            chats[self.chat_id] = ChatRoom(self.chat_id)
            chats[self.chat_id].host_id = self.user_id
            print("chat {} opened".format(self.chat_id))

        chats[self.chat_id].addUser(self)
        if len(chats[self.chat_id].cache) > 0:
            self.write_message(tornado.escape.json_encode(chats[self.chat_id].cache))

    def on_message(self, message):
        if message.split('|')[0] == "SYS":
            command = message.split('|')[1]

            if command == "LOCK":
                chats[self.chat_id].lock(self.user_id)
            elif command == "UNLOCK":
                chats[self.chat_id].unlock(self.user_id)
        else:
            chats[self.chat_id].addMessage("msg", self.user_name, message)

    def on_close(self):
        chats[self.chat_id].delUser(self)

        if len(chats[self.chat_id].users) == 0:
            chats.pop(self.chat_id)
            print("chat {} closed".format(self.chat_id))
        else:
            chats[self.chat_id].addMessage("sys", '', "{} Left the Chat".format(self.user_name))

if __name__ == '__main__':
    application = Application()
    application.listen(8888)
    tornado.ioloop.IOLoop.current().start()