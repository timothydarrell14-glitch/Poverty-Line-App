import {
  FiBell,
  FiHelpCircle,
  FiLogOut,
  FiMoon,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { Link } from "react-router-dom";
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
  },
];

const filters = ["All Active", "Field Agents", "Partners"];

function Chats() {
  return (
    <div className="admin-chats">
      <header className="admin-chats__topbar">
        <Link className="admin-chats__brand" to="/admin">
          Poverty Line
        </Link>
        <div className="admin-chats__topbar-content">
          <label className="admin-chats__global-search" htmlFor="chats-search">
            <FiSearch aria-hidden="true" />
            <input
              id="chats-search"
              type="search"
              placeholder="Search chats..."
            />
          </label>
          <div className="admin-chats__topbar-actions">
            <button className="tooltip" type="button" aria-label="Notifications" data-tooltip="Notifications">
              <FiBell aria-hidden="true" />
            </button>
            <button className="tooltip" type="button" aria-label="Help" data-tooltip="Help">
              <FiHelpCircle aria-hidden="true" />
            </button>
            <button className="tooltip" type="button" aria-label="Account" data-tooltip="Account">
              <FiUser aria-hidden="true" />
            </button>
            <button className="tooltip" type="button" aria-label="Theme toggle" data-tooltip="Theme toggle">
              <FiMoon aria-hidden="true" />
            </button>
            <button
              className="admin-chats__logout tooltip"
              type="button"
              aria-label="Logout"
              data-tooltip="Logout"
            >
              <FiLogOut aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

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
                  {filters.map((filter, index) => (
                    <button
                      className={`chats-list__filter${index === 0 ? " chats-list__filter--active" : ""}`}
                      key={filter}
                      type="button"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="chats-list__conversations">
                {conversations.map((conversation) => (
                  <button
                    className="chats-list__conversation"
                    key={conversation.id}
                    type="button"
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
                    </div>
                    <div className="chats-list__conversation-details">
                      <div className="chats-list__conversation-header">
                        <strong>{conversation.name}</strong>
                        <time>{conversation.time}</time>
                      </div>
                      <p className="chats-list__conversation-message">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unread > 0 && (
                        <span className="chats-list__conversation-unread">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="chat-messages">
              <div className="chat-messages__header">
                <div className="chat-messages__participant">
                  <img
                    className="chat-messages__participant-avatar"
                    src="https://i.pravatar.cc/80?img=47"
                    alt="Sarah Jenkins"
                  />
                  <div className="chat-messages__participant-info">
                    <strong>Sarah Jenkins</strong>
                    <span className="chat-messages__participant-status">
                      <span className="chat-messages__status-dot" />
                      Active now
                    </span>
                  </div>
                </div>
                <span className="chat-messages__date">Today</span>
              </div>

              <div className="chat-messages__messages">
                <div className="chat-messages__message chat-messages__message--received">
                  <img
                    className="chat-messages__message-avatar"
                    src="https://i.pravatar.cc/80?img=47"
                    alt="Sarah Jenkins"
                  />
                  <div className="chat-messages__message-content">
                    <p>Hi Admin, I'm currently at sector 4. The distribution is going smoothly.</p>
                    <time>10:15 AM</time>
                  </div>
                </div>

                <div className="chat-messages__message chat-messages__message--sent">
                  <div className="chat-messages__message-content">
                    <p>Excellent. Have you encountered any issues with the delivery?</p>
                    <time>10:30 AM</time>
                  </div>
                </div>

                <div className="chat-messages__message chat-messages__message--received">
                  <img
                    className="chat-messages__message-avatar"
                    src="https://i.pravatar.cc/80?img=47"
                    alt="Sarah Jenkins"
                  />
                  <div className="chat-messages__message-content">
                    <p>No issues. The delivery at sector 4 is complete. All packages accounted for. Heading back to base now.</p>
                    <time>10:42 AM</time>
                  </div>
                </div>
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
