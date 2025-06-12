import React, { useState, useRef } from "react";
import { Mail, Paperclip, Send, AlertCircle } from "lucide-react";

const EmailForm = () => {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    subject: "",
    text: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const isValidGmail = (email) => /^[\w.-]+@gmail\.com$/.test(email);

  const showToast = (message, type) => {
    // Simple toast simulation - you can replace with your toast library
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(selected.type)) {
        showToast(
          "Invalid file type. Use PDF, JPG, PNG, DOC, or DOCX.",
          "error"
        );
        return;
      }
      if (selected.size > maxSize) {
        showToast("File too large (max 5MB).", "error");
        return;
      }
      setFile(selected);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.from) {
      newErrors.from = "From email is required";
    } else if (!isValidGmail(formData.from)) {
      newErrors.from = "Please use a valid Gmail address";
    }

    if (!formData.to) {
      newErrors.to = "To email is required";
    } else if (!isValidGmail(formData.to)) {
      newErrors.to = "Please use a valid Gmail address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.text.trim()) {
      newErrors.text = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = new FormData();
    payload.append("from", formData.from);
    payload.append("to", formData.to);
    payload.append("subject", formData.subject);
    payload.append("text", formData.text);
    if (file) payload.append("attachment", file);

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mail/send`, {
        method: "POST",
        body: payload,
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Email sent successfully!", "success");
        setFormData({ from: "", to: "", subject: "", text: "" });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        showToast(data.message || "Failed to send email.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
  <div className="min-h-screen py-10 px-4 bg-gray-50">
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Email - Flask</h1>
        </div>

        <div className="space-y-6">
          {/* From Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <input
              type="email"
              name="from"
              placeholder="your-email@gmail.com"
              value={formData.from}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.from ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.from && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.from}
              </div>
            )}
          </div>

          {/* To Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <input
              type="email"
              name="to"
              placeholder="recipient@gmail.com"
              value={formData.to}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.to ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.to && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.to}
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              placeholder="Enter email subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.subject ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.subject && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.subject}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              name="text"
              rows="6"
              placeholder="Type your message here..."
              value={formData.text}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                errors.text ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.text && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.text}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachment (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <Paperclip className="w-5 h-5" />
                <span>Click to attach file</span>
              </button>
            </div>

            {file && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">{file.name}</span>
                  <span className="text-xs text-blue-600">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

};

export default EmailForm;
