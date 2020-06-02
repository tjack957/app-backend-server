DROP TABLE IF EXISTS ChatActive;
CREATE TABLE ChatActive (ChatID INT NOT NULL,
                          ActiveId INT NOT NULL,
                          FOREIGN KEY(ChatID) REFERENCES Chats(ChatID)
);

