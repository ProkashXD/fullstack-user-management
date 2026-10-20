import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/users";

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  function startEditing(user) {
    setEditingId(user._id);
    setName(user.name);
    setEmail(user.email);
    setAge(String(user.age));
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setName("");
    setEmail("");
    setAge("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const userData = {
      name,
      email,
      age: Number(age),
    };

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      if (editingId) {
        setUsers((previousUsers) =>
          previousUsers.map((user) =>
            user._id === editingId ? data : user
          )
        );

        setSuccess("User updated successfully!");
      } else {
        setUsers((previousUsers) => [...previousUsers, data]);

        setSuccess("User created successfully!");
      }

      cancelEditing();
    } catch (err) {
      setError(err.message);
    } finally{
      setSubmitting(false);
    }
  }

  async function deleteUser(id) {

    setError("");
    setSuccess("");

    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      setUsers((previousUsers) =>
        previousUsers.filter((user) => user._id !== id)
      );

      setSuccess("User deleted successfully!");
    } catch (err) {
      setError(err.message);
    } finally{
      setDeletingId(null);
    }
  }

  return (
    <div>
      <h1>User Management</h1>

      <h2>{editingId ? "Edit User" : "Add User"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          min="1"
          required
        />

        <br /><br />

        <button type="submit" disabled={submitting}>
          {submitting
          ? "Saving..."
          : editingId
          ? "Update User" 
          : "Add User"}
        </button>

        {editingId && (
          <button type="button"
            className="cancel-btn"
            onClick={cancelEditing}>
              Cancel
          </button>
        )}
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && < p style={{ color: "green" }}>{success}</p>}

      <hr />

      <h2>Users From MongoDB</h2>

      <input
        className="search-input"
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Loading users...</p>
      ) : filteredUsers.length === 0 ?(
        <p>No users found.</p>
      ) : (
        filteredUsers.map((user) => (
          <div key={user._id} className="user-card">
            <h3>{user.name}</h3>
            <p>Email: {user.email}</p>
            <p>Age: {user.age}</p>

            <button 
              className="edit-btn"
              onClick={() => startEditing(user)}>
              Edit
            </button>

            <button 
              className="delete-btn"
              onClick={() => deleteUser(user._id)}
              disabled={deletingId === user._id}
            >
              {deletingId === user._id ? "Deleting..." : "Delete"}
            </button>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default App;