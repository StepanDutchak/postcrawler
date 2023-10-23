module.exports = {
  secret: "bezkoder-secret-key",
  jwtExpiration: 2629000,         // 1 hour
  jwtRefreshExpiration: 31536000, // 24 hours

  /* for test */
  // jwtExpiration: 60,          // 1 minute
  // jwtRefreshExpiration: 120,  // 2 minutes
};