const {Builder, By, Key, until} = require('selenium-webdriver');

let driver

async function init() {
  driver = await new Builder().forBrowser('firefox').build();
  driver.manage().window().maximize()
  // await api.goToYoutube()
  // await api.searchVideo("spider man")
  // setTimeout(()=>{
  //   api.searchVideo("sweat")
  // },5000)
}


const api = {
  goToYoutube:async ()=>{
    if(!driver){
      await init()
    }
    await driver.get('http://www.youtube.com');
  },
  searchVideo:async (search)=>{
    const searchElem = driver.findElement(By.css("input#search"));
    await searchElem.sendKeys(Key.HOME,Key.chord(Key.SHIFT,Key.END),search,Key.ENTER)
  },
  init,
  close:async ()=>{
    await driver.quit()
  }
};



module.exports = api

