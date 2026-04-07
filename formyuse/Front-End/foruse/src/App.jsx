import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Upload,
  Trash2,
  File,
  Download,
  CheckCircle,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import "./App.css";

const API_URL = "https://myself-rl7o.onrender.com";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, loading, success
  const [deleteId, setDeleteId] = useState(null); // Stores ID of file to be deleted

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_URL}/files`);
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadStatus("loading");
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      await axios.post(`${API_URL}/upload`, formData);
      setUploadStatus("success");
      setSelectedFile(null);
      fetchFiles();
      setTimeout(() => setUploadStatus("idle"), 2000);
    } catch (err) {
      alert("Upload failed!");
      setUploadStatus("idle");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/files/${deleteId}`);
      setDeleteId(null);
      fetchFiles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-wrapper">
      {/* 1. UPLOAD STATUS POPUP */}
      {uploadStatus !== "idle" && (
        <div className="overlay">
          <div className="modal-3d">
            {uploadStatus === "loading" ? (
              <>
                <Loader2 className="spinner" size={60} />
                <h2>Syncing...</h2>
              </>
            ) : (
              <>
                <CheckCircle className="check-icon" size={60} />
                <h2>Success!</h2>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="overlay">
          <div className="modal-3d delete-modal">
            <AlertTriangle className="warn-icon" size={60} />
            <h2>Are you sure?</h2>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blobs">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="glass-container">
        <header>
          <h1>
            Cloud<span className="gradient-text">Vault</span>
          </h1>
        </header>

        <section className="upload-box">
          <input
            type="file"
            id="file-input"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            hidden
          />
          <label htmlFor="file-input" className="file-label">
            <div className="upload-icon-wrapper">
              <Upload size={32} />
            </div>
            <span>{selectedFile ? selectedFile.name : "Select File"}</span>
          </label>
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            Upload
          </button>
        </section>

        <div className="table-wrapper">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Name</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f._id} className="file-row">
                  <td className="file-name">{f.name}</td>
                  <td className="actions-cell">
                    <a
                      href={`${API_URL}/uploads/${f.path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="action-btn view"
                    >
                      <Download size={18} />
                    </a>
                    <button
                      onClick={() => setDeleteId(f._id)}
                      className="action-btn delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
