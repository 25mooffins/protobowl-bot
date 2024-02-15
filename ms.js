var http = require('http');
var {By, Builder, Key} = require('selenium-webdriver');
var fs = require('fs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const loopTime = 200;
const websiteName = 'https://protobowl.com/test';
//0 is collecting data, 1 is answering mode
const mode = 1;
const natty = true;

let driver = new Builder()
        .forBrowser('chrome')
        .build();

driver.get(websiteName);

// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   res.end();
// }).listen(8080);
let parsedData;


setTimeout(init, 5000);
console.log('done');

let nameId;
let answerId;
var name = '';
var answer = '';
var lastName = '';
function init(){
  if(mode == 0){
    console.log("amount: ");
    fs.readFile("./questions.json", (error, data) => {
      let parsedData = JSON.parse(data);
      console.log(Object.keys(parsedData).length);
      console.log("total questions: 1281");
    });
    
    spam();
  }
  else if(mode == 1){
    fs.readFile("./questions.json", (error, data) => {
      parsedData = JSON.parse(data);
    });
    readline.question('start?', answer =>{
      setTimeout(main,3000);
      readline.close();
    })
    
  }
}



var resetSpam = true;
function spam(){
  driver.actions()
    .sendKeys('s')
    .perform();
  setTimeout(function(){
    getNameIdAndAnswer(2);
    fs.readFile("./questions.json", (error, data) => {
      parsedData = JSON.parse(data);
      if(name in parsedData){
        console.log('seen');
      }
      else{
        parsedData[name] = answer;
        fs.writeFile("./questions.json", JSON.stringify(parsedData, null, "\t"), (error) => {});
      }
      
    })
  }, 1200);
  setTimeout(spam, 1800);
}

function getNameIdAndAnswer(pos){
  let history = driver.findElement(By.xpath('/html/body/div[4]/div[1]/div[1]/div[3]/div['+pos+']'));

  //this returns a promise of list of elements
  let a = driver.findElements(By.xpath('/html/body/div[4]/div[1]/div[1]/div[3]/div['+pos+']/ul/ul/li[last()]/span[1]'));
  a.then(function(value){
    if(value.length < 1){
      a = driver.findElement(By.xpath('/html/body/div[4]/div[1]/div[1]/div[3]/div['+pos+']/ul/ul/li[last()]'));
      answerId = a.getText();
    }
    else{
      answerId = value[0].getText();
    }
    answerId.then(function(v){
      answer = v;
    })
    if(answer.length == 1){
      a = driver.findElement(By.xpath('/html/body/div[4]/div[1]/div[1]/div[3]/div['+pos+']/ul/ul/li[last()]'));
      answerId = a.getText();
      answerId.then(function(v){
        answer = v;
      })
    }
    console.log(answer);
    
  })
  nameId = history.getAttribute('class');
  nameId.then(function(value){
    name = value;
    name = name.replace(" revealed", "");
  })  
}
function getName(){
  let history = driver.findElement(By.xpath('/html/body/div[4]/div[1]/div[1]/div[3]/div[1]'));
  nameId = history.getAttribute('class');
  nameId.then(function(value){
    lastName = name;
    name = value;
  })
}

function main(){
  
  if(mode == 1){// answer
    getName();
    if(lastName != name){
      if (name.includes('active')){
        var removedName = name.replace(" active", "");
        if(removedName in parsedData){
          var data = '';
          data =parsedData[removedName];
          console.log(data);
          if(natty){
            nattyInputs(data);
          }
          else{
            notNattyInputs(data);
          }
        }
      }
    }
  }
  setTimeout(main, loopTime);
  
}

function nattyInputs(data = ''){
  data = data.toLowerCase();
  setTimeout(function(){
    driver.actions()
      .keyDown(Key.SPACE)
      .perform();
    var total = 0;
    setTimeout(function(){
      for(let i = 0; i < data.length; i++){
        
        total+=(Math.random()+1)*100;
        setTimeout(function(){
          var char = data[i];
          driver.actions()
            .sendKeys(char)
            .perform();
        }, total)
      }
      setTimeout(function(){
        driver.actions()
          .keyDown(Key.ENTER)
          .perform();
      }, total + 100)
    }, 1000)
  },(Math.random()+1)*1000); //1.5s - 2.5s
}
function notNattyInputs(data){
  driver.actions()
    .keyDown(Key.SPACE)
    .perform();
  setTimeout(function(){
    driver.actions()
      .sendKeys(data)
      .perform();
    console.log('yes');
  }, 1000)
  setTimeout(function(){
    driver.actions()
      .keyDown(Key.ENTER)
      .perform();
  }, 1100)
}