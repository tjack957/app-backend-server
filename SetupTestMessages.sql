--Remove all memebers from all chats
DELETE FROM ChatMembers;

--Remove all messages from all chats
DELETE FROM Messages;

--Remove all chats
DELETE FROM Chats;

--Create Global Chat room, ChatId 1
INSERT INTO
    chats(chatid, name)
VALUES
    (1, 'Global Chat')
RETURNING *;

--Add the three test users to Global Chat
INSERT INTO 
    ChatMembers(ChatId, MemberId)
SELECT 1, Members.MemberId
FROM Members
WHERE Members.Email='tjack957@hotmail.com'
    OR Members.Email='gobindroopmann@gmail.com'
    OR Members.Email='flym@uw.edu'
RETURNING *;

--Add Multiple messages to create a conversation
INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    1, 
    'Hello Everyone! Welcome to Global Chat!',
    Members.MemberId
FROM Members
WHERE Members.Email='tjack957@hotmail.com'
RETURNING *;

