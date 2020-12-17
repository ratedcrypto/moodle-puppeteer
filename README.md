# Puppeteer for loadtest

Puppeteer script to login user, create course, restore quiz and enrol users in Moodle.

## Environment variables

Create .env with following environment variables for local setup.

- **SITE_URL**: Moodle site URL.
- **USERNAME**: Username (admin user preferred).
- **PASSWORD**: Password.
- **COURSE_PREFIX**: Course prefix.
- **QUIZ_FILE_PATH**: Backedup quiz file path.
- **ASSIGNED_ROLE**: Assinged role for enrolment.
- **USERS_FILE_PATH**: Users CSV file path.

## To run this script

```bash
npm install

npm start

SITE_URL=https://eassess-loadtest.catalyst-au.net/my/?saml=off COURSE_PREFIX=LoadTest npm start

```
