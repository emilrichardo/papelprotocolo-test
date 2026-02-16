const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"; // Use env var or default to /api

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("binaryFile", file); // Changed from 'file' to 'binaryFile' based on prompt
  formData.append("type", "ocr-scan");

  formData.append("active_functions", "all");

  // Use a default document ID if not provided - prompt implies it's required.
  // We'll use a placeholder or let the user input it?
  // The prompt example has a hardcoded ID: f5fac439-8a5e-48c4-96f2-ed15f3e61488.
  // I will add it as a constant for now or optional param.
  formData.append("document_id", "eddd7373-f3fe-4831-9740-a34976694722");

  const response = await fetch(`${API_BASE_URL}/process-document`, {
    method: "POST",
    headers: {
      // "x-api-key": import.meta.env.VITE_API_KEY, // If needed
      "x-api-key": "test-api-key-123", // Using test key from prompt
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
}

export async function pollJobStatus(jobId) {
  const response = await fetch(
    `${API_BASE_URL}/process-document/status/${jobId}`,
    {
      headers: {
        "x-api-key": "test-api-key-123",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to check status");
  }

  return response.json();
}
