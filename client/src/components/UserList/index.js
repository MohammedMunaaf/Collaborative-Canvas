import React from "react";
import "./index.css";

const UserList = ({ users, currentUser }) => {
  return (
    <div className="user-list">
      <h3>Online Users ({users.length})</h3>
      <div className="users">
        {users.map((user) => (
          <div
            key={user.id}
            className={`user-item ${user.id === currentUser?.id ? "current-user" : ""}`}
          >
            <div
              className="user-color"
              style={{ backgroundColor: user.color }}
            />
            <div className="user-info">
              <div className="user-name">
                {user.username}
                {user.id === currentUser?.id && " (You)"}
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="no-users">No other users online</div>
        )}
      </div>
    </div>
  );
};

export default UserList;
