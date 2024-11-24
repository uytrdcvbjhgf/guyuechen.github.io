+++
title = 'Design Whatsapp'
date = 2024-11-24T21:37:18+08:00
categories = ["system-design"]
tags = ["system-design"]
+++

Design a system like **Whatsapp** with the following features:

1. Send a **message** to a user.
2. Create a **group** with some initial users.
3. Add more users to a group.
4. Send a message to a group.
5. Get messages for a user.

Implement the `WhatsApp` class:

- `WhatsApp()` Initializes the object.
- `void sendMessage(int toUser, String message)` Sends a personal message with the text `message` to the user with id: `toUser`.
- `int createGroup(int[] initialUsers)` Creates a new group that initially contains users whose ids are in the list `initialUsers`, and the group id is returned. For each group created, increment the ids **sequentially**. For the first group to be created `id = 1`, for the second group `id = 2`, and so on.
- `void addUserToGroup(int groupId, int userId)` Adds the user with id: `userId` to the group with id: `groupId`. This call should be **ignored** if the user is already in that group, or if the group does not exist.
- `void sendGroupMessage(int fromUser, int groupId, String message)` Sends a message with the text `message` by the user with id: `fromUser` to the group with id: `groupId`. The message should be sent to all members of the group **except** the sender. Users added afterwards to the group should **not** receive the message. Also, this call should be **ignored** if the user is not a part of the group, or if the group does not exist.
- `List<String> getMessagesForUser(int userId)` Returns all the personal and group messages that were sent to the user with id: `userId` ordered by the **latest** ones first.

### Example 1:

```
Input
["WhatsApp", "createGroup", "sendMessage", "sendMessage", "getMessagesForUser", "sendGroupMessage", "getMessagesForUser", "addUserToGroup", "sendGroupMessage", "getMessagesForUser", "getMessagesForUser"]
[[], [[1, 2, 3]], [2, "hellotwo"], [4, "hellofour"], [2], [1, 1, "helloeveryone"], [2], [1, 4], [1, 1, "seeyousoon"], [2], [4]]

Output
[null, 1, null, null, ["hellotwo"], null, ["helloeveryone", "hellotwo"], null, null, ["seeyousoon", "helloeveryone", "hellotwo"], ["seeyousoon", "hellofour"]]

Explanation
WhatsApp whatsApp = new WhatsApp();
whatsApp.createGroup([1, 2, 3]); // return 1
                                 // The first group is created containing the users [1,2,3].
                                 // Since it is the first group, its id will be 1.
whatsApp.sendMessage(2, "hellotwo"); // User 2 receives a personal message "hellotwo".
whatsApp.sendMessage(4, "hellofour"); // User 4 receives a personal message "hellofour".
whatsApp.getMessagesForUser(2); // return ["hellotwo"]
                                // User 2 only received the message "hellotwo" so far.
whatsApp.sendGroupMessage(1, 1, "helloeveryone"); // User 1 sends a message to group 1.
                                                  // So both users 2 and 3 receive the message.
whatsApp.getMessagesForUser(2); // return ["helloeveryone", "hellotwo"]
                                // Two messages were sent to user 2 so far.
whatsApp.addUserToGroup(1, 4); // User 4 is added to group 1.
whatsApp.sendGroupMessage(1, 1, "seeyousoon"); // User 1 sends a message to group 1.
                                               // So users 2, 3, and 4 receive the message.
whatsApp.getMessagesForUser(2); // return ["seeyousoon", "helloeveryone", "hellotwo"]
                                // Three messages were sent to user 2.
whatsApp.getMessagesForUser(4); // return ["seeyousoon", "hellofour"]
                               // Two messages were sent to user 4, so we return them.
                               // Note that user 4 did not receive the message "helloeveryone".
```

### Constraints:

- `1 <= userId <= 1000`
- `1 <= message.length <= 100`
- The ids in `initialUsers` are distinct.
- At most `100` personal messages will be sent to each user.
- At most `100` groups will be created.
- At most `100` users will be in each group.
- At most `50` messages will be sent to each group.
- At most `100` calls will be made to `getMessagesForUser`.
- `message` consists of only lowercase English letters.



### Hint #1

Keep track of the personal messages sent to each user.



### Hint #2

When sending a group message, it is equivalent to sending a personal message to each user in the group except to the sender.



### Solution

```java
/**
 * Your WhatsApp object will be instantiated and called as such:
 * WhatsApp obj = new WhatsApp();
 * obj.sendMessage(toUser,message);
 * int param_2 = obj.createGroup(initialUsers);
 * obj.addUserToGroup(groupId,userId);
 * obj.sendGroupMessage(fromUser,groupId,message);
 * List<String> param_5 = obj.getMessagesForUser(userId);
 */
class WhatsApp {
    Map<Integer, User> users;
    Map<Integer, Group> groups;
    IdGen groupIds;

    public WhatsApp() {
        users = new HashMap<>();
        groups = new HashMap<>();
        groupIds = new IdGen();
    }
    
    public void sendMessage(int toUser, String message) {
        User receiver = getAndPut(toUser);
        receiver.receiveMessage(new Message(message));
    }
    
    public int createGroup(int[] initialUsers) {
        List<User> initial = new ArrayList(initialUsers.length);
        for(int userId : initialUsers) {
            initial.add(getAndPut(userId));
        }
        int id = groupIds.genId();
        Group newGroup = new Group(initial);
        groups.put(id, newGroup);
        return id;    
    }
    
    public void addUserToGroup(int groupId, int userId) {
        if(!groups.containsKey(groupId)) {
            return;
        }
        Group group = groups.get(groupId);
        User user = getAndPut(userId);
        group.addMember(user);
    }
    
    public void sendGroupMessage(int fromUser, int groupId, String message) {
        if(!groups.containsKey(groupId)) {
            return;
        }
        User sender = getAndPut(fromUser);
        groups.get(groupId).sendToMembers(sender, new Message(message));
    }
    
    public List<String> getMessagesForUser(int userId) {
        return getAndPut(userId).getMessages()
            .stream()
            .map(m -> m.getContents())
            .toList();
    }
    
    private User getAndPut (int userId){
        return users.computeIfAbsent(userId, id -> new User());
    }
}

class IdGen{
    int next;
    
    public IdGen(){
        next = 1;
    }
    
    public int genId(){
        return next++;
    }
}

class User{
    List<Message> messages;
    
    public User(){
        messages = new LinkedList<>();
    }
    
    public void receiveMessage(Message msg){
        messages.add(0, msg);
    }
    
    public List<Message> getMessages(){
        return messages;
    }
}

class Group{
    List<User> members;
    
    public Group(List<User> initialMembers){
        members = new LinkedList<>();
        members.addAll(initialMembers);
    }
    
    public void addMember(User user){
        if(!isMember(user)) {
            members.add(user);
        }
    }
    
    public void sendToMembers(User sender, Message msg){
        if(!isMember(sender)) {
            return;
        }
        for(User member : members){
            if(sender != member) {
                member.receiveMessage(msg);
            }
        }
    }
    
    private boolean isMember(User user){
        return members.contains(user);
    }
}

class Message{
    String contents;
    
    public Message(String contents){
        this.contents = contents;
    }
    
    public String getContents(){
        return contents;
    }
}

```
