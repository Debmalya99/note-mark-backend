const fs = require('fs');
const express = require('express')
const cors = require('cors');
const app = express()
var bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const local = true; // set to false when hosting on heroku
const port = (local)?3000:process.env.PORT;

db_document_str = fs.readFileSync(__dirname+'/data/database.json');
db_document = JSON.parse(db_document_str);

saveFile = function(filename,data){
  fs.writeFileSync(__dirname + '/'+'data/'+filename +'.md',data);
}

function getNoteFromTag(db,tag,notes){
  // notes should be an array
  for( const key in db){
    if(db[key].tags.indexOf(tag) !== -1){
      notes.push({id:key,name:db[key].name});
    }
  }
  // return notes;
}

function getNoteFromName(db,_name,notes){
  for(const key in db){
    if(_name === db[key].name){
      notes.push({id:key,name:_name})
    }
  }
}

app.get('/', (req, res) => {
  res.send('<h1>Welcome to notemark backend server index route</h1>')
})



app.post('/savenote',(req,res)=>{
  // console.log(req.body);
  saveFile(req.body.id,req.body.note);
  db_document[req.body.id] = {name:req.body.name,file:req.body.id+'.md',tags:req.body.tags}
  console.log(db_document);
  fs.writeFileSync(__dirname+'/data/'+'database.json',JSON.stringify(db_document,null,2));
  res.send('Recieved data')
})

app.get('/getnotes',(req,res)=>{
  var note_names = []
  var note_id = []
  for(k in db_document){
    note_names.push(db_document[k].name)
    note_id.push(k)
  }
  res.json({names:note_names,id:note_id})
})

app.get('/getnote/:id',(req,res)=>{
  md_filename = req.params.id+'.md';
  console.log(md_filename);
  doc_name = db_document[req.params.id].name;
  md_data = fs.readFileSync(__dirname+'/data/'+md_filename,'utf-8');
  doc_tags = db_document[req.params.id].tags;
  res.json({name:doc_name,data:md_data,tags:doc_tags});
})

app.post('/searchnotes',(req,res)=>{
  var search_array = []
  search_terms_list = req.body.string.trim().split(' ');
  search_terms_list.forEach(element=>{
    if(element[0] === '#'){
        getNoteFromTag(db_document,element.slice(1),search_array)
    }
    else{
      getNoteFromName(db_document,element,search_array);
    }
  });
  var uniq_set = new Set(search_array);
  var search_uniq = Array.from(uniq_set);
  res.json({searchresult:search_uniq})
})

app.delete('/delete/:id',(req,res)=>{
  delete db_document[req.params.id]
  fs.writeFile(__dirname+'/data/database.json',JSON.stringify(db_document),()=>{
    console.log("Updated the database after delete operation ");
  })
  fs.unlink(__dirname+'/data/'+req.params.id+'.md',err=>{
    // console.log("ERROR: Failed to delete",req.params.id+'.md');
    console.log(err);
    return;
  })
  res.send('Deleted '+req.params.id);
})

app.listen(port, () => {
  // for(const k in db_document){
  //   console.log(db_document[k].tags);
  // }
  
  console.log(`Notemark backend server listening at http://localhost:${port}`)
  
})