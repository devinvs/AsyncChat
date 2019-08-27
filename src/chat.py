import json
from typing import List, Dict

class User():

    def __init__(self, name:str, listener, public_key:str, role:str="member"):
        self.name = name
        self.listener = listener
        self.public_key = public_key
        self.role = role

    def to_json(self):
        return {
            "name": self.name,
            "public_key": self.public_key,
            "role": self.role
        }


class Message():

    def __init__(self, type:int, sender:User, recipients:List[User], content):
        self.type = type #0:Connect 1:Add User 2:System Message 3:User Message 4:Command 5: Leave
        self.sender = sender
        self.recipients = recipients
        self.content = content

    def send(self):
        message = json.dumps({
                "type":self.type,
                "sender":self.sender.name,
                "content":self.content
            })
        for user in self.recipients:
            user.listener.write_message(message)


class ChatRoom():

    def __init__(self):

        self.users:Dict[User] = {}
        self.sys = User("System", None, "")
        
        self.commands = {
            "lock": self.lock,
            "unlock": self.unlock,
            "test": self.test
        }

        self.locked = False

    def add_user(self, user:User):
        # send user to current users
        recipients = [x for x in self.users.values()]
        Message(1, self.sys, recipients, user.to_json()).send()
        Message(2, self.sys, recipients, user.name + " joined the Chat").send()
        

        # send list of users to new user
        for chat_user in self.users.values():
            msg = Message(1, chat_user, [user], chat_user.to_json())
            msg.send()

        # add user
        self.users[user.name] = user

    def del_user(self, name:str):

        recipients = [x for x in self.users.values() if x.name != name]
        Message(5, self.sys, recipients, self.users[name].to_json()).send()
        Message(2, self.sys, recipients, name + " left the Chat").send()

        try:
            self.users.pop(name)
        except KeyError as e:
            print(e)

    def user_exists(self, user:User) -> bool:
        return user.name in self.users

    def new_message(self, msg:dict):

        try:
            recip = []
            recip_names = msg["recipients"].split(',')

            for name in msg["recipients"].split(','):
                try:
                    recip.append(self.users[name])
                except KeyError as e:
                    print(e)
            Message(3, self.users[msg["sender"]], recip, msg["content"]).send()
        except Exception as e:
            print(e)

    def run_command(self, command:str, user:str):
        try:
            cmd = command.split(' ')[0]
            function = self.commands[cmd]
            function(self.users[user])
        except Exception as e:
            print(e)

    def lock(self, user:User):
        if user.role == "host" and not self.locked:
            self.locked = True
            recipients = [x for x in self.users.values()]
            msg = Message(2, self.sys, recipients, "Chat Locked")
            msg.send()

    def unlock(self, user:User):
        if user.role == "host" and self.locked:
            self.locked = False
            recipients = [x for x in self.users.values()]
            msg = Message(2, self.sys, recipients, "Chat Unlocked")
            msg.send()

    def test(self, user:User):
        print("This is a test")