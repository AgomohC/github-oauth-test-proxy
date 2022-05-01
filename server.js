require("dotenv").config();
const axios = require("axios");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use((req, res, next) => {
   res.header("Access-Control-Allow-Origin", "*");
   next();
});
app.get("/", (req, res) => {
   res.send("<header><h1>Github Oauth Test</h1></header>");
});
const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;

app.get("/api/:code", async (req, res) => {
   const { code } = req.params;
   console.log(req.url);

   try {
      const { data } = await axios.post(
         `https://github.com/login/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${code}`
         // `https://github.com/login/oauth/access_token?client_id=${client_id}&redirect_uri=https://github-oauth-test.vercel.app/login&client_secret=${client_secret}&code=${code}`
      );

      let params = new URLSearchParams(data);

      const access_token = params.get("access_token");

      if (access_token) {
         const response = await axios(`https://api.github.com/user`, {
            headers: {
               Authorization: `token ${access_token}`,
            },
         });
         if (response) {
            let repos = await axios(response.data.repos_url);
            repos = repos.data;
            console.log(repos);
            return res.status(200).json({ repos });
         }
      }
   } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong" });
   }
});

app.use((req, res) => {
   res.status(404).type("text").send("route not found");
});

const port = process.env.PORT || 8080;
const start = () => {
   try {
      app.listen(port, () => {
         console.log(`app is listening on  port ${port}`);
      });
   } catch (error) {
      console.log(error.message);
   }
};
start();
