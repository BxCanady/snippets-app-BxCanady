module.exports = {
  app: {
    name: "snippets",
    apiEndpoint: process.env.API_URL ? `/${process.env.API_URL}` : "/api",
  },
  database: {
    /**
     * after the pipes will be your connection string for MongoDB Atlas which you can get from pressing connect
     * on your collection and then clicking connect to application
     *
     * WARNING: THE DATABASE WILL NOT SEED PROPERTY IF YOU LEAVE THE &w=majority FROM YOUR COPIED CONNECTION
     * STRING
     */

    url:
      process.env.MONGODB_URI ||
      "mongodb+srv://brandoncanady:Zaniya1390@cluster0.hm6w4lj.mongodb.net/snippets?retryWrites=true&w=majority",// DID YOU DELETE THE &w=majority
    /**
     * IF YOUR DATABASE DOES NOT SEED BECAUSE YOU LEFT &w=majority YOU WILL BE PUBLICLY SHAMED
     *
     * ok, maybe not actually, but seriously, you think I can warn you anymore?
     */
    name: process.env.MONGODB_NAME || "snippets",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "jwt-secret",
    tokenLife: "7d",
  },
};
