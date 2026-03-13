export async function getAdminToken() {
  const adminToken = localStorage.getItem("mlc_admin_token") || "";
  if (!adminToken) {
    throw new Error("Not authenticated");
  }
  return adminToken;
}
