import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
const BASE = "http://localhost:5000/api/v1";
const email = `smoke-client-${Date.now()}@test.dev`;
const suffix = `smoke-${Date.now()}`;
let companyId;
let userId;
let roleId;
let membershipId;
let token = "";
async function api(path, method = "GET", body) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try {
        json = JSON.parse(text);
    }
    catch {
        json = text;
    }
    return { status: res.status, json };
}
function log(label, status, json) {
    console.log(`[${status}] ${label}`);
    if (status >= 400)
        console.log("  ->", JSON.stringify(json));
}
async function setup() {
    const company = await prisma.company.create({
        data: {
            name: `Smoke Company ${suffix}`,
            slug: `smoke-${suffix}`.toLowerCase(),
            email,
            phone: "0000000000",
            address: "test",
        },
    });
    companyId = company.id;
    const role = await prisma.role.create({
        data: {
            companyId,
            name: `Smoke Role ${suffix}`,
        },
    });
    roleId = role.id;
    const perms = await prisma.permission.findMany({
        where: { name: { in: ["client.create", "client.get", "client.update", "client.delete", "Sidebar Client"] } },
    });
    await prisma.rolePermission.createMany({
        data: perms.map((p) => ({ roleId, permissionId: p.id })),
    });
    const hashed = await bcrypt.hash("SmokePass@123", 10);
    const user = await prisma.user.create({
        data: { name: "Smoke User", email, password: hashed },
    });
    userId = user.id;
    const membership = await prisma.membership.create({
        data: { userId, companyId, roleId, status: "ACTIVE" },
    });
    membershipId = membership.id;
    const login = await api("/auth/login", "POST", { email, password: "SmokePass@123" });
    log("login", login.status, login.json);
    if (login.status !== 200 || !login.json?.token) {
        throw new Error(`Login failed: ${JSON.stringify(login.json)}`);
    }
    token = login.json.token;
}
async function run() {
    const create = await api("/client", "POST", {
        name: "Acme Corp",
        companyName: "Acme Ltd",
        email: "acme@test.dev",
        phone: "01712345678",
        address: "Dhaka, Bangladesh",
        contactPerson: "Rahim Uddin",
        status: "ACTIVE",
    });
    log("POST /client (create)", create.status, create.json);
    const client = create.json?.data?.client || create.json?.data;
    const id = client?.id;
    if (!id)
        throw new Error("Create did not return client id");
    const list = await api("/client?page=1&limit=10&search=Acme");
    log("GET /client (list+search)", list.status, list.json);
    if (list.json?.data?.clients?.length < 1)
        throw new Error("List empty");
    const getOne = await api(`/client/${id}`);
    log(`GET /client/${id}`, getOne.status, getOne.json);
    const update = await api(`/client/${id}`, "PUT", { status: "INACTIVE", contactPerson: "Karim Uddin" });
    log(`PUT /client/${id}`, update.status, update.json);
    const dup = await api("/client", "POST", { name: "Acme Corp" });
    log("POST /client (duplicate name)", dup.status, dup.json);
    const del = await api(`/client/${id}`, "DELETE");
    log(`DELETE /client/${id}`, del.status, del.json);
    const afterDelete = await api("/client?page=1&limit=10&search=Acme");
    log("GET /client (after soft delete)", afterDelete.status, afterDelete.json);
}
async function cleanup() {
    if (companyId) {
        await prisma.client.deleteMany({ where: { companyId } });
    }
    if (membershipId) {
        await prisma.membership.delete({ where: { id: membershipId } }).catch(() => { });
    }
    if (roleId) {
        await prisma.rolePermission.deleteMany({ where: { roleId } }).catch(() => { });
        await prisma.role.delete({ where: { id: roleId } }).catch(() => { });
    }
    if (userId) {
        await prisma.user.delete({ where: { id: userId } }).catch(() => { });
    }
    if (companyId) {
        await prisma.company.delete({ where: { id: companyId } }).catch(() => { });
    }
    console.log("cleanup done");
}
setup()
    .then(run)
    .catch((e) => {
    console.error("SMOKE TEST FAILED:", e.message || e);
    process.exitCode = 1;
})
    .finally(() => cleanup().catch((e) => console.error("cleanup error:", e.message)));
