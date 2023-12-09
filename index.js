import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "todoApp",
  password: "password",
  port: 5432,
});
db.connect();



async function getTodo(){
  let items = [];
  const result =await db.query("SELECT * FROM items ORDER BY creation_date ASC")
  result.rows.forEach((item)=>{
    items.push(item)
  })
return items
}

app.get("/", async(req, res) => {
  const result = await getTodo();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: result,
  });
});

app.post("/add", async(req, res) => {
  try{
  const {newItem} = req.body;
  if(newItem == ""){
    return res.redirect('/')
  } 
  await db.query("INSERT INTO items(title) VALUES($1);",[newItem])
  res.redirect('/')
}catch(error){
  console.log(error);
}
}); 

app.post("/edit", async(req, res) => {
  const {updatedItemTitle,updatedItemId} = req.body;
  try{
 await db.query("UPDATE items SET title = $1 WHERE id = $2 ;",[updatedItemTitle,updatedItemId])
  res.redirect('/')
  }catch(error){
    console.log(error);
  }
});

app.post("/delete", async(req, res) => {
  const {deleteItemId} = req.body
  try {
  await db.query("DELETE FROM items WHERE id = $1 ;",[deleteItemId])
  res.redirect('/')
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
