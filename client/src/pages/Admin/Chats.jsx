import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import AdminTopbar from "../../components/Admin/AdminTopbar";
import SideBar from "../../components/Admin/SideBar";
import "../../styles/Admin/ChatsPage.css";

const conversations = [
  {
    id: 1,
    name: "Sarah Jenkins (Agent)",
    avatar: "https://i.pravatar.cc/80?img=47",
    role: "Agent",
    lastMessage: "The delivery at sector 4 is complete. All packages accounted for.",
    time: "10:42 AM",
    status: "Active now",
    unread: 0,
    messages: [
      { direction: "received", text: "Hi Admin, I'm currently at sector 4. The distribution is going smoothly.", time: "10:15 AM" },
      { direction: "sent", text: "Excellent. Have you encountered any issues with the delivery?", time: "10:30 AM" },
      { direction: "received", text: "No issues. The delivery at sector 4 is complete. All packages accounted for. Heading back to base now.", time: "10:42 AM" },
    ],
  },
  {
    id: 2,
    name: "Mercy Corps (Partner)",
    initials: "MC",
    role: "Partner",
    lastMessage: "We can allocate additional resources for the upcoming initiative.",
    time: "Yesterday",
    status: null,
    unread: 1,
    messages: [
      { direction: "received", text: "We can allocate additional resources for the upcoming initiative.", time: "Yesterday, 3:12 PM" },
      { direction: "sent", text: "Thank you. I will share the updated requirements this afternoon.", time: "Yesterday, 3:25 PM" },
    ],
  },
  {
    id: 3,
    name: "David Chen",
    avatar: "https://i.pravatar.cc/80?img=13",
    role: "Field Agent",
    lastMessage: "Issue with the vehicle routing in zone B.",
    time: "Tue",
    status: null,
    unread: 2,
    messages: [
      { direction: "received", text: "Issue with the vehicle routing in zone B.", time: "Tuesday, 9:04 AM" },
      { direction: "sent", text: "Thanks for flagging it. We are checking an alternate route now.", time: "Tuesday, 9:16 AM" },
    ],
  },
];

const filters = ["All Active", "Field Agents", "Partners"];

function Chats() {
  const [activeFilter, setActiveFilter] = useState("All Active");
  const [selectedConversationId, setSelectedConversationId] = useState(conversations[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const visibleConversations = useMemo(() => {
    if (activeFilter === "Partners") {
      return conversations.filter((conversation) => conversation.role === "Partner");
    }
    if (activeFilter === "Field Agents") {
      return conversations.filter((conversation) => conversation.role !== "Partner");
    }
    return conversations;
  }, [activeFilter]);
  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  ) ?? conversations[0];

  return (
    <div className="admin-chats">
      <AdminTopbar pageClass="admin-chats" searchId="chats-search" placeholder="Search chats..." searchTerm={searchTerm} onSearchChange={(event) => setSearchTerm(event.target.value)} />

      <div className="admin-chats__body">
        <SideBar />
        <main className="admin-chats__main">
          <div className="admin-chats__heading">
            <h1>Messages</h1>
          </div>

          <div className="admin-chats__content-grid">
            <section className="chats-list">
              <div className="chats-list__header">
                <div
                  className="chats-list__filters"
                  role="group"
                  aria-label="Chat filters"
                >
                  {filters.map((filter) => (
                    <button
                      className={`chats-list__filter${activeFilter === filter ? " chats-list__filter--active" : ""}`}
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="chats-list__conversations">
                {visibleConversations.map((conversation) => (
                  <button
                    className={`chats-list__conversation${selectedConversationId === conversation.id ? " chats-list__conversation--selected" : ""}`}
                    key={conversation.id}
                    type="button"
                    aria-pressed={selectedConversationId === conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <div className="chats-list__conversation-avatar">
                      {conversation.avatar ? (
                        <img src={conversation.avatar} alt="" />
                      ) : (
                        <span className="chats-list__conversation-initials">
                          {conversation.initials}
                        </span>
                      )}
                      {conversation.status && (
                        <span className="chats-list__conversation-status">
                          {conversation.status}
                        </span>
                      )}
                      {conversation.unread > 0 && (
                        <span className="chats-list__conversation-unread" aria-label={`${conversation.unread} unread messages`}>
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                    <div className="chats-list__conversation-details">
                      <div className="chats-list__conversation-header">
                        <strong>{conversation.name}</strong>
                        <time>{conversation.time}</time>
                      </div>
                      <p className="chats-list__conversation-message">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="chat-messages">
              <div className="chat-messages__header">
                <div className="chat-messages__participant">
                  {selectedConversation.avatar ? (
                    <img
                      className="chat-messages__participant-avatar"
                      src={selectedConversation.avatar}
                      alt={selectedConversation.name}
                    />
                  ) : (
                    <span className="chat-messages__participant-initials">
                      {selectedConversation.initials}
                    </span>
                  )}
                  <div className="chat-messages__participant-info">
                    <strong>{selectedConversation.name}</strong>
                    <span className="chat-messages__participant-status">
                      <span className="chat-messages__status-dot" />
                      {selectedConversation.status ?? selectedConversation.role}
                    </span>
                  </div>
                </div>
                <span className="chat-messages__date">{selectedConversation.time}</span>
              </div>

              <div className="chat-messages__messages">
                {selectedConversation.messages.map((message, index) => (
                  <div className={`chat-messages__message chat-messages__message--${message.direction}`} key={`${message.time}-${index}`}>
                    {message.direction === "received" && selectedConversation.avatar && (
                      <img className="chat-messages__message-avatar" src={selectedConversation.avatar} alt="" />
                    )}
                    {message.direction === "received" && !selectedConversation.avatar && (
                      <span className="chat-messages__message-initials">{selectedConversation.initials}</span>
                    )}
                    <div className="chat-messages__message-content">
                      <p>{message.text}</p>
                      <time>{message.time}</time>
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-messages__input">
                <FiSearch className="chat-messages__input-icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Type your message..."
                />
                <button className="chat-messages__send-button" type="button" aria-label="Send message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
                  </svg>
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Chats;
