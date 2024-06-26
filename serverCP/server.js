const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
require("dotenv").config();
const {google} = require('googleapis');
const path = require("path");
const cron = require('node-cron');
const { parse } = require('json2csv');
const LeadChatbot = require('./models/leadChatbot');
const {authenticate} = require('@google-cloud/local-auth');
const Token = require("./models/googleToken")
const moment = require('moment');
const { saveLeadChatbotUnusual, saveLeadSMC, saveLeadLuiss } = require('./controllers/chatbot');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const app = express();

mongoose.set('strictQuery', false); 
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DB Connessoo!"))
  .catch((err) => console.log("DB Connection Error ", err));

  app.use(express.static(path.join(__dirname, 'client', 'public')));

app.use(express.json({ limit: "10mb" }));
app.use(cors());

/*async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}*/
/*sync function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}*/

async function exportChatbot(auth) {
  try {
    const dataToUpdate = [];
    const sheets = google.sheets({ version: 'v4', auth });
    const leadChatbots = await LeadChatbot.find();
    leadChatbots.forEach((lead) => {
      const leadData = [
        lead.data ? lead.data : '', 
        lead.fullName,
        lead.nome,
        lead.cognome,
        lead.numeroTelefono,
        lead.email,
        lead.idLead,
        lead.channel,
        lead.appointment_date || '',
        lead.last_interaction,
        lead.conversation_summary || ''
      ];
    
      dataToUpdate.push(leadData);
    });
  
    const resource = {
      values: dataToUpdate,
    };
    sheets.spreadsheets.values.append(
      {
        spreadsheetId: '1q0U8F3YcSQkF9eLVYf3O8Umu6wRWMSwFWvfmXnj_1wI',
        range: 'gpt!A1',
        valueInputOption: 'RAW',
        resource: resource,
      },
      async (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(
            '%d cells updated on range: %s',
            result.data.updates.updatedCells,
            result.data.updates.updatedRange
          );
        }
      }
    );
  } catch (error) {
    console.log(error) 
  }
}

const exportLeadsToCSV = async () => {
  try {
      const leads = await LeadChatbot.find({});
      const csv = parse(leads, {
          fields: ["idLead", "channel", "data", "fullName", "nome", "cognome", "email", "numeroTelefono", "last_interaction", "appointment_date", "conversation_summary", "assigned"]
      });
      fs.writeFileSync('./leadchatbot.csv', csv);
      console.log('File CSV scritto con successo!');
  } catch (error) {
      console.error('Errore durante l\'esportazione dei leads:', error);
  } finally {
      mongoose.connection.close();
  }
};

//exportLeadsToCSV()
app.post('/api/save-chatbot-unusual', saveLeadChatbotUnusual);
app.post('/api/save-chatbot-smc', saveLeadSMC);
app.post('/api/save-chatbot-luiss', saveLeadLuiss);

/*const runDailyJob = () => {
  authorize()
    .then(exportChatbot)
    .catch(console.error);
};*/

//cron.schedule('10 2 * * *', runDailyJob);
const redirect_uris=["http://localhost:8001","http://localhost:8000","https://server-chatbot-ai-production.up.railway.app"]
const scopes = ['https://www.googleapis.com/auth/calendar'];
const CLIENT_SECRET="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"
const CLIENT_ID="321609978941-3tddpomhn02meoudv8k0giqguka5v18m.apps.googleusercontent.com"
const REDIRECT_URI = "http://localhost:8001/oauth2callback";
const serviceAccountAuth = new google.auth.JWT({
  email: 'calendarleadsystem@leadsystem-comparacorsi.iam.gserviceaccount.com',
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/calendar'],
  subject: 'info@funnelconsulting.it'
});

const calendar = google.calendar({ version: 'v3', auth: serviceAccountAuth });
async function findEventByTitleAndDate(title, date) {
  try {
      const events = await calendar.events.list({
          calendarId: 'primary',
          timeMin: moment(date).startOf('day').toISOString(),
          timeMax: moment(date).endOf('day').toISOString(),
          q: title,
          singleEvents: true,
          orderBy: 'startTime',
      });

      const event = events.data.items.find(event => event.summary.includes(title));

      if (event) {
          return event.id;
      } else {
          console.log('Evento non trovato');
          return null;
      }
  } catch (error) {
      console.error('Errore durante la ricerca dell\'evento:', error);
  }
}

async function updateEvent(title, date, newStartDateTime, newEndDateTime) {
  try {
      const eventId = await findEventByTitleAndDate(title, date);

      if (!eventId) {
          console.log('Evento non trovato, impossibile aggiornare.');
          return;
      }

      const event = await calendar.events.get({
          calendarId: 'primary',
          eventId: eventId,
      });

      event.data.start = {
          dateTime: moment(newStartDateTime, 'DD-MM-YY HH:mm').toISOString(),
          timeZone: 'Europe/Rome',
      };
      event.data.end = {
          dateTime: moment(newEndDateTime, 'DD-MM-YY HH:mm').toISOString(),
          timeZone: 'Europe/Rome',
      };

      const updatedEvent = await calendar.events.update({
          calendarId: 'primary',
          eventId: eventId,
          resource: event.data,
      });

      console.log(`Evento aggiornato: ${updatedEvent.data.htmlLink}`);
  } catch (error) {
      console.error('Errore durante l\'aggiornamento dell\'evento:', error);
  }
}

const port = process.env.PORT || 8001;
app.listen(port, () => console.log(`Server is running on port ${port}`));
