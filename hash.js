import bcrypt from "bcrypt";

const password = "aF231245493";

const hash = await bcrypt.hash(password, 10);
console.log(hash);
