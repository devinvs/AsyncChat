import os
import tornado
import tornado.web
import tornado.websocket
import chat
import json
import string
import random


chats = {}

def newChatString():
    letters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(letters) for i in range(4))

class Application(tornado.web.Application):

    def __init__(self):
        handlers = [
            (r'/', MainHandler),
            (r'/chatsocket', ChatSocketHandler)
        ]
        settings = dict(
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            cookie_secret="TODO_GENERATE_COOKIE_SECRET",
            xsrf_cookies=True
        )
        super(Application, self).__init__(handlers, **settings)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("./index.html")



class ChatSocketHandler(tornado.websocket.WebSocketHandler):

    def on_message(self, message):
        try:
            message = json.loads(message)
            type = message["type"]

            if type == 0:
                # chats[self.chat_id].new_message(message)
                content = message["content"]
                name = content["name"]
                new_chat = bool(content["newChat"])
                chat_id = newChatString() if new_chat else content["chatid"].upper()

                temp_user = chat.User(name, self, "")
                temp_sys = chat.User("SYS", None, "")

                response = {}

                if new_chat and (chat_id in chats):
                    response["message"] = "Chat already exists"
                    chat.Message(0, temp_sys, [temp_user], response).send()
                elif not new_chat and chat_id not in chats:
                    response["message"] = "Chat Does Not Exist"
                    chat.Message(0, temp_sys, [temp_user], response).send()
                elif not new_chat and chats[chat_id].user_exists(temp_user):
                    response['message'] = "Username taken in the chat"
                    chat.Message(0, temp_sys, [temp_user], response).send()
                elif not new_chat and chats[chat_id].locked:
                    response['message'] = "Chat is locked"
                    chat.Message(0, temp_sys, [temp_user], response).send()
                else:
                    self.name = name
                    self.chat_id = chat_id

                    if new_chat:
                        chats[self.chat_id] = chat.ChatRoom()

                    # Else chat id is already valid and the chat exists, the user will be added in the next step

                    response['message'] = "Success"
                    response['name'] = self.name
                    response['chatid'] = self.chat_id
                    chat.Message(0, temp_sys, [temp_user], response).send()

            elif self.chat_id in chats:
                if type == 1:
                    user_dict = message["content"]
                    role = "host" if len(chats[self.chat_id].users) == 0 else "member"
                    user = chat.User(user_dict["name"], self, user_dict["public_key"], role=role)
                    chats[self.chat_id].add_user(user)
                elif type == 2: # User can't send system messages
                    pass
                elif type == 3:
                    chats[self.chat_id].new_message(message)
                elif type == 4:
                    chats[self.chat_id].run_command(message["content"], message["sender"])

        except Exception as e:
            print(e)

    def check_origin(self, origin):
        return True


if __name__ == '__main__':
    application = Application()
    application.listen(8000)
    tornado.ioloop.IOLoop.current().start()
    