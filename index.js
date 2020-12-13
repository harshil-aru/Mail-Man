const http = require('http');
const express=  require('express');
const cred = require('./credentials.json');
const app= express();
const server= http.createServer(app);
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.send','https://www.googleapis.com/auth/gmail.modify','https://mail.google.com/'];
var toke;
var token;

const mp = {};


const {client_secret, client_id, redirect_uris} = cred.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

function authorize() {
  
  return getNewUrl(oAuth2Client);
  
}

function getNewUrl(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  return authUrl;
}

  


function listLabels(token,auth) {

  const gmail = google.gmail({version: 'v1', auth });
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`+" "+`- ${label.messagesTotal}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}

function listmessages(token,auth) {

  const gmail = google.gmail({version: 'v1', auth });
  gmail.users.messages.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.messages;
    if (labels.length) {
      console.log('Mails:');
      labels.forEach((label) => {
        console.log(`- ${label.id}` );
        gmail.users.messages.get({
          userId: 'me',
          id: label.id
        },(err,res)=>{
          const from = res.data.payload.headers;
          if(from.length){
            from.map((obj)=>{
              if(obj.name==="From"){
                if(obj.value in mp){
                  mp.push(label.id);
                }
                else{
                  mp[obj.value]=[];
                  mp[obj.value].push(label.id);
                }
              
              console.log(obj.value);}
            });
          }
        })
      });
    } else {
      console.log('No labels found.');
    }
  });
}

app.get('/del',(req,res)=>{
  const gmail = google.gmail({version: 'v1', auth });
  gmail.users.messages.batchDelete({
    userId: 'me',
    id: mp.req.query.value
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    else res.statusText("Success");
  });
})

app.get('/',(req,res)=>{
  
  res.send('<!DOCTYPE html><html ><head><meta ><meta ><title>Mail Client</title></head><body><a href="/autho">Sign In with Google</a></body></html>');
});

app.get('/autho',(req,res)=>{
  res.redirect(authorize());
});

app.get('/makeway/',(req,res)=>{
  oAuth2Client.getToken(req.query.code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    toke=JSON.stringify(token);
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    
    console.log(toke,oAuth2Client);  
    console.log(req.query.code);

    
    listLabels(toke,oAuth2Client);
    listmessages(toke,oAuth2Client);
    /*const AuthStr = 'Bearer '.concat(toke.access_token); 
    axios.get('https://gmail.googleapis.com/gmail/v1/users/{userId}/messages', { headers: { Authorization: req.query.code } })
    .then(response => {
       // If request is good...
      console.log(response.data);
    })
    .catch((error) => {
      console.log('error ' + error);
      
    });
    */
    
  });
  
  
})









server.listen(3000,console.log('http://localhost:3000'));
