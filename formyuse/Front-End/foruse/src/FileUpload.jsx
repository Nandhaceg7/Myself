import { useState } from "react";
import axios from "axios";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("http://localhost:5000/upload", formData);
    setMsg(res.data.message);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload Any File</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br />
      <br />

      <button onClick={handleUpload}>Upload</button>

      <p>{msg}</p>
    </div>
  );
}
