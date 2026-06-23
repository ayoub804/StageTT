import api from "./api";

// ——— INTERNSHIPS (via /assign-internship + /students + /supervisors + /topics) ———

export const getStudents = () => api.get("/students");
export const getSupervisors = () => api.get("/supervisors");
export const getTopics = () => api.get("/topics");
export const getDepartments = () => api.get("/departments");

export const assignInternship = (data) => api.post("/assign-internship", data);
export const getInternships = () => api.get("/internships");
export const updateInternship = (id, data) => api.put(`/internships/${id}`, data);

// ——— USERS (admin) ———
export const getUsers = () => api.get("/users");

// ——— DASHBOARD / STATISTICS ———
export const getDashboardStats = () => api.get("/dashboard");

// ——— AI PLANNING ———
export const getAIPlan = () => api.get("/ai/plan");
export const generateAIPlan = (data) => api.post("/ai/generate-plan", data);

// ——— TOPICS CRUD (supervisor) ———
export const createTopic = (data) => api.post("/topics", data);
export const updateTopic = (id, data) => api.put(`/topics/${id}`, data);
export const deleteTopic = (id) => api.delete(`/topics/${id}`);

// ——— TASKS CRUD (student) ———
export const getTasks = () => api.get("/tasks");
export const createTask = (data) => api.post("/tasks", data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// ——— DELIVERABLES CRUD ———
export const getDeliverables = () => api.get("/deliverables");
export const uploadDeliverable = (formData) =>
  api.post("/deliverables", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const downloadDeliverable = (id) =>
  api.get(`/deliverables/${id}/download`, { responseType: "blob" });
export const deleteDeliverable = (id) => api.delete(`/deliverables/${id}`);
export const validateDeliverable = (id) => api.patch(`/deliverables/${id}/validate`);
export const rejectDeliverable = (id) => api.patch(`/deliverables/${id}/reject`);

// ——— NOTIFICATIONS ———
export const getNotifications = () => api.get("/notifications");
export const markNotificationRead = (id) => api.put(`/notifications/${id}`, { is_read: true });
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// ——— CONVERSATIONS ———
export const getConversations = () => api.get("/conversations");
export const createConversation = (data) => api.post("/conversations", data);
export const getConversation = (id) => api.get(`/conversations/${id}`);

// ——— MESSAGES ———
export const getMessages = (conversationId) => api.get("/messages", { params: { conversation_id: conversationId } });
export const sendMessage = (data) => api.post("/messages", data);
export const deleteMessage = (id) => api.delete(`/messages/${id}`);
