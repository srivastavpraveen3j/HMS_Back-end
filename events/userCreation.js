// events/namespaceEvents.js
import eventBus from "../lib/eventBus.js"; 
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import User from "../models/user.js";

/**
 * 🚀 EVENT CHAIN:
 * namespace.created -> namespace.seed.permissions -> permission.created -> namespace.seed.roles
 * -> role.created -> namespace.seed.users -> user.created -> user.role.assigned -> role.permission.assigned
 */

// 1️⃣ Namespace Created → Seed Permissions
eventBus.on("namespace.created", async (namespace) => {
  console.log(`🌍 Namespace created: ${namespace.name}`);
  eventBus.emit("namespace.seed.permissions", namespace);
});

// 2️⃣ Seed Permissions → Emit permission.created
eventBus.on("namespace.seed.permissions", async (namespace) => {
  console.log(`⚙️ Seeding default permissions for namespace: ${namespace.name}`);

  const defaultPermissions = [
    { name: "read:any", namespace: namespace._id },
    { name: "write:any", namespace: namespace._id },
    { name: "delete:any", namespace: namespace._id },
  ];

  const permissions = await Permission.insertMany(defaultPermissions);
  console.log("✅ Permissions created");

  eventBus.emit("permission.created", { namespace, permissions });
});

// 3️⃣ Permission Created → Seed Roles
eventBus.on("permission.created", async ({ namespace, permissions }) => {
  console.log(`🛠 Creating roles for namespace: ${namespace.name}`);

  const roles = await Role.insertMany([
    { name: "SuperAdmin", namespace: namespace._id },
    { name: "Admin", namespace: namespace._id },
    { name: "Staff", namespace: namespace._id },
  ]);

  console.log("✅ Roles created");
  eventBus.emit("role.created", { namespace, roles, permissions });
});

// 4️⃣ Role Created → Seed Users
eventBus.on("role.created", async ({ namespace, roles, permissions }) => {
  console.log(`👤 Creating users for namespace: ${namespace.name}`);

  const users = await User.insertMany([
    { name: "Super Admin User", email: "super@hims.com", namespace: namespace._id, role: roles[0]._id },
    { name: "Admin User", email: "admin@hims.com", namespace: namespace._id, role: roles[1]._id },
  ]);

  console.log("✅ Users created");
  eventBus.emit("user.created", { namespace, users, roles, permissions });
});

// 5️⃣ User Created → Assign Roles
eventBus.on("user.created", async ({ namespace, users, roles, permissions }) => {
  console.log(`🔑 Assigning roles to users in namespace: ${namespace.name}`);

  // Already assigned during creation, but you can update if needed
  for (let user of users) {
    console.log(`➡️ User ${user.email} assigned to role ${user.role}`);
  }

  eventBus.emit("user.role.assigned", { namespace, users, roles, permissions });
});

// 6️⃣ Role Assigned → Assign Permissions
eventBus.on("user.role.assigned", async ({ namespace, users, roles, permissions }) => {
  console.log(`📜 Assigning permissions to roles in namespace: ${namespace.name}`);

  for (let role of roles) {
    // attach all permissions (example)
    role.permissions = permissions.map((p) => p._id);
    await role.save();
    console.log(`➡️ Role ${role.name} assigned permissions`);
  }

  eventBus.emit("role.permission.assigned", { namespace, users, roles, permissions });
});

// 7️⃣ Role Permission Assigned
eventBus.on("role.permission.assigned", ({ namespace }) => {
  console.log(`🎉 Seeding complete for namespace: ${namespace.name}`);
});
