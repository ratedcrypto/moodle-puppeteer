require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment');
const csv = require('csvtojson');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { clickByText } = require('./util');

// Magic begins
console.log(`Execution commenced at ${moment().format()}`);

// Configs
const siteUrl = process.env.SITE_URL;
const userName = process.env.USERNAME;
const password = process.env.PASSWORD;
const timestamp = moment().unix();
const courseFullName = `${process.env.COURSE_PREFIX}${timestamp}`;
const courseShortName = `LA${timestamp}`;
const role = process.env.ASSIGNED_ROLE;
const restoreQuizFilePath = process.env.QUIZ_FILE_PATH;
const inputUsersFilePath = process.env.USERS_FILE_PATH;
const outputUsersFilePath = './output/users.csv';
const outputQuizURLFilePath = './output/url.txt';

console.log(`Site URL: ${siteUrl}`);
console.log(`Course full name: ${courseFullName}`);
console.log(`Course short name: ${courseShortName}`);
console.log(`Role: ${role}`);
console.log(`Quiz file: ${restoreQuizFilePath}`);
console.log(`Users file: ${inputUsersFilePath}`);
console.log(`Users CSV creation commenced at ${moment().format()}`);

// Create users CSV
const csvWriter = createCsvWriter({
  path: outputUsersFilePath,
  header: [
    { id: 'username', title: 'username' },
    { id: 'firstname', title: 'firstname' },
    { id: 'lastname', title: 'lastname' },
    { id: 'email', title: 'email' },
    { id: 'password', title: 'password' },
    { id: 'city', title: 'city' },
    { id: 'country', title: 'country' },
    { id: 'course1', title: 'course1' },
    { id: 'role1', title: 'role1' },
  ],
});

csv()
  .fromFile(inputUsersFilePath)
  .then((json) => {
    let users = JSON.parse(JSON.stringify(json));
    users.forEach((row) => {
      // Change course.
      row.course1 = courseShortName;
      // Change role.
      row.role1 = role;
    });
    csvWriter
      .writeRecords(users)
      .then(() =>
        console.log(`Users CSV was written successfully ${moment().format()}`)
      );
  });

(async () => {
  // Set launch options
  let launchOptions = {
    headless: true,
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
  };

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  // Set default timeout
  await page.setDefaultTimeout(60000);
  //Change default navigation time
  await page.setDefaultNavigationTimeout(60000);

  // Set viewport and user agent (just in case for nice viewing)
  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
  );

  // Go to the target web
  await page.goto(siteUrl);

  // Login user
  await page.waitForSelector('#login');
  await page.type('#username', userName);
  await page.type('#password', password);
  await page.click('#loginbtn');

  // Open navigation drawer
  const navDrawer = await page.$('.nav-link');
  const expanded = await page.evaluate((obj) => {
    return obj.getAttribute('aria-expanded');
  }, navDrawer);
  if (expanded === 'false') {
    await page.click('.nav-link');
  }

  // Click site administration
  await page.waitForSelector('a[data-key=sitesettings]');
  await clickByText(page, 'Site administration', 'span');

  // Click courses
  await page.waitForSelector('input[name=search');
  await clickByText(page, 'Courses');

  // Open manage courses and categories
  await clickByText(page, 'Manage courses and categories');
  // await page.waitForTimeout(1000);

  // Create new course
  await page.waitForXPath(
    '//*[@class="listing-actions course-listing-actions"]/a'
  );
  let courseActions = await page.$x(
    '//*[@class="listing-actions course-listing-actions"]/a'
  );
  await courseActions[0].click();
  await page.waitForSelector('input[name=saveandreturn]');
  await page.type('input[name=fullname]', courseFullName);
  await page.type('input[name=shortname]', courseShortName);
  await page.click('input[name=saveandreturn]');

  // Go to site home
  await page.waitForSelector('a[data-key=home]');
  await clickByText(page, 'Site home', 'span');
  await page.waitForTimeout(2000);

  // Cick restore to restore a quiz
  await page.waitForSelector('#dropdown-2');
  await page.click('#dropdown-2');
  await clickByText(page, 'Restore');
  // Upload file
  await page.waitForSelector('input[name=backupfilechoose]');
  await page.click('input[name=backupfilechoose]');
  await clickByText(page, 'Upload a file', 'span');
  await page.waitForSelector('input[type=file]');
  // Get the ElementHandle of the selector above
  const restoreQuizInputUploadHandle = await page.$('input[type=file]');
  // Sets the value of the file input to fileToUpload
  restoreQuizInputUploadHandle.uploadFile(restoreQuizFilePath);
  // Upload this file
  await page.waitForSelector('input[name=author]');
  await clickByText(page, 'Upload this file', 'button');
  // Click restore button
  await page.waitForXPath('//*[@id="id_submitbutton"]');
  let restoreButton = await page.$x('//*[@id="id_submitbutton"]');
  await restoreButton[0].click();
  await page.waitForTimeout(2000);
  // Click continue button
  await page.waitForSelector('button[type=submit]');
  await page.click('button[type=submit]');
  // Search a course
  await page.waitForSelector('input[name=search]');
  await page.type('input[name=search]', courseShortName);
  await page.click('input[name=searchcourses]');
  await page.click('input[name=targetid]');
  // Click continue button
  await page.waitForSelector('input[value=Continue]');
  await page.click('input[value=Continue]');
  // Click submit button
  await page.waitForSelector('input[name=submitbutton]');
  await page.click('input[name=submitbutton]');
  // Click submit button
  await page.waitForSelector('input[name=submitbutton]');
  await page.click('input[name=submitbutton]');
  // Click submit button
  await page.waitForSelector('input[name=submitbutton]');
  await page.click('input[name=submitbutton]');
  // Click submit button
  await page.waitForSelector('button[type=submit]');
  await page.click('button[type=submit]');
  // Get a quiz url
  const quizUrl = await page.url();
  console.log(`Quiz URL: ${quizUrl}`);
  // Save in a file
  fs.writeFile(outputQuizURLFilePath, quizUrl, function (err) {
    if (err) return console.log(err);
    console.log(`Quiz URL was written successfully ${moment().format()}`);
  });

  // Go to site administration
  await page.waitForSelector('a[data-key=sitesettings]');
  await clickByText(page, 'Site administration', 'span');

  // Click Users
  await page.waitForSelector('input[name=query]');
  await clickByText(page, 'Users');
  // Click upload users
  let uploadUsers = await page.$x(
    '//*[@id="linkusers"]/div/div[2]/div[2]/ul/li[7]/a'
  );
  await uploadUsers[0].click();

  // Enrol users
  await page.waitForSelector('input[name=userfilechoose]');
  await page.click('input[name=userfilechoose]');
  await page.waitForSelector('input[type=file]');
  // Get the ElementHandle of the selector above
  const uploadUsersInputUploadHandle = await page.$('input[type=file]');
  // Sets the value of the file input to fileToUpload
  uploadUsersInputUploadHandle.uploadFile(outputUsersFilePath);

  // Upload this file
  await page.waitForSelector('input[name=author]');
  await clickByText(page, 'Upload this file', 'button');
  await page.waitForTimeout(2000);

  // Click submit button
  await page.waitForXPath('//*[@id="id_submitbutton"]');
  let submitButton = await page.$x('//*[@id="id_submitbutton"]');
  await submitButton[0].click();
  await page.waitForTimeout(2000);

  // Click continue button
  await page.waitForSelector('#id_uutype');
  await page.select('#id_uutype', '3');
  await page.click('input[name=submitbutton]');

  // Click continue button
  await page.waitForSelector('button[type=submit]');
  await page.click('button[type=submit]');

  //Implicit wait..
  await page.waitForTimeout(20000);

  // Magic ends
  console.log(`Execution completed successfully at ${moment().format()}`);

  // Close the browser
  await browser.close();
})();
