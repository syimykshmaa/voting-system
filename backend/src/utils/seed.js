const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Election = require("../models/Election");

async function seedInitialData() {
  // Seed отключён для избежания стоковых данных
  // Роли: ADMIN, MANAGER, USER доступны для создания пользователей через API
  console.log("Seed skipped - no initial data created");
}

module.exports = { seedInitialData };
