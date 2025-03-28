// verify-password.js
const bcrypt = require('bcrypt');

const password = 'Pass123!';
const storedHash = '$2b$10$MCLZ5w6XCXlmgMbKK2h7..Ui0DKgWI/hoUp/KXtHpwRo784P4tc6O'; // Replace with the hash from the users table

bcrypt.compare(password, storedHash, (err, result) => {
  if (err) {
    console.error('Error comparing password:', err);
  } else {
    console.log('Password match:', result);
  }
});